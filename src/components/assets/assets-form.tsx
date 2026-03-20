import React, { useEffect, useState } from 'react'
import '../../styles/pages/assets/assets.scss'
import ButtonComponent from '../../components/common-component/form-elements/button-component';
import { axiosPrivate } from '../../middleware/axios-api';
import Alertbox from '../../components/common-component/modals/alertbox-modal';

interface propsType {
    setassetsPageView: (val: string) => void;
    setRefreshGrid: (val: boolean) => void;
    setOriginalRowData: (val: string) => void;

}

export default function AssetsFormView({ setassetsPageView, setRefreshGrid, setOriginalRowData }: propsType) {
    const [showAlertBox, setShowAlertBox] = useState(false)
    const [showMessage, setShowMessage] = useState<string>("")
    const [showType, setShowType] = useState("warning")
    const [targetName, setTargetName] = useState('');
    const [target, setTarget] = useState('');
    const [error, setError] = useState('');
    const isFormInvalid = targetName.trim() === '' || target.trim() === '' || error !== '';
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                cancelActoin();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const clearAleart = (status: any) => {
        const timer = setTimeout(() => {
            setShowAlertBox(false)
            setShowMessage("");
            clearTimeout(timer);
        }, 5000);
    }

    const cancelActoin = () => {
        setassetsPageView("Grid")

    };


    async function getAssetsData() {
        try {
            const workspaceId = localStorage.getItem("workspaceId"); // 👈 get from localStorage

            const response = await axiosPrivate.get('/getAssetsData', {
                params: {
                    workspaceId: workspaceId
                }
            });

            if (response.data.status) {
                setOriginalRowData(response.data.data);
            } else {
                console.log("API responded with error:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching asset data:", error);
        }
    }

    async function addAssets() {
        try {
            const workspaceId = localStorage.getItem("workspaceId");

            if (!workspaceId) {
                setShowMessage("Workspace ID is missing!");
                setShowType("error");
                setShowAlertBox(true);
                clearAleart("");
                return;
            }

            const payload = {
                name: targetName,
                targets: target,
                workspaceId
            };

            const response = await axiosPrivate.post('/addAssets', payload);
            if (response.data?.status === true) { // Ensure strict check
                setShowMessage("Asset added successfully!");
                setShowType("success");
                setShowAlertBox(true);
                clearAleart("");
                await getAssetsData();
                setTimeout(() => { setassetsPageView("Grid"); }, 1500);

            } else {
                setShowMessage(`Failed to add asset: ${response.data?.message || "Unknown error"}`);
                setShowType("danger");
                setShowAlertBox(true);
                clearAleart("");
            }
        } catch (error: any) {
            setShowMessage(`${error.response?.data?.message || error.message}`);
            setShowType("danger");
            setShowAlertBox(true);
            clearAleart("");
        }
    }


    const validateTarget = (value: string) => {
        const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;
        const urlRegex = /^https?:\/\/([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
        const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
        const ipRangeRegex = /^(\d{1,3}\.){3}\d{1,3}-(\d{1,3})$/;
        const cidrRegex = /^(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;

        if (value.trim() === '') {
            setError('');
        } else if (
            !(
                domainRegex.test(value) ||
                urlRegex.test(value) ||
                ipRegex.test(value) ||
                ipRangeRegex.test(value) ||
                cidrRegex.test(value)
            )
        ) {
            setError(
                'Enter a valid web domain, URL (http/https), IP address, IP range, or CIDR notation'
            );
        } else {
            setError('');
        }
    };


    return (
        <div className={"add-modal"}>
            {

                <div className={"container"}>
                    <h2 className='pageHeading'>Add Assets</h2>
                    <div className='heading-line'></div>
                    <div className='formSpace'>
                        <div className='inputfield'>
                            <label htmlFor="targetName" className="form-label fieldLabel">Target Name</label>
                            <input
                                autoFocus
                                type="text"
                                autoComplete="off"
                                className="form-control formFormat"
                                placeholder="Enter Target's Name"
                                maxLength={100}
                                onChange={(e) => setTargetName(e.target.value)}
                            />
                        </div>

                        <div className='inputfield'>
                            <label htmlFor="target" className="form-label fieldLabel">Target</label>
                            <input
                                type="text"
                                autoComplete="off"
                                className={`form-control formFormat ${error ? 'is-invalid' : ''}`}
                                placeholder="Enter Target"
                                maxLength={100}
                                value={target}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setTarget(value);
                                    validateTarget(value);
                                }}
                                onKeyPress={(e) => {
                                    if (e.key === ' ' || e.key === ",") {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            {error && <div className="invalid-feedback">{error}</div>}
                        </div>

                    </div>

                    <div className={"buttons"}>
                        <ButtonComponent
                            title={"Cancel"}
                            height={"50px"}
                            width={"150px"}
                            backgroundColor={"var(--btn-primary-bg)"}
                            color={"white"}
                            margin={"0px"}
                            className={"button-component-hover cancel"}
                            handleClick={cancelActoin}
                        />
                        <ButtonComponent
                            title={"Submit"}
                            height={"50px"}
                            width={"150px"}
                            backgroundColor={"var(--btn-primary-bg)"}
                            color={"white"}
                            margin={"0px"}
                            className={"button-component-hover common-btn"}
                            handleClick={addAssets}
                            disabled={isFormInvalid}
                        />
                    </div>

                </div>
            }      {
                showAlertBox &&
                <div className='alert-warp'>
                    <Alertbox type={showType} message={showMessage} />
                </div>
            }


        </div>
    )


}