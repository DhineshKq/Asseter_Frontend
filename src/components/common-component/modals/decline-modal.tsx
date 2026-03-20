import React from 'react'
import '../../../styles/modal/decline-modal.scss'
import InputComponent from '../form-elements/input-component'
import TextArea from '../form-elements/text-area'
import ButtonComponent from '../form-elements/button-component'
interface Props {
    hideModal: (boolean: any) => void;
    remarkFun: (val: any) => void;
    submitFun: () => void;
    remarkValue?: any;
}
export default function DeclineModal({ hideModal, remarkFun, remarkValue, submitFun }: Props) {


    return (
        <div className='decline-preview-modal'>
            <div className={"decline-container "}>
                <div>
                    <div>
                        <TextArea
                            height={"120px"}
                            width={"100%"}
                            maxLength={100}
                            padding={"0px 0px 0px 10px"}
                            margin={"0px 0px 5px 0px"}
                            required={true}
                            borderRadius={"5px"}
                            name={"Remarks"}
                            placeHolder={'Enter Remarks'}
                            disabled={false}
                            inputValue={remarkValue}
                            border={'1px solid #B3CAE1'}
                            errorMessage={""}
                            autoFocus
                            getUser={(val) => {
                                remarkFun && remarkFun(val)
                            }} />
                    </div>
                    <div className='decline-footer'>
                        <div >
                            <ButtonComponent
                                title={"Cancel"}
                                height='45px'
                                width='130px'
                                backgroundColor={"var(--btn-primary-bg)"}
                                border='1px solid #295285'
                                color='white'
                                className={"button-component common-btn"}
                                handleClick={() => {
                                    hideModal(false)
                                }}
                            />
                        </div>
                        <div>
                            <ButtonComponent
                                title={"Submit"}
                                height='45px'
                                width='130px'
                                disabled={remarkValue.length === 0 ? true : false}
                                backgroundColor={"var(--btn-primary-bg)"}
                                color='white'
                                className={remarkValue.length === 0 ? "button-component-hover disabled" : "button-component common-btn"}
                                handleClick={() => {
                                    // handleSave()
                                    // setPrintEnable(true)
                                    submitFun()
                                }}

                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

{/* <div>
<div >
    <ButtonComponent
        title={"Cancel"}
        height='45px'
        width='100px'
        backgroundColor='#888888'
        border='1px solid #295285'
        color='white'
        className={"button-component common-btn"}
        handleClick={() => {
            // hidePreview(false)
        }}
    />
</div>
<div>
    <ButtonComponent
        title={"Submit"}
        height='45px'
        width='100px'
        disabled={false}
        backgroundColor='#295285'
        color='white'
        className={"button-component common-btn"}
        handleClick={() => {
            // setPrintEnable(true)

        }}

    />
</div>
</div> */}