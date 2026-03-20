import React, { useState } from 'react'
import '../../../styles/modal/remark-modal.scss'
import ButtonComponent from '../form-elements/button-component'
interface Props {
    hideModal: (boolean: any) => void
    remarkValue?: any
}
export default function RemarkModel({ hideModal, remarkValue }: Props) {


    return (


        <div className='remark-modal'>
            <div className='remark-container'>
                <div style={{ textAlign: "center" }} >
                    <b style={{ fontSize: "20px", color: "#295285" }}>

                        {"Remark"}
                    </b>
                </div>
                <div className='remark-content'>
                    {remarkValue}
                </div>

                <div className='remark-footer'>
                    <ButtonComponent
                        title={"Close"}
                        height='45px'
                        width='150px'
                        backgroundColor='white'
                        border='1px solid #295285'
                        color='#295285'
                        className={"button-component common-btn"}
                        handleClick={() => {
                            hideModal(false)
                        }}
                    />
                </div>


            </div>
        </div>
    )
}
