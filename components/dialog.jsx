'use client'

import React from 'react'
import PropTypes from 'prop-types'
import NoSsr from '@mui/base/NoSsr'
import Button from '@mui/material/Button'

import classes from './dialog.module.css'

export default function Dialog({
    disabled = false,
    onConfirm = undefined,
    onCancel = undefined,
}) {
    return (
        <div style={{
            backgroundColor: '#3336',
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff9',
        }}>
            <NoSsr> 
                <div className={classes.dialog}>
                    <div className={classes.contents}>
                        <div className={classes.text}>{ `This will reset and delete your current conversation.\n\nAre you sure you want to continue?` }</div>
                    </div>
                    <div className={classes.action}>
                        <Button disabled={disabled} sx={{ width: '80px', mr: 1, }} disableElevation variant="contained" onClick={onConfirm}>OK</Button>
                        <Button disabled={disabled} disableElevation variant="contained" onClick={onCancel}>Cancel</Button>
                    </div>
                </div>
            </NoSsr>
        </div>
    )
}

Dialog.propTypes = {
    /**
     * disabled property
     */
    disabled: PropTypes.bool,
    /**
     * Confirm event handler
     */
    onConfirm: PropTypes.func,
    /**
     * Cancel event handler
     */
    onCancel: PropTypes.func,
}