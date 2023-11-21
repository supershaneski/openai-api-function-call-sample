import { 
    getAssistant,
    getThread, 
    createThread, 
    addMessage, 
    getMessages, 
    startRun, 
    getRun, 
    submitOutputs
} from '../../../service/openai'
import { wait } from '../../../lib/utils'
import { callMockAPI } from '../../../lib/mockapi'

export async function POST(request) {

    const { inquiry, threadId, messageId } = await request.json()
    
    if (!inquiry, !messageId) {
        return new Response('Bad request', {
            status: 400,
        })
    }
    
    console.log("start assistant...", threadId, inquiry, (new Date()).toLocaleTimeString())

    let thread_id = threadId ? threadId : ''
    let assistant_instructions = ''
    let messages_items = []

    try {

        const assistant = await getAssistant()
        assistant_instructions = assistant.instructions

        if(thread_id) {

            const exist_thread = await getThread({ threadId: thread_id })

            console.log('get-thread', exist_thread)

            if(exist_thread.error) {
                thread_id = ''
            }

        }

        if(!thread_id) {

            const new_thread = await createThread()

            console.log('new-thread', new_thread)

            thread_id = new_thread.id

        }

        const message = await addMessage({ threadId: thread_id, message: inquiry, messageId: messageId })

        console.log('message', message)

        const run = await startRun({ 
            threadId: thread_id,
            instructions: assistant_instructions + `\nToday is ${new Date()}.`
        })

        console.log('run', run)

        const run_id = run.id

        let flagFinish = false

        let MAX_COUNT = 2 * 600 // 120s 
        let TIME_DELAY = 100 // 100ms
        let count = 0

        do {

            console.log(`Loop: ${count}`)

            const run_data = await getRun({ threadId: thread_id, runId: run_id })

            const status = run_data.status

            console.log(`Status: ${status} ${(new Date()).toLocaleTimeString()}`)

            if(status === 'completed') {

                const messages = await getMessages({ threadId: thread_id })

                //console.log('all-messages', messages)

                let new_messages = []

                for(let i = 0; i < messages.length; i++) {
                    if (Object.prototype.hasOwnProperty.call(messages[i].metadata, 'id'))  {
                        if(messages[i].metadata.id === messageId) {
                            break // last message
                        }
                    } else {
                        new_messages.push(messages[i])
                    }
                }

                console.log('new-messages', new_messages)

                messages_items = new_messages

                flagFinish = true
            
            } else if(status === 'requires_action'){
                
                console.log('run-data', run_data)

                const required_action = run_data.required_action
                const required_tools = required_action.submit_tool_outputs.tool_calls

                console.log('required-action', required_action)
                console.log('required-tools', required_tools)
                
                let tool_output_items = []

                for(let rtool of required_tools) {

                    const function_name = rtool.function.name
                    const tool_args = JSON.parse(rtool.function.arguments)
                    
                    console.log("-", function_name, tool_args)

                    let tool_output = callMockAPI(function_name, tool_args)

                    tool_output_items.push({
                        tool_call_id: rtool.id,
                        output: JSON.stringify(tool_output)
                    })

                }

                /*
                required_tools.forEach((rtool) => {

                    const function_name = rtool.function.name
                    const tool_args = JSON.parse(rtool.function.arguments)
                    
                    let tool_output = callMockAPI(function_name, tool_args)

                    tool_output_items.push({
                        tool_call_id: rtool.id,
                        output: JSON.stringify(tool_output)
                    })

                })
                */

                console.log('tools-output', tool_output_items)

                const ret_tool = await submitOutputs({
                    threadId: thread_id,
                    runId: run_id,
                    tool_outputs: tool_output_items
                })

                console.log('ret-tool', ret_tool)

            } else if(status === 'expired' || status === 'cancelled' || status === 'failed') {
                
                flagFinish = true

            }
            
            if(!flagFinish) {

                count++
                
                if(count >= MAX_COUNT) {

                    flagFinish = true

                } else {

                    await wait(TIME_DELAY)

                }

            }

        } while(!flagFinish)

    } catch(error) {

        console.log("assistant-error", error.name, error.message)

    }

    return new Response(JSON.stringify({
        threadId: thread_id,
        messages: messages_items,
    }), {
        status: 200,
    })

}