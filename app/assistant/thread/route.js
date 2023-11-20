import { deleteThread } from '../../../service/openai'

export async function POST(request) {

    const { threadId } = await request.json()
    
    if(!threadId) {
        return new Response('Bad request', {
            status: 400,
        })
    }

    console.log("delete thread", threadId, (new Date()).toLocaleTimeString())

    let result = null

    try {

        result = await deleteThread({ threadId })

        console.log(result)

    } catch(error) {

        console.log(error.name, error.message)

        result = { error: true, message: error.message }

    }

    return new Response(JSON.stringify({
        result
    }), {
        status: 200
    })

}