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
                    "description": "The city, place or any location, e.g. San Francisco, CA"
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
        const options = { messages, functions }

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

export async function POST(request) {

    const { system, inquiry, previous } = await request.json()
    
    if (!system) {
        return new Response('Bad system prompt', {
            status: 400,
        })
    }

    if (!inquiry) {
        return new Response('Bad inquiry', {
            status: 400,
        })
    }

    if (!Array.isArray(previous)) {
        return new Response('Bad chunks', {
            status: 400,
        })
    }


    // a simplistic way to limit history
    let prev_data = trim_array(previous, 20)
    
    // func call
    let messages = setMessages(inquiry, null, 'Make sure that extracted parameters are valid according to the description.')
    let response = await callCompletion(messages, functions)

    if(!response) {
        
        return new Response(JSON.stringify({
            result: {
                role: 'assistant',
                content: 'Unexpected error. Can you please submit it again?'
            },
        }), {
            status: 200,
        })

    }

    if(response.content !== null) {

        // chat completion
        messages = setMessages(inquiry, prev_data, system)
        response = await callCompletion(messages, functions, 0.7)

        if(!response) {
            
            return new Response(JSON.stringify({
                result: {
                    role: 'assistant',
                    content: 'Unexpected error. Can you please submit it again?'
                },
            }), {
                status: 200,
            })

        }

        if(response.content !== null) {

            return new Response(JSON.stringify({
                result: response,
            }), {
                status: 200,
            })

        }

    }

    // get stored parameters
    const cookieStore = cookies()
    const session_var = cookieStore.get('session-var')
    const sessions = typeof session_var !== 'undefined' ? JSON.parse(session_var.value) : {}
    
    const default_location = Object.keys(sessions).length > 0 ? sessions.location : ''
    const default_date = Object.keys(sessions).length > 0 ? sessions.date : ''

    let func_result = response
    let func_args = JSON.parse(func_result.function_call.arguments)

    // validate parameters
    let location = (func_args.hasOwnProperty('location') && func_args.location.length > 0) ? func_args.location : default_location
    location = location === 'nearby' || location === 'current' ?  default_location : location
    let date = (func_args.hasOwnProperty('date') && func_args.date.length > 0) ? func_args.date : default_date
    let operation = func_args.hasOwnProperty('operation') ? func_args.operation : ['event']
    
    // update stored parameters
    cookieStore.set('session-var', JSON.stringify({
        location,
        date,
    }))
    
    // mock api call
    let data = callMockAPI({ location, date, operation })

    let mock_api_result = {
        ...data,
        location,
        date
    }

    // chat completion
    messages = setMessages(inquiry, prev_data, system)
    messages.push(func_result)
    messages.push({ role: "function", name: "get_user_inquiry", content: JSON.stringify(mock_api_result)})

    response = await callCompletion(messages, functions, 0.7)

    if(!response) {

        return new Response(JSON.stringify({
            result: {
                role: 'assistant',
                content: 'Unexpected error. Can you please submit it again?'
            },
        }), {
            status: 200,
        })

    }

    if(response.content !== null) {

        return new Response(JSON.stringify({
            result: response,
        }), {
            status: 200,
        })

    }

    // there is a chance that a func call will be returned

    func_result = response
    func_args = JSON.parse(func_result.function_call.arguments)

    // validate parameters
    location = (func_args.hasOwnProperty('location') && func_args.location.length > 0) ? func_args.location : default_location
    location = location === 'nearby' || location === 'current' ?  default_location : location
    date = (func_args.hasOwnProperty('date') && func_args.date.length > 0) ? func_args.date : default_date
    operation = func_args.hasOwnProperty('operation') ? func_args.operation : ['event']
    
    // update stored parameters
    cookieStore.set('session-var', JSON.stringify({
        location,
        date,
    }))
    
    // mock api call
    data = callMockAPI({ location, date, operation })

    mock_api_result = {
        ...data,
        location,
        date
    }

    // chat completion
    messages = setMessages(inquiry, prev_data, system)
    messages.push(func_result)
    messages.push({ role: "function", name: "get_user_inquiry", content: JSON.stringify(mock_api_result)})

    response = await callCompletion(messages, functions, 0.7)

    if(!response) {
        return new Response(JSON.stringify({
            result: {
                role: 'assistant',
                content: 'Unexpected error. Can you please submit it again?'
            },
        }), {
            status: 200,
        })
    }

    if(response.content !== null) {

        return new Response(JSON.stringify({
            result: response,
        }), {
            status: 200,
        })

    }
    
    // even if a func call is returned, let's quit and show error
    return new Response(JSON.stringify({
        result: {
            role: 'assistant',
            content: 'I am having trouble processing your inquiry. Can you please submit it again?'
        },
    }), {
        status: 200,
    })

}