import { chatCompletion } from '../../service/openai'

import { isEven, trim_array } from '../../lib/utils'

export async function POST(request) {

    const { system, inquiry, previous } = await request.json()
    
    if (!system || !inquiry || !Array.isArray(previous)) {
        return new Response('Bad system prompt', {
            status: 400,
        })
    }

    // just a simple way to manage chat history by limiting to 20 turns
    let prev_data = trim_array(previous, 20)
    
    const functions = [
        {
            name: 'get_product_price', 
            description: 'Get prices of the given products and its quantities', 
            parameters: {
                type: 'object', 
                properties: {
                    products: {
                        type: 'array', 
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string", description: "Name of product, e.g. San Francisco, CA" },
                                quantity: { type: "integer", description: "Quantity of product, e.g. 1, 2, 37" },
                                unit: { type: "string", description: "Unit of quantity, e.g. kg, pcs, bottle, bag, packs" }
                            }
                        }
                    }
                }, 
                required: ['products']
            }
        }
    ]

    let result = {}

    // system prompt as additional guard rail for function call
    let function_system_prompt = `If the user wants to know the price, call get_product_price function, which requires product and quantity as required parameters.`

    let messages = [{ role: 'system', content: function_system_prompt }]
    messages.push({ role: 'user', content: inquiry })

    try {
        
        result = await chatCompletion({
            messages,
            functions
        })

        console.log('function call', result)

    } catch(error) {

        console.log(error)

    }

    if(result.content === null) {

        // mock api processing       
        const func_call = result
        const func_args = JSON.parse(func_call.function_call.arguments)

        let func_result = func_args.products.map((item) => {
            const price = 1 + Math.round(100 * Math.random())
            return {
                ...item,
                price
            }
        })

        console.log('mock api result', func_result)
        
        // final chat completions call with actual system prompt, history, function call result and api result
        // to summarize everything.

        messages = [{ role: 'system', content: system }]
        if(prev_data.length > 0) {
            messages = messages.concat(prev_data)
        }
        messages.push({ role: 'user', content: inquiry })
        messages.push(func_call) // function call result
        messages.push({"role": "function", "name": "get_product_price", "content": JSON.stringify(func_result)}) // mock api result
        
        try {

            result = await chatCompletion({
                messages,
                temperature: 0.7,
                functions
            })

            console.log('summary', result)

        } catch(error) {
            console.log(error)
        }

    } else {

        // we will call again the chat completions api
        // but now we will use the actual system prompt
        // and with chat history.

        let messages = [{ role: 'system', content: system }]
        if(prev_data.length > 0) {
            messages = messages.concat(prev_data)
        }
        messages.push({ role: 'user', content: inquiry })
        
        try {

            result = await chatCompletion({
                messages,
                temperature: 0.7,
                functions,
            })

        } catch(error) {
            console.log(error)
        }

    }

    return new Response(JSON.stringify({
        result,
    }), {
        status: 200,
    })

}