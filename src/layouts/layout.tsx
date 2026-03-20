import React, { useState } from 'react'
import SideMainNavbar from './side-navbar/side-main-navbar'
import "../styles/layouts/layout.scss"
import Header from './header-layout/header';
import ChatModal from '../components/common-component/modals/chat-modal';
import { axiosPrivate } from '../middleware/axios-api';

interface LayoutProps {
  children?: React.ReactNode;
  setActiveTitleMyaccount: (val: string) => void;
  setDocumentationNav: (val: string) => void;
  documentationNav: string;
}

function Layout({ children, setActiveTitleMyaccount, documentationNav, setDocumentationNav }: LayoutProps) {
  const [filterIconStatus, setFilterIconStatus] = useState(true)
  const [chatShowModel, setChatShowModel] = useState(false)
  const [chatDetails, setChatDetails] = useState<any>([])
  const [searchModal, setSearchModal] = useState<string>("hide");
  const [chatName, setChatName] = useState<any>([])
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [receivedCountUpdate, setReceivedCountUpdate] = useState<boolean>(false);
  const [receivedUserStausUpdate, setReceivedUserStausUpdate] = useState<boolean>(false);

  // Function for getting all chat details
  const handleTotalUsers = async () => {
    try {
      const response = await axiosPrivate.get(`message-list/all`);
      if (response.status === 200) {
        setChatDetails(response.data.messages)
        setReceivedCountUpdate(true)
        setReceivedUserStausUpdate(true)
      }
    } catch (error: any) {
    }
  };

  // Function for open person chat page
  const openChatPage = async (recieverId: any, senderId: any) => {
    try {
      const response = await axiosPrivate.post(`chat/All-msgs`, {
        senderId: senderId,
        recieverId: recieverId
      });
      if (response.status === 200) {
        setIsChatOpen(true)
        setChatName(response.data)
        setSearchModal("hide")
      }
    } catch (error: any) {
    }
  };

  // Function for socket Io
  const socketIoChanges = async () => {
    await openChatPage(chatName.reciversid, chatName.senderId);
  }

  return (
    <div className='layout-component' style={documentationNav === "Documentation" ? { display: "unset" } : {}}>
      {
        <div className={`sidebar ${filterIconStatus ? '' : 'sidebar-hidden'}`}><SideMainNavbar filterClick={(val: any) => { setFilterIconStatus(val) }}
        filterIconStatus={filterIconStatus}/></div>
      }

  

      <div className={"header"} style={{ width: "100%" }}>
        <Header
          filterClick={(val: any) => { setFilterIconStatus(val) }}
          filterIconStatus={filterIconStatus}
          chatIconClick={(val: any) => { setChatShowModel(val) }}
          socketIoChanges={() => { socketIoChanges() }}
          chatIconClickStatus={chatShowModel}
          handleTotalUsers={handleTotalUsers}
        />
      </div>
      <div className={`layout-center ${filterIconStatus ? 'layout-center-sidebar-open' : ''}`} >{children}</div>
    </div>
  )
}

export default Layout;