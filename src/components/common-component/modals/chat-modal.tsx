import React, { useState, useEffect, useRef } from 'react';
import { IoIosArrowForward } from "react-icons/io";
import { FaSearch } from "react-icons/fa";
// import ChatPage from '../../chat-page/chatPage';
import { RiCheckDoubleLine } from 'react-icons/ri';
import { axiosPrivate } from '../../../middleware/axios-api';
import { formatTime } from '../../../helpers/dateTimeFormaters';
import ChatSearchModal from './chat-search-modal';
import '../../../styles/modal/chat-modal.scss';
interface User {
    name: string;
    status: string;
    lastseen: string;
    message: string;
    msgStatus: string;

}

interface FilterData {
    chatIconClick: (val: any) => void;
    setIsChatOpen: (val: any) => void;
    setSearchModal: (val: any) => void;
    setReceivedCountUpdate: (val: any) => void;
    setReceivedUserStausUpdate: (val: any) => void;
    // setOpenChatModal: (val: any) => void;
    chatIconClickStatus: any;
    chatDetails: any;
    isChatOpen: any;
    chatName: any;
    searchModal: string;
    setChatName: any;
    receivedCountUpdate: boolean;
    receivedUserStausUpdate: boolean;
    handleTotalUsers: any
    socketIoChanges: () => void
}

