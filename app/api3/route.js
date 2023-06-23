//import { cookies } from 'next/headers'
import { chatCompletion } from '../../service/openai'
import { isEven } from '../../lib/utils'
//import { callMockAPI } from '../../lib/mockapi'

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
        name: "extract_people_data",
        description: "Extract all info related to people from the user's given text.",
        parameters: {
            type: "object",
            properties: {
                people: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string", description: "Name of the person" },
                            birthday: { type: "string", description: "Date of birth, e.g. 2010-01-20" },
                            location: { type: "string", description: "Place, city or country" },
                        }
                    }
                }
            },
            required: ["people"]
        }
    }
]

export async function POST(request) {

    const { inquiry, system, previous } = await request.json()
    
    if (!inquiry || !system || !Array.isArray(previous)) {
        
        return new Response('Bad request', {
            status: 400,
        })

    }

    let prev_data = trim_array(previous, 20)

    let messages = [] //[{ role: 'system', content: system }]
    /*if(prev_data.length > 0) {
        messages = messages.concat(prev_data)
    }*/
    messages.push({ role: 'user', content: inquiry })

    let result = {}

    try {

        const response = await chatCompletion({
            messages,
            functions
        })

        if(response.content === null) {

            //console.log(response)

            const obj = JSON.parse(response.function_call.arguments)
            const people = obj.people.map((a) => {
                
                const options = [a.name]

                if(a.birthday) {
                    options.push(a.birthday)
                }

                if(a.location) {
                    options.push(a.location)
                }

                return options.join(',')

            })

            result = {
                role: 'assistant',
                content: people.join('\n'),
            }

        } else {

            //result = response
            result = {
                role: 'assistant',
                content: 'No actual people are found from the text.'
            }

        }

    } catch(error) {

        console.log(error)

    }

    return new Response(JSON.stringify({
        iat: Date.now(),
        result,
    }), {
        status: 200,
    })

}