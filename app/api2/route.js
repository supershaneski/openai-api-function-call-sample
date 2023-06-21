import { cookies } from 'next/headers'
import { chatCompletion } from '../../service/openai'
import { isEven } from '../../lib/utils'
import { callMockAPI } from '../../lib/mockapi'

const trim_array = ( arr, max_length = 20 ) => {

    let new_arr = arr
    
    if(arr.length > max_length) {
        
        let cutoff = Math.ceil(arr.length - max_length)
        cutoff = isEven(cutoff) ? cutoff : cutoff + 1
        
        new_arr = arr.slice(cutoff)

    }

    return new_arr

}

const functions = [
    {
        "name": "get_user_inquiry",
        "description": "Get users inquiry",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "The city, place or any location" //, e.g. San Francisco, CA"
                },
                "date": {
                    "type": "string",
                    "description": "The date or day, e.g. 2023-06-19, today, tomorrow"
                },
                "operation": {
                    "type": "array",
                    "description": "Topic of inquiry, e.g. weather, event, hotels",
                    "enum": ["weather", "event", "hotels"],
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": ["location", "date"]
        }
    }
]

const callCompletion = async (messages, functions, temperature = 0) => {

    try {
        //const options = { messages, functions }
        const options = { messages }
        
        if(functions) {
            options.functions = functions
        }

        if (temperature > 0) {
            options.temperature = temperature
        }

        const response = await chatCompletion(options)

        return response

    } catch (error) {

        console.log(error)

        return null

    }
}

const setMessages = (inquiry, previous, system) => {

    let messages = system ? [{ role: 'system', content: system }] : []

    if(Array.isArray(previous)) {
        messages = messages.concat(previous)
    }

    messages.push({ role: 'user', content: inquiry })

    return messages

}

const validateParameters = (args, deflocation, defdate) => {
    
    let location = (args.hasOwnProperty('location') && args.location.length > 0) ? args.location : deflocation
    location = location === 'nearby' || location === 'current' || location === 'tomorrow' ?  deflocation : location
    let date = (args.hasOwnProperty('date') && args.date.length > 0) ? args.date : defdate
    let operation = args.hasOwnProperty('operation') ? args.operation : ['event']
    
    return {
        location, 
        date, 
        operation
    }
}

const setMessageResponse = (msg) => {
    return new Response(JSON.stringify({
        result: { role: 'assistant', content: msg },
    }), {
        status: 200,
    })
}

export async function POST(request) {

    const { system, inquiry, previous } = await request.json()

    if (!system || !inquiry || !Array.isArray(previous)) {
        return new Response('Bad system prompt', {
            status: 400,
        })
    }

    let prev_data = trim_array(previous, 20)

    // get stored parameters
    const cookieStore = cookies()
    const session_var = cookieStore.get('session-var')
    const sessions = typeof session_var !== 'undefined' ? JSON.parse(session_var.value) : {}
    
    const default_location = Object.keys(sessions).length > 0 ? sessions.location : ''
    const default_date = Object.keys(sessions).length > 0 ? sessions.date : ''

    // First, API call
    let messages = setMessages(inquiry, null, 'Make sure that extracted parameters are valid according to the description.')
    let response = await callCompletion(messages, functions)

    if(!response) {
        return setMessageResponse('Unexpected error. Can you please submit your inquiry again?')
    }

    let error_flag = false
    //let response_flag = false
    let iterate_count = 0
    let max_iterate_count = 3 // prevents infinite loop
    
    let func_result = null
    let mock_api_result = null

    do {

        console.log('loop', iterate_count)

        if (response.content !== null) {

            console.log('summarize')

            messages = setMessages(inquiry, prev_data, system)
            
            response = await callCompletion(messages, functions, 0.7)

            if(!response) {

                error_flag = true

                return setMessageResponse('Unexpected error. Can you please submit your inquiry again?')
            
            }

            if(response.content !== null) {

                return new Response(JSON.stringify({
                    result: response,
                }), {
                    status: 200,
                })

            }

            // It is possible that the response here will be function call.
            // In that case, we will process it once more.

        } else {

            console.log("function call", response)

            func_result = response

            let func_args = JSON.parse(func_result.function_call.arguments)

            const { location, date, operation } = validateParameters(func_args, default_location, default_date)
            
            cookieStore.set('session-var', JSON.stringify({
                location,
                date,
            }))
    
            let data = callMockAPI({ location, date, operation })

            mock_api_result = {
                ...data,
                location,
                date
            }

            console.log('mock api result', mock_api_result)

            messages = setMessages(inquiry, prev_data, system)
            messages.push(func_result)
            messages.push({ role: "function", name: "get_user_inquiry", content: JSON.stringify(mock_api_result)})
            
            response = await callCompletion(messages, functions, 0.7)

            if(!response) {

                error_flag = true

                return setMessageResponse('Unexpected error. Can you please submit your inquiry again?')
            
            }

            if(response.content !== null) {

                return new Response(JSON.stringify({
                    result: response,
                }), {
                    status: 200,
                })

            }

            // It is possible that the response here will be function call.
            // In that case, we will process it once more.

        }

        iterate_count++

    } while(!error_flag && !error_flag && iterate_count < max_iterate_count)

    return setMessageResponse('Unexpected error. Can you please submit your inquiry again?')
    
}