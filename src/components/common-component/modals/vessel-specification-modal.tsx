import React, { useState } from 'react'
import '../../../styles/modal/vessel-specification-modal.scss'
import { Col, Row } from 'react-bootstrap'
import InputComponent from '../form-elements/input-component'
import ButtonComponent from '../form-elements/button-component'
import Changesmodal from './changes-modal'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { resetFormModified } from '../../../redux/action'

interface Props {
    handleClose: (value: boolean) => void
    VesselDatas: (value: any) => void
    submitFun: () => void
    vesselDatas: any
    errorShow: any
    type: any
    errorMessage: any
}
export default function VesselSpecification({ handleClose, type, errorShow, errorMessage, submitFun, VesselDatas, vesselDatas }: Props) {

    const [showChangesModal, setShowChangesModal] = useState<boolean>(false);//changes modal
    const [currentLeavingPage, setCurrentLeavingPage] = useState('')
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isFormModified = useSelector((state: any) => state.isFormModified);

    const formatAmount = (amount: any) => {
        if (amount && amount !== ".") {
            const onlyNumber: any = amount.toString().replace(/[^0-9.-]/g, "");
            // Handle empty input
            if (onlyNumber === "") {
                return "";
            }
            // Split input into integer and decimal parts
            const parts = onlyNumber.split(".");
            const integerPart = parts[0];
            const decimalPart = parts[1] || "";
            // Format the integer part with commas
            const formattedInteger = parseFloat(integerPart).toLocaleString();
            // Handle complete decimal input (e.g., "5000.50")
            if (decimalPart !== "") {
                return `${formattedInteger}.${decimalPart}`;
            }
            // Handle incomplete decimal input (e.g., "5000.")
            if (amount.toString().endsWith(".")) {
                return `${formattedInteger}.`;
            }
            // Return formatted integer
            return formattedInteger;
        }
        return "";
    };
    return (
        <div>
            <div className={"vessel-specifications-modal"}>
                <div className={"vessel-specifications-container"}>
                    <div>
                        <div className='vessel-spec-heading'>
                            {`Baltic ${type} Vessel Specifications`}
                        </div>
                    </div>
                    <Row style={{ marginTop: "25px", marginBottom: "10px" }}>
                        <Col>
                            <InputComponent
                                height={"40px"}
                                width={"100%"}
                                margin={"0px 0px 0px 0px"}
                                padding={"10px"}
                                border={errorShow.deadWeight ? "1px solid red" : "1px solid #A9C3DC"}
                                borderRadius={"5px"}
                                textAlign={"right"}
                                backgroundColor={"white"}
                                color={"black"}
                                type={"text"}
                                errorMessage={errorMessage.deadWeight}
                                inputTitle={"Dead Weight"}
                                maxLength={5}
                                placeHolder={'Enter Dead Weight'}
                                disabled={false}
                                required={true}
                                inputValue={formatAmount(vesselDatas.deadWeight)}
                                getUser={(value) => {
                                    if (value.startsWith('.')) {
                                        value = '0' + value;
                                    }
                                    const deadWeight = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1');

                                    // let speed_in_KTS = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, 
                                    VesselDatas((prevState: any) => ({
                                        ...prevState,
                                        deadWeight: deadWeight,
                                    }));
                                    dispatch(resetFormModified(true));
                                }}
                            />
                        </Col>
                        <Col>
                            <InputComponent
                                height={"40px"}
                                width={"100%"}
                                margin={"0px 0px 0px 0px"}
                                padding={"10px"}
                                border={errorShow.ballastSpd ? "1px solid red" : "1px solid #A9C3DC"}
                                borderRadius={"5px"}
                                textAlign={"right"}
                                backgroundColor={"white"}
                                color={"black"}
                                type={"text"}
                                errorMessage={errorMessage.ballastSpd}
                                inputTitle={"Ballast Speed"}
                                maxLength={10}
                                placeHolder={'Enter Ballast Speed'}
                                disabled={false}
                                required={true}
                                inputValue={formatAmount(vesselDatas.ballastSpd)}
                                getUser={(value) => {
                                    if (value.startsWith('.')) {
                                        value = '0' + value;
                                    }
                                    const ballastSpd = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1');
                                    // let speed_in_KTS = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, 
                                    VesselDatas((prevState: any) => ({
                                        ...prevState,
                                        ballastSpd: ballastSpd,
                                    }));

                                    dispatch(resetFormModified(true));
                                }}
                            />
                        </Col>
                        <Col>
                            <InputComponent
                                height={"40px"}
                                width={"100%"}
                                margin={"0px 0px 0px 0px"}
                                padding={"10px"}
                                border={errorShow.ladenSpd ? "1px solid red" : "1px solid #A9C3DC"}
                                borderRadius={"5px"}
                                textAlign={"right"}
                                errorMessage={errorMessage.ladenSpd}
                                backgroundColor={"white"}
                                color={"black"}
                                type={"text"}
                                inputTitle={"Laden Speed"}
                                maxLength={10}
                                placeHolder={'Enter Laden Speed'}
                                disabled={false}
                                required={true}
                                inputValue={formatAmount(vesselDatas.ladenSpd)}
                                getUser={(value) => {
                                    if (value.startsWith('.')) {
                                        value = '0' + value;
                                    }
                                    const ladenSpd = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1');
                                    // let speed_in_KTS = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, 
                                    VesselDatas((prevState: any) => ({
                                        ...prevState,
                                        ladenSpd: ladenSpd,
                                    }));

                                    dispatch(resetFormModified(true));
                                }}
                            />
                        </Col>
                    </Row>
                    <Row >
                        <Col>
                            <InputComponent
                                height={"40px"}
                                width={"100%"}
                                margin={"0px 0px 0px 0px"}
                                padding={"10px"}
                                border={errorShow.ballastCons ? "1px solid red" : "1px solid #A9C3DC"}
                                borderRadius={"5px"}
                                textAlign={"right"}
                                backgroundColor={"white"}
                                color={"black"}
                                errorMessage={errorMessage.ballastCons}
                                type={"text"}
                                inputTitle={"Ballast Cons"}
                                maxLength={10}
                                placeHolder={'Enter Ballast Cons'}
                                disabled={false}
                                required={true}
                                inputValue={formatAmount(vesselDatas.ballastCons)}
                                getUser={(value) => {
                                    if (value.startsWith('.')) {
                                        value = '0' + value;
                                    }
                                    const ballastCons = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1');
                                    // let speed_in_KTS = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, 
                                    VesselDatas((prevState: any) => ({
                                        ...prevState,
                                        ballastCons: ballastCons,
                                    }));

                                    dispatch(resetFormModified(true));
                                }}
                            />
                        </Col>
                        <Col>
                            <InputComponent
                                height={"40px"}
                                width={"100%"}
                                margin={"0px 0px 0px 0px"}
                                padding={"10px"}
                                border={errorShow.ladenCons ? "1px solid red" : "1px solid #A9C3DC"}
                                borderRadius={"5px"}
                                textAlign={"right"}
                                backgroundColor={"white"}
                                color={"black"}
                                errorMessage={errorMessage.ladenCons}
                                type={"text"}
                                inputTitle={"Laden Cons"}
                                maxLength={10}
                                placeHolder={'Enter Laden Cons'}
                                disabled={false}
                                required={true}
                                inputValue={formatAmount(vesselDatas.ladenCons)}
                                getUser={(value) => {
                                    if (value.startsWith('.')) {
                                        value = '0' + value;
                                    }
                                    const ladenCons = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1');
                                    // let speed_in_KTS = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, 
                                    VesselDatas((prevState: any) => ({
                                        ...prevState,
                                        ladenCons: ladenCons,
                                    }));

                                    dispatch(resetFormModified(true));
                                }}
                            />
                        </Col>
                        <Col>
                            <InputComponent
                                height={"40px"}
                                width={"100%"}
                                margin={"0px 0px 0px 0px"}
                                padding={"10px"}
                                border={errorShow.inPortCons ? "1px solid red" : "1px solid #A9C3DC"}
                                borderRadius={"5px"}
                                textAlign={"right"}
                                backgroundColor={"white"}
                                color={"black"}
                                errorMessage={errorMessage.inPortCons}
                                type={"text"}
                                inputTitle={"In Port Cons"}
                                maxLength={10}
                                placeHolder={'Enter In Port Cons'}
                                disabled={false}
                                required={true}
                                inputValue={formatAmount(vesselDatas.inPortCons)}
                                getUser={(value) => {
                                    if (value.startsWith('.')) {
                                        value = '0' + value;
                                    }
                                    const inPortCons = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1');
                                    // let speed_in_KTS = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, 
                                    VesselDatas((prevState: any) => ({
                                        ...prevState,
                                        inPortCons: inPortCons,
                                    }));

                                    dispatch(resetFormModified(true));
                                }}
                            />
                        </Col>
                        <Col>
                            <InputComponent
                                height={"40px"}
                                width={"100%"}
                                margin={"0px 0px 0px 0px"}
                                padding={"10px"}
                                border={errorShow.inPortIdle ? "1px solid red" : "1px solid #A9C3DC"}
                                borderRadius={"5px"}
                                textAlign={"right"}
                                backgroundColor={"white"}
                                color={"black"}
                                errorMessage={errorMessage.inPortIdle}
                                type={"text"}
                                inputTitle={"In Port Idle"}
                                maxLength={10}
                                placeHolder={'Enter In Port Idle'}
                                disabled={false}
                                required={true}
                                inputValue={formatAmount(vesselDatas.inPortIdle)}
                                getUser={(value) => {
                                    if (value.startsWith('.')) {
                                        value = '0' + value;
                                    }
                                    const inPortIdle = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1');
                                    // let speed_in_KTS = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, 
                                    VesselDatas((prevState: any) => ({
                                        ...prevState,
                                        inPortIdle: inPortIdle,
                                    }));

                                    dispatch(resetFormModified(true));
                                }}
                            />
                        </Col>
                    </Row>
                    <div className='vessel-border-line' style={{ color: "#B3CAE1" }}></div>

                    <div>
                        <div className='vessel-spec-form-footer' >
                            <div style={{ marginRight: "20px" }}>
                                <ButtonComponent
                                    title={"Cancel"}
                                    height='45px'
                                    width='150px'
                                    backgroundColor='white'
                                    border='1px solid #295285'
                                    color='#295285'
                                    className={"button-component common-btn"}
                                    handleClick={() => {
                                        if (isFormModified) {
                                            setShowChangesModal(true)
                                            setCurrentLeavingPage("Cancel");
                                        } else {
                                            handleClose && handleClose(false)
                                        }

                                        // setPageViewFun('grid', "")
                                    }}
                                />
                            </div>
                            <div style={{ marginRight: "20px" }}>
                                <ButtonComponent
                                    // Object.values(vesselDatas).some((data: any) => (data === ''))  ? "No" :
                                    title={"Save"}
                                    height='45px'
                                    width='150px'
                                    backgroundColor='rgb(41, 82, 133)'
                                    border='1px solid #295285'
                                    color='white'
                                    className={"button-component common-btn"}
                                    // "button-component disabled"
                                    handleClick={() => {
                                        submitFun()
                                        // setRemarkModal(true)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {
                    showChangesModal &&
                    <Changesmodal
                        closeModal={() => setShowChangesModal(false)}
                        handleClose={() => {
                            setShowChangesModal(false);
                        }}
                        leavePage={() => {
                            if (currentLeavingPage == "Cancel") {
                                handleClose(false)
                            }
                            dispatch(resetFormModified(false));
                        }} />

                }
            </div>
        </div>
    )
}
