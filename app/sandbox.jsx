'use client'

import React from 'react'

//import { createPortal } from 'react-dom'

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

import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

import OpenAiIcon from '../components/openailogo'
import LoadingText from '../components/loadingtext'
//import Loader from '../components/loader'

import { getUniqueId } from '../lib/utils'

import useAppStore from '../stores/appStore'

import classes from './sandbox.module.css'

const FunctionTypes = [
    { name: 'Price Of Array Of Products', description: 'e.g. What is price of banana, apple and orange?' },
    { name: 'Multiple Function Call', description: 'e.g. What are the events happening in Sapporo today, what is the weather like, and any nearby hotels?' },
    { name: 'Extract Structured Data From Text', description: 'Extract all people (name, birthday, location) mentioned in the text' },
]

export default function Sandbox() {

    const storedMessages = useAppStore((state) => state.messages)
    const addMessage = useAppStore((state) => state.addMessage)
    const clearMessages = useAppStore((state) => state.clearMessages)

    const inputRef = React.useRef(null)

    const [isMounted, setMounted] = React.useState(false)

    const [loading, setLoading] = React.useState(false)
    const [inputText, setInputText] = React.useState('')
    const [messageItems, setMessageItems] = React.useState([])

    const [funcType, setFuncType] = React.useState(0)
    
    React.useEffect(() => {

        setMounted(true)

    }, [])

    React.useEffect(() => {

        if(isMounted) {

            //

        }

    }, [isMounted])

    const handleSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)

        const text = inputText

        setInputText('')

        inputRef.current.blur()

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

        let system = ''
        let url = ''

        if(funcType === 2) {

            system = `You are a helpful assistant.\n` +
            `Extract all info related to people from the user's given text.`

            url = '/api3/'

        } else if(funcType === 1) {

            system = `You are a helpful event organizer rep.\n` +
            `You will assist the user with their requests and inquiries.\n` +
            `Always start the conversation with polite greeting: Welcome to Events Unlimited.`

            url = '/api2/'

        } else {

            system = `You are a helpful customer service rep.\n` +
            `You will assist the user with their requests and inquiries.\n` +
            `Always start the conversation with polite greeting: Welcome to Super Supermarket.`

            url = '/api/'

        }

        try {
            
            const response_chat = await fetch(url, {
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

            if(Object.keys(result).length > 0) {

                const replyData = {
                    ...result,
                    id: getUniqueId(),
                    datetime: (new Date()).toISOString(),
                }
        
                setMessageItems((prev) => [...prev, ...[replyData]])

            }

        } catch(error) {

            console.log(error)

        }
        
        setLoading(false)

        setTimeout(() => {
            inputRef.current.focus()
        }, 100);

    }

    const handleChangeFunction = (e) => {

        setFuncType(e.target.value)
        setMessageItems([])

    }

    return (
        <div className={classes.container}>
            <div className={classes.main}>
                <div className={classes.header}>
                    <FormControl fullWidth>
                        <Select
                        disabled={loading}
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
                                autoFocus={true}
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
        </div>
    )
}