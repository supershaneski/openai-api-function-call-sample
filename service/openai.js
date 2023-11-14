import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3,
    timeout: 60 * 1000
})

export async function chatCompletion({
    model = 'gpt-3.5-turbo-1106',
    max_tokens = 2048,
    temperature = 0,
    messages,
    tools,
}) {

    let options = { messages, model, temperature, max_tokens }

    if(tools) {

        options.tools = tools

    }

    try {

        const result = await openai.chat.completions.create(options)

        console.log(result)

        return result.choices[0]

    } catch(error) {
        
        console.log(error.name, error.message)
        
        throw error

    }
    
}