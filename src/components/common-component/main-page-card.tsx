import React from 'react'
import "../../styles/common-component/main-page-card.scss"

interface propsType {
    children:React.ReactNode
}

function MainPageCard({children}:propsType) {
   
  return (
    <div className='main-page-card-component'>{children}</div>
  )
}

export default MainPageCard