const ChatModal: React.FC<FilterData> = ({
    chatIconClick,
    chatIconClickStatus,
    handleTotalUsers,
    chatDetails,
    isChatOpen,
    chatName,
    receivedCountUpdate,
    searchModal,
    setIsChatOpen,
    setChatName,
    setSearchModal,
    setReceivedCountUpdate,
    socketIoChanges,
    setReceivedUserStausUpdate,
    receivedUserStausUpdate
}) => {

    const initialUserDetails: User[] = [
        { name: "Ramesh", status: "online", lastseen: "14:00", message: "Hello there!", msgStatus: "Seen" },
        { name: "Kesavan", status: "offline", lastseen: "1:00", message: "Hello", msgStatus: "Sent" },
        { name: "Sanjay", status: "online", lastseen: "4:00", message: "How are you?", msgStatus: "Seen" },
        { name: "Lotus", status: "offline", lastseen: "4:00", message: "Hello", msgStatus: "Sent" },
        { name: "Sharan", status: "online", lastseen: "4:00", message: "Hello", msgStatus: "Sent" },
        { name: "Ajith", status: "online", lastseen: "4:00", message: "Hello", msgStatus: "Sent" },
        { name: "Sanjay", status: "online", lastseen: "4:00", message: "How are you?", msgStatus: "Seen" },
        { name: "Lotus", status: "offline", lastseen: "4:00", message: "Hello", msgStatus: "Sent" },
        { name: "Sharan", status: "online", lastseen: "4:00", message: "Hello", msgStatus: "Sent" },
        { name: "Ajith", status: "online", lastseen: "4:00", message: "Hello", msgStatus: "Sent" }
    ];

    const [userDetails, setUserDetails] = useState<User[]>(initialUserDetails);
    const MAX_LENGTH = 20;

    const [searchInputValue, setSearchInputValue] = useState<string>('');
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [receivedMsgCount, setReceivedMsgCount] = useState<{ [key: string]: number }>({});
    const [receivedUserStatus, setReceivedUserStatus] = useState<{ [key: string]: any }>({});
    const [userList, setUserList] = useState<any>([])
    // const chatdetailsRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        handleReceivedMsgCount()
        handleUserStatus()
    }, [receivedCountUpdate, receivedUserStausUpdate]);

    useEffect(() => {
        const unreadMessages = userDetails.filter(user => user.msgStatus === "unread");
        setUnreadCount(unreadMessages.length);
    }, [userDetails]);

    const openChatPage = async (recieverId: any, senderId: any) => {
        try {
            const response = await axiosPrivate.post(`chat/All-msgs`, {
                senderId: senderId,
                recieverId: recieverId
            });
            if (response.status === 200) {
                handleReceivedMsgCount()
                handleUserStatus()
                setIsChatOpen(true)
                setChatName(response.data)
                setSearchModal(false)
            }
        } catch (error: any) {
        }
    };

    const handleReceivedMsgCount = async () => {
        try {
            const messagePairs = chatDetails.map((chat: any) => ({
                senderId: chat.senderUserId,
                recieverId: chat.receiverUserId
            }));

            const response = await axiosPrivate.post(`chat/person/unread-counts`, {
                messagePairs: messagePairs
            });

            if (response.status === 200) {
                const counts: { [key: string]: number } = {};
                response.data.unreadMsgCounts.forEach((count: any) => {
                    const key = `${count.senderId}_${count.receiverId}`;
                    counts[key] = count.unreadMsgCount;
                });
                setReceivedMsgCount(counts);
                setReceivedCountUpdate(false)
                setReceivedUserStausUpdate(false)
            }
        } catch (error: any) {
        }
    };

    const handleUserStatus = async () => {
        try {
            const messagePairs = chatDetails.map((chat: any) => ({
                userId: chat.receiverUserId
            }));

            const response = await axiosPrivate.post(`chat/person/status`, {
                messagePairs: messagePairs
            });

            if (response.status === 200) {
                const status: { [key: string]: number } = {};
                response.data.userStatusList.forEach((count: any) => {
                    const key = `${count.userId}`;
                    status[key] = count.userLoginStatus;
                });
                setReceivedUserStatus(status);
                setReceivedCountUpdate(false)
                setReceivedUserStausUpdate(false)
            }
        } catch (error: any) {
        }
    };

    const handleUpdateAllmsgAsRead = async (recieverId: any, senderId: any) => {
        try {
            const response = await axiosPrivate.patch(`chat/update-msg-read`, {
                senderUserId: recieverId,
                recieverUserId: senderId
            });
        } catch (error: any) {
        }
    };

    const getUserList = async () => {
        try {
            const response = await axiosPrivate.get(`chat/all-users`, {
            });
            if (response.status === 200) {
                setUserList(response.data.results)
            }
        } catch (error: any) {
        }
    };

    return (
        <div className='main-chat-container' >
            <div className='heading'>
                {!isChatOpen && <span onClick={() => {
                    chatIconClick(!chatIconClickStatus);
                    setSearchModal(false);
                    setReceivedCountUpdate(false)
                    setReceivedUserStausUpdate(false)
                    handleReceivedMsgCount()
                    handleUserStatus()
                }}>
                    <IoIosArrowForward className='arrow-icon' />
                </span>}
                {!isChatOpen && <span className='chat-header'>{"Chats"}</span>}
                {/* {!isChatOpen && <span className='chat-count'>{unreadCount}</span>} */}
            </div>
            {
                !isChatOpen && (
                    <div>
                        <div className={"input-search-main"} onClick={() => setSearchModal("show")} >
                            <input
                                type={"text"}
                                placeholder={"Search"}
                                className={"search-icon-input"}
                                value={searchInputValue}
                                readOnly
                                style={{ cursor: "pointer" }}
                                onClick={() => setSearchModal("show")}
                            />

                            <div className={"search-icon"}>
                                <FaSearch />
                            </div>
                        </div>
                        <div className="chat-members-container">
                            <div className="user-list user-list-format">
                                {chatDetails.map((user: any, index: any) => (
                                    <>
                                        <div key={index + "filteredUserDetails"} className='chat-list'
                                            onClick={async () => {
                                                await openChatPage(user.receiverUserId, user.senderUserId);
                                                handleUpdateAllmsgAsRead(user.receiverUserId, user.senderUserId);
                                            }}>
                                            <div style={{
                                                display: "flex", gap: "10px", height: "70px", width: '70%'
                                            }}>
                                                <div className='chat-profile'>
                                                    <div className='chat-profile'>
                                                        <div className='user-face-icon-wrapper'>
                                                            {user.imgProfile ? (
                                                                <img src={user.imgProfile} className='user-face-icon user-profile-icon' alt={"Profile Image"} draggable={"false"} />
                                                            ) : (
                                                                <div className='user-face-icon user-profile-icon'>
                                                                    {user.senderFirstName.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className={`status-indicator ${receivedUserStatus[user.receiverUserId] === 'online' ? 'online' : 'offline'}`}></div>
                                                        </div>
                                                    </div>

                                                    <div className={`chat-${user.status}`}></div>
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                                    <div className='user-name' >{user.senderFirstName}</div>
                                                    <div className={`user-message ${user?.messageStatus === 'received' ? 'bold-message' : ''}`}>
                                                        {user?.message.length > MAX_LENGTH ? user?.message.substring(0, MAX_LENGTH) + ".." : user?.message}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ width: '20%' }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "5px", alignItems: "center" }}>
                                                    <div className='user-lastSeen' style={{ marginLeft: "15px" }} >{formatTime(user?.createdAt)}</div>
                                                    <div className='user-messageStatus' >
                                                        {
                                                            user?.messageStatus === "Seen" || null ?
                                                                <RiCheckDoubleLine fill={"#295285"} /> :
                                                                user?.messageStatus === "received" || null ? <div className={"received-status"}>{receivedMsgCount[user.senderUserId + '_' + user.receiverUserId]}</div> : <RiCheckDoubleLine fill={"#A4A4A4"} />
                                                        }
                                                        {user?.messageStatus.length > MAX_LENGTH ? user?.messageStatus.substring(0, MAX_LENGTH) + ".." : user?.messageStatus}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ))}
                            </div>
                        </div>
                        <div>
                        </div>
                    </div>
                )
            }


            {
                searchModal === "show" &&
                (<ChatSearchModal
                    getUserList={getUserList}
                    userlist={userList}
                    handleClose={(val: any) => { setSearchModal(val) }}
                    openChatPage={async (val: any) => {
                        await openChatPage(val.userId, val.senderId);
                    }}
                    setReceivedCountUpdate={(val: any) => setReceivedCountUpdate(val)}
                    setReceivedUserStausUpdate={(val: any) => setReceivedUserStausUpdate(val)}
                />)
            }
        </div >
    );
};

