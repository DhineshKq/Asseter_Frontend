import React, { useState } from 'react'
import { Alert } from 'react-bootstrap';


interface props {
    type: string | any;
    message: string | any;
}


export default function Alertbox({ type, message }: props) {

    const [show, setShow] = useState(true)

    setTimeout(() => {
        setShow(false)
    }, 5000)

    return (
        // display: "flex", justifyContent: "end" , 
        <div style={{ position: 'fixed', top: '30px', right: '30px', zIndex: 60 }} >
            <Alert key={type} variant={type} onClose={() => setShow(false)} dismissible style={{ height: "70px", display: "flex", alignItems: "center" }} >
                <div className={"alert-message"} style={{ textAlign: "left" }}>
                    {message}
                </div>
            </Alert>
        </div>
    )
}

