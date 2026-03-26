import React, { useState } from 'react'
import SideMainNavbar from './side-navbar/side-main-navbar'
import "../styles/layouts/layout.scss"
import Header from './header-layout/header';

interface LayoutProps {
  children?: React.ReactNode;
  setActiveTitleMyaccount: (val: string) => void;
  setDocumentationNav: (val: string) => void;
  documentationNav: string;
}

function Layout({ children, setActiveTitleMyaccount, documentationNav, setDocumentationNav }: LayoutProps) {
  const [filterIconStatus, setFilterIconStatus] = useState(true)

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
        />
      </div>
      <div className={`layout-center ${filterIconStatus ? 'layout-center-sidebar-open' : ''}`} >{children}</div>
    </div>
  )
}

export default Layout;
