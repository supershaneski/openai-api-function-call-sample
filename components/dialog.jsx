'use client'

import React from 'react'

import PropTypes from 'prop-types'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import ClearIcon from '@mui/icons-material/Clear'
import SendIcon from '@mui/icons-material/Send'
import QuizIcon from '@mui/icons-material/Quiz'
import ChatIcon from '@mui/icons-material/Forum'
import DeleteIcon from '@mui/icons-material/DeleteForever'
import IconButton from '@mui/material/IconButton'

import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

import classes from './dialog.module.css'
import CustomTheme from './customtheme'
import { Typography } from '@mui/material'

import captions from '../assets/captions.json'
import useCaption from '../lib/usecaption'

export default function Dialog({ 
    title = '',
    caption = '',
    status = 1,
    param = null,
    icon = null,
    onConfirm = undefined,
    onClose = undefined,
    onStatus = undefined,
}) {
    
    const setCaption = useCaption(captions)

    const inputRef = React.useRef(null)

    const [inputText, setInputText] = React.useState(caption)

    const [confirmStatus, setConfirmStatus] = React.useState(0)
    const [isChecked, setChecked] = React.useState(false)

    React.useEffect(() => {

        setConfirmStatus(status)

    }, [])

    const handleCheck = (e) => {

        const checked = e.target.checked

        setChecked(checked)

        onStatus(checked ? 1 : confirmStatus)

    }

    const handleSubmit = (e) => {
        e.preventDefault()
    }

    return (
        <div className={classes.container}>
            <div className={classes.dialog}>
                {
                    title &&
                    <div className={classes.header}>
                        {
                            icon &&
                            <React.Fragment>
                                {
                                    icon
                                }
                            </React.Fragment>
                        }
                        <CustomTheme>
                            <Typography 
                            variant='h4' 
                            component='h4' 
                            sx={{fontSize: '1rem', fontWeight: '500', }}>{ title }</Typography>
                        </CustomTheme>
                    </div>
                }
                <div className={classes.caption}>
                    Are you sure you want to delete<br /><span className={classes.name}>{caption}</span>?
                </div>
                {
                    confirmStatus === 0 &&
                    <div className={classes.confirm}>
                        <CustomTheme>
                            <FormControlLabel 
                            control={<Checkbox 
                            checked={isChecked} 
                            onChange={handleCheck} />} 
                            label={setCaption('dialog-confirm')} />
                        </CustomTheme>
                    </div>
                }
                <div className={classes.action}>
                    <CustomTheme>
                        <Button 
                        onClick={() => onConfirm(param, inputText)} 
                        variant="outlined" 
                        sx={{mr: 1, width: 100, }}>OK</Button>
                        <Button 
                        onClick={onClose} 
                        variant="outlined" 
                        sx={{width: 100, }}>{setCaption('close')}</Button>
                    </CustomTheme>
                </div>
            </div>
        </div>
    )
}

Dialog.propTypes = {
    /**
     * icon element
     */
    icon: PropTypes.element,
    /**
     * Param property
     */
    param: PropTypes.any,
    /**
     * Status property
     */
    status: PropTypes.number,
    /**
     * Title string
     */
    title: PropTypes.string,
    /**
     * Dialog's caption String
     */
    caption: PropTypes.string,
    /**
     * onStatus handler
     */
    onStatus: PropTypes.func,
    /**
     * onConfirm event
     */
    onConfirm: PropTypes.func,
    /**
     * onClose event
     */
    onClose: PropTypes.func,
}