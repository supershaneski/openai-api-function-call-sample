import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export async function chatCompletion({
    model = 'gpt-3.5-turbo-0613',
    max_tokens = 1024,
    temperature = 0,
    messages,
    functions,
}) {
    try {

        const result = await openai.createChatCompletion({
            messages,
            model,
            max_tokens,
            temperature,
            functions,
        })

        if (!result.data.choices[0].message) {
            throw new Error("No return error from chat");
        }

        return result.data.choices[0].message //?.content

    } catch(error) {
        console.log(error)
        throw error
    }
}