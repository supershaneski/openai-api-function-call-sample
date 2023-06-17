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

    let result = {}

    let messages = [
        { role: 'system', content: system },
    ]

    messages = messages.concat(prev_data)
    
    messages.push({ role: 'user', content: inquiry })

    try {
        
        result = await chatCompletion({
            messages,
            //temperature: 0.7,
            functions: [
                {
                    "name": "get_product_price",
                    "description": "Get the product price given the product and quantity",
                    "parameters": {
                      "type": "object",
                      "properties": {
                        "product": {
                          "type": "string",
                          "description": "The product name, e.g. Campbell's soup"
                        },
                        "quantity": {
                          "type": "integer",
                          "description": "The quantity, e.g. 1, 5, 37, 129"
                        }
                      },
                      "required": ["product"]
                    }
                }
            ]
        })

        console.log(result)

    } catch(error) {

        console.log(error)

    }

    if(result.content === null) { // I am assuming that this means there is function_call value

        // function call return
        messages.push(result) 

        // Call function API here
        const price = 1 + Math.round(100 * Math.random())

        console.log('price', price)

        // function API return
        messages.push({"role": "function", "name": "get_product_price", "content": JSON.stringify({ price })})

        result = {} // reset

        try {

            result = await chatCompletion({
                messages,
                //temperature: 0.7,
                functions: [
                    {
                        "name": "get_product_price",
                        "description": "Get the product price given the product and quantity",
                        "parameters": {
                          "type": "object",
                          "properties": {
                            "product": {
                              "type": "string",
                              "description": "The product name, e.g. Campbell's soup"
                            },
                            "quantity": {
                              "type": "integer",
                              "description": "The quantity, e.g. 1, 5, 37, 129"
                            }
                          },
                          "required": ["product"]
                        }
                    }
                ]
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