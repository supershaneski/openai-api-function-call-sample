'use client'

import React from 'react'
import { createPortal } from 'react-dom'

import NoSsr from '@mui/base/NoSsr'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
//import Button from '@mui/material/Button'
import Fab from '@mui/material/Fab'

import ResetIcon from '@mui/icons-material/RestartAlt'
import ClearIcon from '@mui/icons-material/Clear'
import SendIcon from '@mui/icons-material/Send'
import SettingsIcon from '@mui/icons-material/Settings'
//import DeleteIcon from '@mui/icons-material/DeleteForever'
import PersonIcon from '@mui/icons-material/AccountCircle'

import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import Markdown from 'react-markdown'

import OpenAiIcon from '../components/openailogo'
import LoadingText from '../components/loadingtext'
//import Loader from '../components/loader'
import Dialog from '../components/dialog'

import { getUniqueId } from '../lib/utils'

import useAppStore from '../stores/appStore'

import classes from './sandbox.module.css'

const FunctionTypes = [
    { name: 'Using Chat Completions API', description: '' },
    { name: 'Using Assistants API', description: 'You need to configure the Assistant in the Playground' }
]

export default function Sandbox() {

    const storedMessages = useAppStore((state) => state.messages)
    const storedMode = useAppStore((state) => state.mode)
    const setMode = useAppStore((state) => state.setMode)
    const addMessage = useAppStore((state) => state.addMessage)
    const clearMessages = useAppStore((state) => state.clearMessages)

    const threadId = useAppStore((state) => state.threadId)
    const setThreadId = useAppStore((state) => state.setThreadId)

    const messageRef = React.useRef(null)
    const inputRef = React.useRef(null)

    const [isMounted, setMounted] = React.useState(false)

    const [loading, setLoading] = React.useState(false)
    const [inputText, setInputText] = React.useState('')
    const [messageItems, setMessageItems] = React.useState([])

    const [funcType, setFuncType] = React.useState(0)

    const [isDialogShown, setDialogShown] = React.useState(false)
    const [selFuncType, setSelFuncType] = React.useState(0)
    
    React.useEffect(() => {

        setMounted(true)

    }, [])

    React.useEffect(() => {

        if(isMounted) {

            setFuncType(storedMode)
            setMessageItems(storedMessages)

        }

    }, [isMounted])

    const handleDialogCancel = () => {
        setDialogShown(false)
    }

    const deleteThread = async () => {

        try {

            setLoading(true)

            const response = await fetch('/assistant/thread', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ threadId: threadId }) //'thread_TkEOFBDhkyoTw2RCHn0i0AMD'
            })

            if(!response.ok) {
                console.log('Oops, an error occurred', response.status)
            }

            const result = await response.json()

            console.log(result)

        } catch(error) {
            
            console.log(error.name, error.message)

        } finally {

            setLoading(false)
            setThreadId('')

        }

    }

    const handleDialogConfirm = async () => {
        
        await handleClearMessages()

        setMode(selFuncType)
        setFuncType(selFuncType)
        setDialogShown(false)

    }

    const submitChatCompletion = async () => {

        setLoading(true)

        const text = inputText

        setInputText('')
        inputRef.current.blur()

        let previous = messageItems.map((item) => {
            return {
                role: item.role,
                content: item.content,
            }
        })

        const newUserMessage = {
            id: getUniqueId(),
            created_at: (new Date()).toISOString(),
            role: 'user',
            content: text
        }
        setMessageItems((prev) => [...prev, ...[newUserMessage]])
        addMessage(newUserMessage)

        resetScroll()

        let result_tools = []
        let isCompleted = false
        let MAX_LOOP_COUNT = 10 // Don't want to let it run loose
        let loopCount = 0

        try {
            
            do {

                const url = result_tools.length > 0 ? '/chat/function' : '/chat/message'
                
                const payload = result_tools.length > 0 ? { tools: result_tools, previous } : { inquiry: text, previous }

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                })
    
                if(!response.ok) {
                    console.log('Oops, an error occurred', response.status)
                }
    
                const result = await response.json()
    
                console.log(result)
    
                if(result.output.content) {

                    console.log(result.output.content)
    
                    const newAssistantMessage = {
                        id: getUniqueId(),
                        created_at: (new Date()).toISOString(),
                        role: 'assistant',
                        content: result.output.content
                    }
                    setMessageItems((prev) => [...prev, ...[newAssistantMessage]])
                    addMessage(newAssistantMessage)

                    previous.push({ role: 'assistant', content: result.output.content })

                    resetScroll()
                    
                }
    
                if(result.output.tool_calls) {

                    loopCount++
                    
                    if(loopCount >= MAX_LOOP_COUNT) {
                        
                        isCompleted = true

                    } else {

                        result_tools = result.output.tool_calls

                    }
    
                } else {

                    isCompleted = true

                }

            } while(!isCompleted)

        } catch(error) {

            console.log(error.name, error.message)

        } finally {

            setLoading(false)

            setTimeout(() => {
                inputRef.current.focus()
            }, 100)

        }
    }

    const submitAssistant = async () => {

        setLoading(true)

        const text = inputText

        setInputText('')
        inputRef.current.blur()

        const message_id = getUniqueId()

        const newUserMessage = {
            id: getUniqueId(),
            created_at: (new Date()).toISOString(),
            role: 'user',
            content: text
        }
        setMessageItems((prev) => [...prev, ...[newUserMessage]])
        addMessage(newUserMessage)

        resetScroll()

        try {

            console.log('submit-assistant', threadId, text)

            const thread_id = threadId ? threadId : ''

            const response = await fetch('/assistant/message', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inquiry: text,
                    threadId: thread_id,
                    messageId: message_id,
                })
            })

            if(!response.ok) {
                console.log('Oops, an error occurred', response.status)
            }

            const result = await response.json()

            console.log("assistant", result)

            setThreadId(result.threadId)

            if(result.messages.length > 0) {

                let new_messages = []

                for(let i = 0; i < result.messages.length; i++) {
                    
                    const msg = result.messages[i]

                    if (Object.prototype.hasOwnProperty.call(msg.metadata, 'id'))  {

                        if(msg.metadata.id === message_id) {
                            break // last message
                        }

                    } else {
                        new_messages.push({
                            id: msg.id,
                            created_at: msg.created_at,
                            role: msg.role,
                            content: msg.content[0].text.value
                        })
                    }

                }

                if(new_messages.length > 0) {
                    
                    setMessageItems((prev) => [...prev, ...new_messages])

                    for(let newmsg of new_messages) {
                        addMessage(newmsg)
                    }

                    resetScroll()

                }

            }

        } catch(error) {

            console.log(error.name, error.message)

        } finally {

            setLoading(false)

            setTimeout(() => {
                inputRef.current.focus()
            }, 100)

        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if(funcType > 0) {

            submitAssistant()

        } else {

            submitChatCompletion()

        }

    }
    
    const resetScroll = () => {
        setTimeout(() => {
            messageRef.current.scrollTop = messageRef.current.scrollHeight + 24
        }, 100)
    }

    const handleClearMessages = async () => {

        if(funcType > 0 && threadId) {

            await deleteThread()

        }

        setMessageItems([])
        clearMessages()

    }

    const handleChangeFunction = (e) => {

        setSelFuncType(e.target.value)
        setDialogShown(true)

    }

    return (
        <div className={classes.container}>
            <div className={classes.main}>
                <div className={classes.header}>
                    <FormControl fullWidth>
                        <Select
                        disabled={loading || !isMounted}
                        value={funcType}
                        onChange={handleChangeFunction}
                        renderValue={(value) => (
                            <React.Fragment>
                                <span className={classes.name}>{FunctionTypes[value].name}</span>
                                <span className={classes.desc}>{FunctionTypes[value].description}</span>
                            </React.Fragment>
                        )}
                        >
                            {
                                FunctionTypes.map((item, index) => {
                                    return (
                                        <MenuItem key={index} value={index}>{ item.name }</MenuItem>
                                    )
                                })
                            }
                        </Select>
                    </FormControl>
                </div>
                <div ref={messageRef} className={classes.messages}>
                    {
                        messageItems.map((item) => {
                            return (
                                <div key={item.id} className={classes.message}>
                                    {
                                        item.role === 'assistant' &&
                                        <OpenAiIcon sx={{ mt: 1, ml: 1, mr: 2 }} />
                                    }
                                    {
                                        item.role === 'function' &&
                                        <SettingsIcon sx={{ mt: 1, ml: 1, mr: 2 }} />
                                    }
                                    <div className={classes.text}>
                                        <Markdown>{ item.content }</Markdown>
                                    </div>
                                    {
                                        item.role === 'user' &&
                                        <PersonIcon sx={{ mt: 1, ml: 2, mr: 1 }} />
                                    }
                                </div>
                            )
                        })
                    }
                    {
                        loading &&
                        <div className={classes.loader}>
                            <LoadingText />
                        </div>
                    }
                </div>
                <div className={classes.chat}>
                    <div className={classes.tool}>
                        <Fab onClick={handleClearMessages} disabled={messageItems.length === 0 || loading} color="primary">
                            <ResetIcon />
                        </Fab>
                    </div>
                    <div className={classes.input}>
                        <NoSsr>
                            <Box 
                            component="form" 
                            onSubmit={handleSubmit}
                            noValidate>
                                <TextField 
                                autoFocus={true}
                                placeholder={`Send message`}
                                disabled={loading}
                                fullWidth
                                //multiline
                                //maxRows={4}
                                inputRef={inputRef}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <React.Fragment>
                                                <IconButton
                                                disabled={loading || inputText.length === 0}
                                                onClick={() => setInputText('')}
                                                >
                                                    <ClearIcon />
                                                </IconButton>
                                                <IconButton
                                                disabled={loading || inputText.length === 0}
                                                onClick={handleSubmit}
                                                >
                                                    <SendIcon />
                                                </IconButton>
                                            </React.Fragment>
                                        </InputAdornment>
                                    ),
                                }}
                                />
                            </Box>
                        </NoSsr>
                    </div>
                </div>
            </div>
            {
                isDialogShown && createPortal(
                    <Dialog 
                    disabled={loading}
                    onCancel={handleDialogCancel}
                    onConfirm={handleDialogConfirm}
                    />,
                    document.body
                )
            }
        </div>
    )
}