import { chatCompletion } from '../../../service/openai'
import { trim_array } from '../../../lib/utils'
import get_weather from '../../../lib/get_weather.json'
import get_events from '../../../lib/get_events.json'
import get_event from '../../../lib/get_event.json'
import search_hotel from '../../../lib/search_hotel.json'
import get_hotel from '../../../lib/get_hotel.json'
import reserve_hotel from '../../../lib/reserve_hotel.json'
import get_reservation from '../../../lib/get_reservation.json'

export async function POST(request) {

    const { inquiry, previous } = await request.json()
    
    if (!inquiry || !Array.isArray(previous)) {
        return new Response('Bad system prompt', {
            status: 400,
        })
    }

    console.log('user', inquiry, (new Date()).toLocaleTimeString())

    let context = trim_array(previous, 20)
    
    const today = new Date()

    const system_prompt = `You are a helpful personal assistant.\n\n` +
        `# Tools\n` +
        `You have the following tools that you can invoke based on the user inquiry.\n` +
        `- get_weather, when the user wants to know the weather forecast given a location and date.\n` +
        `- get_events, when the user wants to know events happening in a given location and date.\n` +
        `- get_event, when the user wants to know more about a particular event.\n` +
        `- search_hotel, when the user wants to search for hotel based on given location.\n` +
        `- get_hotel, when the user wants to know more about a particular hotel.\n` +
        `- reserve_hotel, when the user wants to make room reservation for a particular hotel.\n` +
        `- get_reservation, when the user wants to get the details of their reservation.\n` +
        `When the user is making hotel reservation, be sure to guide the user to fill up all required information.\n` +
        `When you fill up some of the required information yourself, be sure to confirm to user before proceeding.\n` +
        `Aside from the listed functions above, answer all other inquiries by telling the user that it is out of scope of your ability.\n\n` +
        `# User\n` +
        `If my full name is needed, please ask me for my full name.\n\n` +
        `# Language Support\n` +
        `Please reply in the language used by the user.\n\n` +
        `Today is ${today}`
    
    let messages = [{ role: 'system', content: system_prompt }]
    if(context.length > 0) {
        messages = messages.concat(context)
    }
    messages.push({ role: 'user', content: inquiry })

    let result_message = null

    try {
        
        let result = await chatCompletion({
            temperature: 0.3,
            messages,
            tools: [
                { type: 'function', function: get_weather },
                { type: 'function', function: get_events },
                { type: 'function', function: get_event },
                { type: 'function', function: search_hotel },
                { type: 'function', function: get_hotel },
                { type: 'function', function: reserve_hotel },
                { type: 'function', function: get_reservation },
            ]
        })

        console.log('function-calling', result)

        result_message = result.message

    } catch(error) {

        console.log(error.name, error.message)

    }

    return new Response(JSON.stringify({
        output: result_message,
    }), {
        status: 200,
    })
    
}