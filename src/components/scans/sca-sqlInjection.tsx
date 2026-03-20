import React, { useEffect, useRef, useState } from 'react';
import '../../styles/pages/scans/scans.scss';
import '../../styles/common-component/page-heading.scss';
import DropdownComponent from '../common-component/form-elements/dropdown-component';
import ButtonComponent from '../common-component/form-elements/button-component';
import Alertbox from '../common-component/modals/alertbox-modal';
import { getListOfDomain } from '../scan-components/Scan-components';
import { v4 as uuidv4 } from 'uuid';
import Loader from '../common-component/loader/Loader';
import RadioOrCheckbox from '../common-component/form-elements/radio-or-checkbox'

interface propsType {
    setscanPageView: (val: string) => void;
}

export default function ScanvulnerPage({ setscanPageView }: propsType) {
    const [dropDownOptions, setDropDownOptions] = useState<any>();
    const [targetName, setTargetName] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [scanOutput, setScanOutput] = useState<string>("");
    const [showAlertBox, setShowAlertBox] = useState(false);
    const [showMessage, setShowMessage] = useState<string>("");
    const [showType, setShowType] = useState("warning");
    const [scanType, setScanType] = useState("Quick Scan");


    const clearAlert = () => {
        setTimeout(() => {
            setShowAlertBox(false);
            setShowMessage("");
        }, 5000);
    };



    useEffect(() => {
        const fetchDomains = async () => {
            const options = await getListOfDomain("webanddomain");
            setDropDownOptions(options);
        };
        fetchDomains();
    }, []);


    return (
        <div className="scans-main-page">
            <div className="pageHeader">
                <div className="Breadcrumb">
                    <h2 className='pageHeading' style={{ cursor: "pointer" }} onClick={() => setscanPageView("Grid")}>{"Scans"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }}>{">"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px", cursor: "pointer" }} onClick={() => setscanPageView("Main")}>{" New Scan"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }}>{">"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }}>{"Sql Injection"}</h2>
                </div>
            </div>

            <div className='main-container'>
                <div className="formSpace">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "400px" }} key={uuidv4()}>
                            <DropdownComponent
                                options={dropDownOptions}
                                isDisabled={false}
                                placeHolder={"Select Target"}
                                width={"100%"}
                                defaultValue={[targetName]}
                                color={"var(--input-bg)"}
                                getData={(val) => {
                                    setTargetName(val);
                                }}
                            />
                        </div>

                        <div>
                            <ButtonComponent
                                title={"Scan"}
                                height={"40px"}
                                width={"100px"}
                                backgroundColor={"var(--btn-primary-bg)"}
                                color={"white"}
                                className={"button-component-hover cancel"}
                                handleClick={clearAlert}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div style={{ display: "flex", marginTop: "20px", gap: "15px" }}>
                        {/* <div>
                            <p style={{color:'var(--input-text-color)'}}>
                                Select Scan Type:
                            </p>
                        </div> */}

                        <RadioOrCheckbox
                            value="Quick Scan"
                            type="radio"
                            name="scanType"
                            checkedValue={scanType}
                            getVal={(val: any) => {
                                setScanType(val);
                            }}
                        />
                        <RadioOrCheckbox
                            value="Deep Scan"
                            type="radio"
                            name="scanType"
                            checkedValue={scanType}
                            getVal={(val: any) => {
                                setScanType(val);
                            }}
                        />
                    </div>

                    {showAlertBox && (
                        <div className='alert-warp'>
                            <Alertbox type={showType} message={showMessage} />
                        </div>
                    )}

                    {/* Terminal output display */}

                    {scanOutput && (
                        <>


                        </>
                    )}
                </div>
            </div>
            {isLoading && <Loader />}
        </div >
    );
}
