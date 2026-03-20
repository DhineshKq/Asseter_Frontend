import React, { useEffect, useState } from 'react'
import '../../styles/pages/assets/assets.scss'
import ButtonComponent from '../../components/common-component/form-elements/button-component';
import { axiosPrivate } from '../../middleware/axios-api';
import Alertbox from '../../components/common-component/modals/alertbox-modal';

interface propsType {
    setassetsPageView: (val: string) => void;
    setEditAssets: (val: number) => void;
    editAssetId: string;
    setOriginalRowData: (val: string) => void;
}


export default function AssetsEdit({ setassetsPageView, setEditAssets, editAssetId, setOriginalRowData }: propsType) {

    const cancelActoin = () => {
        setassetsPageView("Grid")

    };
    
    
    const clearAleart = (status: any) => {
        const timer = setTimeout(() => {
            setShowAlertBox(false)
            setShowMessage("");
            clearTimeout(timer);
        }, 5000);
    }
    const [targetName, setTargetName] = useState('');
    const [target, setTarget] = useState('');
    const [error, setError] = useState('');
    const isFormInvalid = targetName.trim() === '' || target.trim() === '' || error !== '';
    const [showAlertBox, setShowAlertBox] = useState(false)
    const [showMessage, setShowMessage] = useState<string>("")
    const [showType, setShowType] = useState("warning")
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


    async function getAssetsDetailsById(id: any) {
        try {
            const workspaceId = localStorage.getItem("workspaceId"); // 👈 Get workspaceId

            const response = await axiosPrivate.get(`/getAssetsDetailsById/${id}`, {
                params: {
                    workspaceId: workspaceId
                }
            });

            if (response.data.status) {
                const asset = response.data.data;
                setTargetName(asset?.name || '');
                setTarget(asset?.targets || '');
            } else {
                console.log("API responded with error:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching asset data:", error);
        }
    }




    async function updateAssetById() {
        try {
            const workspaceId = localStorage.getItem("workspaceId");

            const payload = {
                assetId: editAssetId,
                name: targetName,
                targets: target,
                workspaceId // 👈 include this
            };

            const response = await axiosPrivate.put(`/updateAssetById`, payload);

            if (response.data.status) {
                setShowMessage("Asset update successfully!");
                setShowType("success");
                setShowAlertBox(true);
                clearAleart("");
                await getAssetsData();
                setTimeout(() => setassetsPageView("Grid"), 1500);
            } else {
                setShowMessage(`Failed to add asset: ${response.data?.message || "Unknown error"}`);
                setShowAlertBox(true)
                setShowType("danger");
                clearAleart("")
            }
        } catch (error: any) {
            setShowMessage(`${error.response?.data?.message || error.message}`);
            setShowType("danger");
            setShowAlertBox(true);
            clearAleart("");
        }
    }


    useEffect(() => {
        if (editAssetId) {
            getAssetsDetailsById(editAssetId);
        }
      
    }, [editAssetId]);


    const validateTarget = (value: string) => {
        const pattern = /^(?:(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3})$/;

        if (value.trim() === '') {
            setError('');
        } else if (!pattern.test(value)) {
            setError('Please enter a valid IP address or domain (e.g. 172.25.10.240 or example.com)');
        } else {
            setError('');
        }
    };

    return (
        <div className={"add-modal"}>
            {

                <div className={"container"}>
                    <h2 className='pageHeading'>Edit Assets</h2>
                    <div className='heading-line'></div>
                    <div className="formSpace">
                        <div className='inputfield'>
                            <label htmlFor="Username" className="form-label fieldLabel">
                                Target Name
                            </label>
                            <input
                                autoFocus={true}
                                type="text"
                                autoComplete="off"
                                className="form-control formFormat"
                                id="targetName"
                                placeholder="Enter Target's Name"
                                value={targetName}
                                maxLength={100}
                                onChange={(e) => setTargetName(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === ' ' || e.key === ",") {
                                        e.preventDefault();
                                    }
                                }}
                            />
                        </div>


                        <div className='inputfield'>
                            <label htmlFor="targetName" className="form-label fieldLabel">
                                Target
                            </label>
                            <input
                                type="text"
                                autoComplete="off"
                                className={`form-control formFormat ${error ? 'is-invalid' : ''}`}
                                id="targetName"
                                placeholder="Enter Target eg: 172.25.10.1, example.com"
                                maxLength={100}
                                value={target}
                                disabled={true}
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
                            title={"Update"}
                            height={"50px"}
                            width={"150px"}
                            backgroundColor={"var(--btn-primary-bg)"}
                            color={"white"}
                            margin={"0px"}
                            className={"button-component-hover common-btn"}
                            handleClick={updateAssetById}
                            disabled={isFormInvalid}
                        />
                    </div>

                </div>
            }{
                showAlertBox &&
                <div className='alert-warp'>
                    <Alertbox type={showType} message={showMessage} />
                </div>
            }


        </div>
    )


}