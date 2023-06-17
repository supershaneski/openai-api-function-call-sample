'use client'

import React from 'react'

import classes from './loadingtext.module.css'

export default function LoadingText() {

    const [data, setData] = React.useState(new Array(7).fill(0))

    React.useEffect(() => {

        let cnt = 0
        
        const timer = setInterval(() => {

            setData((n) => {

                let d = n.map((m, i) => {
                    return 2 * Math.sin(cnt + (2 * Math.PI * ((i + 1)/ 8)))
                })

                return d
            })

            cnt++

        }, 100)

        return () => {
            clearInterval(timer)
        }

    }, [])

    return (
        <div className={classes.container}>
            <div className={classes.inner}>
            {
                data.map((n, index) => {
                    return (
                        <div key={index} className={classes.item}
                        style={{
                            transform: `translateY(${n}px)`,
                        }}
                        />
                    )
                })
            }
            </div>
        </div>
    )
}