'use client'

import React from 'react'

import { createPortal } from 'react-dom'

import NoSsr from '@mui/base/NoSsr'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import ClearIcon from '@mui/icons-material/Clear'
import SendIcon from '@mui/icons-material/Send'
import SettingsIcon from '@mui/icons-material/Settings'
//import DeleteIcon from '@mui/icons-material/DeleteForever'
import PersonIcon from '@mui/icons-material/AccountCircle'

import OpenAiIcon from '../components/openailogo'
import LoadingText from '../components/loadingtext'
import Loader from '../components/loader'

//import useDataStore from '../store/datastore'

import { getUniqueId } from '../lib/utils'

import classes from './sandbox.module.css'

export default function Sandbox() {

    //const data = useDataStore((state) => state.data)
    //const addData = useDataStore((state) => state.add)
    //const deleteData = useDataStore((state) => state.delete)

    const inputRef = React.useRef(null)

    const [loading, setLoading] = React.useState(false)
    const [inputText, setInputText] = React.useState('')
    const [messageItems, setMessageItems] = React.useState([])
    
    const handleSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)

        const text = inputText

        setInputText('')

        const previous = messageItems.map((item) => {
            return {
                role: item.role,
                content: item.content,
            }
        })

        const newData = {
            id: getUniqueId(),
            datetime: (new Date()).toISOString(),
            role: 'user',
            content: text
        }

        setMessageItems((prev) => [...prev, ...[newData]])

        const system = `You are a helpful customer service rep.\n` +
            `You will assist the user with their requests and inquiries.\n` +
            `Always start the conversation with polite greeting: Welcome to Super Supermarket.`

        try {
            
            const response_chat = await fetch('/api/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    system,
                    inquiry: text,
                    previous,
                })
            })

            const result_chat = await response_chat.json()

            console.log(result_chat)

            const result = result_chat.result

            const replyData = {
                ...result,
                id: getUniqueId(),
                datetime: (new Date()).toISOString(),
            }
    
            setMessageItems((prev) => [...prev, ...[replyData]])

        } catch(error) {
            console.log(error)
        }
        
        setLoading(false)

    }

    return (
        <div className={classes.container}>
            <div className={classes.main}>
                <div className={classes.messages}>
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
                                    <p className={classes.text}>
                                    { item.content }
                                    </p>
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
                    <div className={classes.input}>
                        <NoSsr>
                            <Box 
                            component="form" 
                            onSubmit={handleSubmit}
                            noValidate>
                                <TextField 
                                placeholder={`Write your inquiry`}
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
                loading && createPortal(
                    <Loader />,
                    document.body
                )
            }
        </div>
    )
}