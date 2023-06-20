import { cookies } from 'next/headers'
import { chatCompletion } from '../../service/openai'
import { isEven } from '../../lib/utils'

export async function POST(request) {

    const { system, inquiry, previous } = await request.json()
    
    if (!system) {
        return new Response('Bad question', {
            status: 400,
        })
    }

    if (!inquiry) {
        return new Response('Bad question', {
            status: 400,
        })
    }

    if (!Array.isArray(previous)) {
        return new Response('Bad chunks', {
            status: 400,
        })
    }

    /*const cookieStore = cookies()
    const test = cookieStore.get('test')

    console.log("test1", test)*/

    let prev_data = previous

    /**
     * We need to manage the amount of previous data so that we don't hit
     * the maxtoken limit. Also sending large amount of data is costly.
     * Here, we are setting 20 entries as the cutoff.
     */

    const MAX_LENGTH = 20

    if(prev_data.length > MAX_LENGTH) {

        let cutoff = Math.ceil(previous.length - MAX_LENGTH)

        // we want to maintain the entries as pair of user and assistant prompts
        cutoff = isEven(cutoff) ? cutoff : cutoff + 1

        prev_data = previous.slice(cutoff)

    }

    /**
     * Function definition
     */
    const functions = [
        {
            "name": "get_user_inquiry",
            "description": "Get users inquiry",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The location or place"
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

    let result = {}

    let func_result = null

    // Add a system prompt to prevent hallucination
    // Reference: https://github.com/openai/openai-cookbook/blob/main/examples/How_to_call_functions_with_chat_models.ipynb
    /*let messages = [
        { 
            role: 'system',
            content: 'Do not make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous like there is no location or date provided.'
        }
    ]*/

    let messages = []
    
    // First, call the API for function call with only the inquiry
    messages.push({ role: 'user', content: inquiry })

    try {
        
        const response = await chatCompletion({
            messages,
            functions
        })

        if(response.content === null) {
            func_result = response
        }

    } catch(error) {
        console.log(error)
    }

    // If no function call
    if(func_result === null) {

        // Let's call the API again now with history and system prompt
        messages = [{ role: 'system', content: system }]
        messages = messages.concat(prev_data)
        messages.push({ role: 'user', content: inquiry })

        try {
            
            result = await chatCompletion({
                messages,
                temperature: 0.7,
                functions
            })
    
        } catch(error) {
            console.log(error)
        }

        return new Response(JSON.stringify({
            result,
        }), {
            status: 200,
        })

    }

    console.log(func_result)

    // Get stored session variable
    const cookieStore = cookies()
    const session_var = cookieStore.get('session-var')
    const sessions = typeof session_var !== 'undefined' ? JSON.parse(session_var.value) : {}

    console.log(sessions)

    const default_location = Object.keys(sessions).length > 0 ? sessions.location : ''
    const default_date = Object.keys(sessions).length > 0 ? sessions.date : ''
    
    // If there is function call, let us check which operation is required by the user
    const func_args = JSON.parse(func_result.function_call.arguments)

    let location = (func_args.hasOwnProperty('location') && func_args.location.length > 0) ? func_args.location : default_location

    // This is to handle user prompts when exact location is not included but just implied.
    location = location === 'nearby' || location === 'current' ?  default_location : location

    let date = (func_args.hasOwnProperty('date') && func_args.date.length > 0) ? func_args.date : default_date

    const operation = func_args.hasOwnProperty('operation') ? func_args.operation : ['event']
    
    // Update the session variable
    cookieStore.set('session-var', JSON.stringify({
        location,
        date,
    }))

    // Mock API
    let data = {}

    for(let i = 0; i < operation.length; i++) {

        if(operation[i] === 'weather') {
            const temperature = 10 + Math.round(25 * Math.random())
            const chance = Math.round(10 * Math.random())
            data['weather'] = `${temperature} degrees celsius ${chance > 5 ? 'Sunny' : 'Cloudy'}`
        } else if(operation[i] === 'hotels') {
            const chance = Math.round(10 * Math.random())
            data['hotels'] = chance > 5 ? 'Park Hotel, Dormy Inn' : 'Century Plaza, Hilton Hotel'
        } else {
            const chance = Math.round(10 * Math.random())
            data['event'] = chance > 5 ? 'Summer Festival, Odori Park, 13:00PM - 21:00PM' : 'Fireworks Festival, Toyohira River, 7:00PM to 8:30PM'
        }

    }

    const mock_api_result = {
        ...data,
        location,
        date
    }

    console.log(mock_api_result)

    // let's call the API again to put it all together

    messages = [{ role: 'system', content: system }]
    messages = messages.concat(prev_data)
    messages.push({ role: 'user', content: inquiry })
    messages.push(func_result)
    messages.push({ "role": "function", "name": "get_user_inquiry", "content": JSON.stringify(mock_api_result)})

    try {
            
        result = await chatCompletion({
            messages,
            temperature: 0.7,
            functions
        })

    } catch(error) {
        console.log(error)
    }

    return new Response(JSON.stringify({
        result,
    }), {
        status: 200,
    })

    return new Response(JSON.stringify({
        result,
    }), {
        status: 200,
    })

}