// ChatSearchModal.js
import React, { useEffect, useState } from 'react';
import { MdClose, MdWavingHand, } from "react-icons/md";
import { IoCloseCircleSharp } from "react-icons/io5";
import '../../../styles/modal/chat-search-modal.scss';
import { RxCross1 } from 'react-icons/rx';
interface props {
    getUserList: () => void;
    handleClose: (val: boolean) => void;
    openChatPage: (val: any) => void;
    userlist: any;
    setReceivedCountUpdate: (val: any) => void;
    setReceivedUserStausUpdate: (val: any) => void;
}

const ChatSearchModal = ({ getUserList, userlist, handleClose, openChatPage, setReceivedCountUpdate, setReceivedUserStausUpdate }: props) => {

    const [searchInputValue, setSearchInputValue] = useState<string>('');

    useEffect(() => {
        getUserList()
    }, []);

    const getUserInitials = (name: string): string => {
        const initials = name.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase();
        return initials.slice(0, 2); // Take the first two letters
    };

    // Assuming userlist is an array of objects with a 'firstName' property
    const filteredUserList = userlist.filter((user: any) => {
        const formattedFirstName = user.firstName.replace(/\s/g, ''); // Remove spaces from firstName
        const formattedSearchInput = searchInputValue.trim().toLowerCase().replace(/\s/g, ''); // Remove spaces from searchInputValue
        return formattedFirstName.toLowerCase().includes(formattedSearchInput);
    });

    return (
        <div className="chat-search-modal">
            <div className="modal-content">
                <div className={"chat-search-modal-close-icon"}>
                    <span className={"chat-search-modal-cross-icon"}>
                        <RxCross1 onClick={() => {
                            handleClose(false);
                            setReceivedCountUpdate(false);
                            setReceivedUserStausUpdate(false);
                        }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleClose(false)
                                }
                            }}
                            style={{ fontSize: "25px" }} />
                    </span>
                </div>
                <input
                    type="text"
                    placeholder="Look for people"
                    className="input"
                    value={searchInputValue}
                    autoFocus
                    onChange={(e) => { setSearchInputValue(e.target.value) }}
                />

                <div className="chat-user-list ">
                    {filteredUserList.map((user: any) => (
                        <div key={user.userId} onClick={() => openChatPage(user)} className={"chat-user-main-list"}>
                            <div className="user-item">
                                {user.img ? (
                                    <img src={user.img} alt="User Avatar" className="avatar" />
                                ) : (
                                    <div className="avatar">
                                        {getUserInitials(user.firstName)}
                                    </div>
                                )}
                                <div className="user-details">
                                    <div className="user-name" onClick={() => openChatPage(user)}>{user.firstName}</div>
                                    <div className="tapToChat">Tap to chat</div>
                                </div>
                            </div>
                            {/* <div className='close-icon'>
                                <MdWavingHand />
                                <div className="tapToChat">wave!</div>
                            </div> */}
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
};

export default ChatSearchModal;
