import { chatCompletion } from '../../service/openai'

import { isEven } from '../../lib/utils'

export async function POST(request) {

    const { system, inquiry, previous } = await request.json()
    
    if (!system) {
        return new Response('Bad question', {
            status: 400,
        })
    }

    // Allow no inquiry: used in the beginning of Discussion
    /*if (!inquiry) {
        return new Response('Bad question', {
            status: 400,
        })
    }*/

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

    let text = ''

    try {

        let messages = [
            { role: 'system', content: system },
        ]

        messages = messages.concat(prev_data)
        
        if(inquiry.length > 0) {
            messages.push({ role: 'user', content: inquiry })
        }

        text = await chatCompletion({
            messages,
            temperature: 0.7,
        })

    } catch(error) {

        console.log(error)

    }

    /*
    const image_list = [
        ["sapporo clock tower", "odori park", "", "maruyama zoo", "", "jr tower sapporo", "ramen alley"],
        ["mt. maruyama", "beer factory", "maruyama park", "sapporo factory", "susukino", "snow festival", "ramen alley"],
        ["sapporo tv tower", "hokkaido shrine", "lilac festival", "", "susukino", "jr tower sapporo", "beer festival"],
        ["", "lilac festival", "", "maruyama zoo", "odori park", "shinsapporo", "ramen alley"],
    ]
    const chance = Math.round(image_list.length * Math.random())

    const trip_name = inquiry.length > 0 ? `My Trip Hokkaido: ${inquiry} ${Date.now()}` : `My Trip Hokkaido ${Date.now()}`

    text = `itinerary-name: ${trip_name}\n` +
        `[welcome-message]\n` +
        `title: welcome message title\n` +
        `content: welcome message text\n` +
        `image: ${image_list[chance][0]}\n` +
        `[itinerary]\n` +
        `title: itinerary title 1\n` +
        `content: itinerary message text\n` +
        `image: ${image_list[chance][1]}\n` +
        `[itinerary]\n` +
        `title: itinerary title 2\n` +
        `content: itinerary message text\n` +
        `image: ${image_list[chance][2]}\n` +
        `[itinerary]\n` +
        `title: itinerary title 3\n` +
        `content: itinerary message text\n` +
        `image: ${image_list[chance][3]}\n` +
        `[itinerary]\n` +
        `title: itinerary title 4\n` +
        `content: itinerary message text\n` +
        `image: ${image_list[chance][4]}\n` +
        `[itinerary]\n` +
        `title: itinerary title 5\n` +
        `content: itinerary message text\n` +
        `image: ${image_list[chance][5]}\n` +
        `[closing-message]\n` +
        `title: closing message title\n` +
        `content: closing message text\n` +
        `image: ${image_list[chance][6]}`
    */

    return new Response(JSON.stringify({
        text,
    }), {
        status: 200,
    })

}