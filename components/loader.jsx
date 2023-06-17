'use client'

import React from 'react'
import NoSsr from '@mui/base/NoSsr'
import CircularProgress from '@mui/material/CircularProgress'

export default function Loader() {
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
                <CircularProgress color='inherit' />
            </NoSsr>
        </div>
    )
}