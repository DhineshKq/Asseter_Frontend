import React, { useEffect } from 'react'
import '../../../styles/modal/changes-modal.scss'
import { RxCross1 } from 'react-icons/rx';
import ButtonComponent from '../form-elements/button-component';


interface Styles {
    closeModal: () => void;
    leavePage: () => void;
    handleClose: () => void;
    modelType?: string;
    type?: string
}

export default function Changesmodal({ closeModal, leavePage, type, handleClose, modelType }: Styles) {

    useEffect(() => {
        if (document.querySelector(".changes-modal")?.parentElement?.className == "side-main-navbar") {
            (document.querySelector(".sidebar") as HTMLElement).style.zIndex = "11";
            (document.querySelector(".header") as HTMLElement).style.zIndex = "10";
        } else {
            (document.querySelector(".sidebar") as HTMLElement).style.zIndex = "10";
            (document.querySelector(".header") as HTMLElement).style.zIndex = "11";
        }
    }, [])

    return (

        <div className={"changes-modal"}>
            <div className={"container"}>
                {/* <div className={"close-icon"}>
                    <span className={"cross-icon"}>
                        <RxCross1 style={{ fontSize: "40px" }} onClick={handleClose} />
                    </span>
                </div> */}

                <div className={'changes-title'}>

                    {
                        modelType == "navigate-radiobtn" ?
                            <div className={"title"}>{type === "logout" ? "" : "Leave this page?"}</div>
                            :
                            <div className={"title"}>{type === "logout" ? "" : "Leave this page?"}</div>
                    }
                    {
                        modelType == "navigate-radiobtn" ?
                            <div className={"sub-title"}>{type === "logout" ? "Are you sure want to exit application?" : "Changes you made will not be saved."}</div>
                            :
                            <div className={"sub-title"}>{type === "logout" ? "Are you sure want to exit application?" : "Changes you made will not be saved."}</div>
                    }
                    <div className={"content"}>
                    </div>

                    <div className={"buttons"} >
                        {
                            modelType == "navigate-radiobtn" ?
                                <>
                                    <ButtonComponent
                                        title={"Stay"}
                                        height={"50px"}
                                        width={"140px"}
                                        backgroundColor={"var(--btn-primary-bg)"}
                                        color={"white"}
                                        className={"button-component-hover cancel"}
                                        handleClick={closeModal}
                                    />
                                    <ButtonComponent
                                        title={"Leave"}
                                        height={"50px"}
                                        width={"140px"}
                                        backgroundColor={"var(--btn-primary-bg)"}
                                        color={"white"}
                                        handleClick={leavePage}
                                        className={"button-component common-btn"}
                                    />
                                </>
                                :
                                <>
                                    <ButtonComponent
                                        title={type === "logout" ? "Yes" : "Stay"}
                                        height={"50px"}
                                        width={"140px"}
                                        backgroundColor={"var(--btn-primary-bg)"}
                                        color={"white"}
                                        className={"button-component-hover cancel"}
                                        handleClick={closeModal}
                                    />
                                    <ButtonComponent
                                        title={type === "logout" ? "No" : "Leave"}
                                        height={"50px"}
                                        width={"140px"}
                                        backgroundColor={"var(--btn-primary-bg)"}
                                        color={"white"}
                                        handleClick={leavePage}
                                        className={"button-component common-btn"}
                                    />
                                </>
                        }
                    </div>
                </div>
            </div>



        </div >

    )
}

