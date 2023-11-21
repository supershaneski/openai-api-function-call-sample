import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3,
    timeout: 60 * 1000
})


export async function getAssistant() {

    try {
        
        return await openai.beta.assistants.retrieve(process.env.OPENAI_ASSISTANT_ID)
    
    } catch(error) {
        console.log(error.name, error.message)
        throw error
    }
}

export async function createThread() {

    try {

        return await openai.beta.threads.create()
    
    } catch(error) {
        console.log(error.name, error.message)
        throw error
    }
}

export async function getThread({
    threadId,
}) {

    try {

        return await openai.beta.threads.retrieve(threadId)
    
    } catch(error) {
        console.log(error.name, error.message)
        //throw error
        return {
            error: true,
            message: error.message,
        }
    }

}

export async function deleteThread({
    threadId,
}) {

    try {

        return await openai.beta.threads.del(threadId)
    
    } catch(error) {
        console.log(error.name, error.message)
        //throw error
        return {
            error: true,
            message: error.message,
        }
    }

}

export async function addMessage({
    threadId,
    message,
    messageId,
}) {

    try {

        // add metadata
        let metadata = { 'id': messageId }
        //metadata['id'] = messageId
        
        return await openai.beta.threads.messages.create(
            threadId,
            {
                role: 'user',
                content: message,
                metadata,
            }
        )
    
    } catch(error) {
        console.log(error.name, error.message)
        throw error
    }
}

export async function getMessages({
    threadId,
}) {

    try {

        const messages = await openai.beta.threads.messages.list(threadId)
        
        return messages.data

    } catch(error) {
        console.log(error.name, error.message)
        throw error
    }

}

export async function startRun({ threadId, instructions }) {

    try {
        
        let options = {
            assistant_id: process.env.OPENAI_ASSISTANT_ID,
        }

        if(instructions) {
            options.instructions = instructions
        }

        return await openai.beta.threads.runs.create(
            threadId,
            options
        )
    
    } catch(error) {
        console.log(error.name, error.message)
        throw error
    }

}

export async function getRun({
    threadId,
    runId,
}) {

    try {

        return await openai.beta.threads.runs.retrieve(threadId, runId)
    
    } catch(error) {
        console.log(error.name, error.message)
        throw error
    }

}

export async function submitOutputs({
    threadId,
    runId,
    tool_outputs
}) {

    try {

        return await openai.beta.threads.runs.submitToolOutputs(
            threadId, 
            runId,
            {
                tool_outputs: tool_outputs,
            }
        )
    
    } catch(error) {
        console.log(error.name, error.message)
        throw error
    }

}

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