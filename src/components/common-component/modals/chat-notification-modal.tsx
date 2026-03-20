import React, { useState } from 'react';
import '../../../styles/modal/notification-alert.scss';
import logo from '../../../assets/images/netbulk-logo.png'
import { IoCloseCircleSharp } from "react-icons/io5";
import { BsPersonCircle, BsFillChatDotsFill } from "react-icons/bs";
interface ChatNotificationProps {
    username: string;
    message: string;
    type: any
    handleClose: (val: boolean) => void;
}

const ChatNotification: React.FC<ChatNotificationProps> = ({ username, message, handleClose }) => {
    const [show, setShow] = useState(true);
    const truncateMessage = (msg: string) => {
        if (msg.length > 30) {
            return msg.slice(0, 30) + '...';
        }
        return msg;
    };
    setTimeout(() => {
        setShow(false);
    }, 5000);

    return (
        <div style={{ width: "300px", position: 'fixed', bottom: '5px', right: '8px', zIndex: 60 }}>
            <div className="custom-alert">
                <img className='chat-logo' src={logo} />

                <div className="chat-close-btn" onClick={() => { setShow(false); handleClose(false) }}>
                    <IoCloseCircleSharp />
                </div>
                <div className='contents'>
                    <p style={{ fontSize: '15px' }}> <BsPersonCircle /> New message from <strong style={{ fontSize: '20px' }}>{username}  </strong></p>
                </div>
                <div className='message-contents'>
                    <p> <BsFillChatDotsFill /> <strong>Message:</strong> {truncateMessage(message)}</p>
                </div>
            </div>
        </div>
    );
};

export default ChatNotification;
