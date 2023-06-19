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
                        "description": "The city and state, e.g. San Francisco, CA"
                    },
                    "date": {
                        "type": "string",
                        "description": "The date, e.g. 2023-06-19, today, tomorrow"
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
                "required": ["location"]
            }
        }
    ]

    let result = {}

    let messages = []
    let func_result = null

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
        messages = []
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

    // If there is function call, let us check which operation is required by the user
    const func_args = JSON.parse(func_result.function_call.arguments)

    const location = func_args.hasOwnProperty('location') ? func_args.location : ''
    const date = func_args.hasOwnProperty('date') ? func_args.date : ''
    const operation = func_args.hasOwnProperty('operation') ? func_args.operation : ['event']

    let data = {}

    for(let i = 0; i < operation.length; i++) {

        if(operation[i] === 'weather') {
            const temperature = 10 + Math.round(25 * Math.random())
            data['weather'] = `${temperature} degrees celsius Sunny`
        } else if(operation[i] === 'hotels') {
            const chance = Math.round(10 * Math.random())
            data['hotels'] = chance > 5 ? 'Park Hotel, Dormy Inn' : 'Century Plaza, Hilton Hotel'
        } else {
            const chance = Math.round(10 * Math.random())
            data['event'] = chance > 5 ? 'Summer Festival' : 'Fireworks Festival'
        }

    }

    const mock_api_result = {
        ...data,
        location,
        date
    }

    console.log(mock_api_result)

    // let's call the API again to put it all together

    messages = []
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