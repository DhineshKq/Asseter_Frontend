import React, { useState } from 'react';
import { Alert } from 'react-bootstrap';

interface Props {
    type: string | any;
    message: string | any;
}

export default function NotificationBox({ type, message }: Props) {
    const [show, setShow] = useState(true);

    setTimeout(() => {
        setShow(false);
    }, 5000);

    return (
        <div style={{ position: 'fixed', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 999,bottom:'20px' }}>
            <Alert key={type} variant={type} onClose={() => setShow(false)} dismissible
                style={{ backgroundColor: '#429798', color: 'white', display: "flex", alignItems: "center", textAlign: "left" }}>
                <div className={"alert-message"}>
                    {message}
                </div>
                <style>{`
                    .close {
                        color: white;
                    }
                `}</style>
            </Alert>
        </div>
    );
}
