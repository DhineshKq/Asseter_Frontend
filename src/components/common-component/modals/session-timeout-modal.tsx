import React from 'react'
import '../../../styles/modal/changes-modal.scss'
import { RxCross1 } from 'react-icons/rx';
import ButtonComponent from '../form-elements/button-component';


interface Styles {
    closeModal: () => void;
    leavePage: () => void;
    countdown?: any
}

export default function SessionTimeoutmodal({ closeModal, leavePage, countdown }: Styles) {

    return (

        <div className={"changes-modal"}>
            <div className={"container"} style={{ padding: "20px" }}>
                <div className={'changes-title'}>
                    <div className={"sub-title"}>{`Your session will expire in ${countdown} seconds.`}</div>

                    <div className={"buttons"} style={{ marginTop: "30px" }} >
                        <ButtonComponent
                            title={"Stay"}
                            height={"50px"}
                            width={"140px"}
                            backgroundColor={"white"}
                            border={"1px solid #295285"}
                            color={'#295285'}
                            margin={"0px 0px"}
                            className={"button-component common-btn"}
                            handleClick={closeModal}
                        />
                        <ButtonComponent
                            title={"Leave"}
                            height={"50px"}
                            width={"140px"}
                            backgroundColor={"#295285"}
                            color={"white"}
                            margin={"0px 8px"}
                            disabled={false}
                            className={"button-component common-btn"}
                            handleClick={leavePage}
                        />
                    </div>
                </div>
            </div>



        </div >

    )
}