export default ChatModal;


{/* <input
                                type={"text"}
                                placeholder={"Search"}
                                className={"search-icon-input"}
                                value={searchInputValue}
                                readOnly={userList.length > 0}
                                style={{ cursor: "pointer" }}
                                onChange={(e: any) => {
                                    setSearchInputValue(e.target.value);
                                }}
                                onClick={() => {
                                    if (userList.length > 0) {
                                        setSearchModal("show")
                                    }
                                }}
                            />

      const filteredChatDetails = chatDetails.filter((user: any) => {
        const formattedFirstName = user.senderFirstName.replace(/\s/g, ''); // Remove spaces from senderFirstName
        const formattedSearchInput = searchInputValue.trim().toLowerCase().replace(/\s/g, ''); // Remove spaces from searchInputValue
        return formattedFirstName.toLowerCase().includes(formattedSearchInput);
    });

*/}

// <RiCheckDoubleLine fill={"#A4A4A4"} />

// useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {

//         const classNamesToExclude = ["main-chat-container",
//             "heading",
//             "chat-header",
//             "search-icon-input",
//             "search-icon",
//             "input-search-main",
//             "user-list user-list-format",
//             "chat-members-container",
//             "user-face-icon-wrapper",
//             "chat-profile",
//             "chat-list",
//             "user-face-icon user-profile-icon",
//             "status-indicator",
//             "payment-remainder", ""];

//         if (event.target instanceof HTMLElement) {
//             const clickedElement = event.target as HTMLElement;

//             // Check if clicked element is an SVG element or has className corresponding to SVG icon
//             const isSVGElement = (clickedElement as any).ownerSVGElement;

//             // Check if the clicked element's class name or it's an SVG element
//             if (chatdetailsRef.current && !chatdetailsRef.current.contains(event.target as Node) && !classNamesToExclude.includes(clickedElement.className) && !isSVGElement) {
//                 // setIsOpenMyProfile(false);
//                 // setShowNotification(false);
//                 chatIconClick(false)
//             }
//         }
//     };
//     document.addEventListener('click', handleClickOutside);

//     return () => {
//         document.removeEventListener('click', handleClickOutside);
//     };
// }, []);