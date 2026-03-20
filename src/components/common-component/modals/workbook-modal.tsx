import React, { useEffect, useRef, useState } from 'react'
import "../../../styles/modal/workbook-modal.scss"
import { RxCross1 } from 'react-icons/rx'
import InputComponent from '../form-elements/input-component';
import IconButton from '../form-elements/icon-button';
import ButtonComponent from '../form-elements/button-component';
import useAxiosPrivate from '../../../services/hooks/useaxios-private';
import { FaCloudUploadAlt } from 'react-icons/fa';
import Alertbox from './alertbox-modal';


interface InvoiceDocUploadProp {
    closeModel: (val: any) => void
    setCurrentUploadedImage: (val: any) => void
    setShowType: (val: any) => void
    setShowMessage: (val: any) => void
    setShowAlertBox: (val: any) => void
    currentUploadedImage: any
}
export default function InvoiceDocUploadModel({ closeModel,setShowType, setShowMessage, setShowAlertBox, setCurrentUploadedImage, currentUploadedImage }: InvoiceDocUploadProp) {
    const fileInputRef = useRef<HTMLInputElement | any>(null);

    const [openImageCrop, setOpenImageCrop] = useState(false);
    // const [showType, setShowType] = useState("warning") // error message showType
    // const [showMessage, setShowMessage] = useState<string>("") // error message showMessage
    // const [showAlertBox, setShowAlertBox] = useState(false) // error message ShowAlertBox
    const [isDragging, setIsDragging] = useState(false);
    // vessel images 


    const dragOver = (e: any) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const dragEnter = (e: any) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const dragLeave = (e: any) => {
        e.preventDefault();
        setIsDragging(false);
    }

    const fileDrop = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        let fileObj;
        setIsDragging(false);
        if (e.dataTransfer) {
            const { files } = e.dataTransfer;
            fileObj = files;
        } else {
            fileObj = e.target.files;
        }
        fileHandler(fileObj);
    };

    const handleClickExcel = () => {
        fileInputRef.current!.click();
    };

    // const fileHandler = async (e: any, drag: any) => {
    //     let fileObj: any = "";
    //     if (drag) {
    //         fileObj = e;
    //     } else {
    //         e.preventDefault();
    //         fileObj = e.target.files[0];
    //     }
    //     const allowedFormats = [
    //         "image/png", // PNG
    //         "image/jpeg", // JPEG
    //     ];
    //     const validFormat = allowedFormats.includes(fileObj?.type);
    //     if (!validFormat) {
    //         // Alert("danger", "Unsupported file format. Upload JPEG or PNG or JPG file format.", true, '')
    //         return;
    //     }
    //     if (fileObj.size > 2000000) {
    //         fileInputRef.current!.value = '';
    //         // Alert("danger", "File size exceeds the maximum 2MB. Compress the file and upload again.", true, '')

    //         return;
    //     }
    //     // dispatch(resetFormModified(true));
    //     setCurrentUploadedImage(fileObj);
    //     setOpenImageCrop(true);
    //     fileInputRef.current!.value = null; // Set null to clear the input value
    // }
    const clearAleart = () => {
        const timer = setTimeout(() => {
            setShowAlertBox(false)
            setShowMessage("");
            clearTimeout(timer);
        }, 5000);
    }
    const fileHandler = async (files: FileList) => {
        const file = files[0];
        // Check if a file is selected
        if (file) {
            // Check if the file type is allowed
            const allowedFileTypes = ['jpeg', 'jpg' ,'png', 'pdf'];
            const fileType = file.name.split('.').pop()?.toLowerCase() || '';
            closeModel(false);

            if (allowedFileTypes.includes(fileType)) {
                if (file.size > 2000000) {
                    setShowAlertBox(true);
                    setShowType("danger");
                    setShowMessage("File size should not exceed 2 MB.");
                    clearAleart();
                    return;
                }
                setShowAlertBox(true);
                setShowType('success');
                setShowMessage('Document uploaded successfully.');
                clearAleart();
                setCurrentUploadedImage(file);
                fileInputRef.current!.value = '';
                // dispatch(resetFormModified(true));
                // Additional logic if needed, e.g., store the file in state
            } else {
                setShowAlertBox(true);
                setShowType('warning');
                setShowMessage('Unsupported file type. Please select a file in either JPEG, PNG, PDF format.');
                clearAleart();
            }
            // fileInputRef.current!.value = null; // Set null to clear the input value
        }
    };
    const handleFileUpload = async () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        };
    }
    return (
        <div className={"invoice-doc-upload-modal"}>
            <div className={"invoice-doc-upload-container"}>
                <div className={"close-icon"}>
                    <span className={"cross-icon"}>
                        <RxCross1 onClick={(val) => { closeModel(false) }} style={{ fontSize: "30px" }} />
                    </span>
                </div>
                {/* //style={vesselImages.length >= 12 ? { pointerEvents: "none", opacity: "0.7", cursor: "not-allowed" } : {} */}
                <div className={"invoice-file-upload-modal"}>
                    <div className={"container"}>
                        <div className='sub-container'>
                            <div className={`upload ${isDragging ? 'dragging' : ''}`}
                                style={{ margin: '10px 10px' }}
                                onDragOver={dragOver}
                                onDragEnter={dragEnter}
                                onDragLeave={dragLeave}
                                onDrop={fileDrop}
                                onClick={handleClickExcel}
                            >
                                <input
                                    type='file'
                                    ref={fileInputRef}
                                    autoFocus
                                    disabled={false}
                                    onChange={(e: any) => { fileDrop(e) }}
                                    style={{ display: 'none' }}
                                    accept='.png, .jpg, .jpeg, image/png, image/jpeg'
                                />
                                <FaCloudUploadAlt style={{ fontSize: "90px", color: "#295285" }} />
                                <div style={{ margin: '0px 0px 0px 0px', fontSize: "18px" }}>Drag and Drop file</div>
                                <div style={{ margin: '0px 0px 0px 0px', fontSize: "15px" }}>or</div>
                                <div className={"buttons"}>
                                    <ButtonComponent
                                        title={"Add"}
                                        height={"40px"}
                                        width={"130px"}
                                        backgroundColor={"#295285"}
                                        color={"white"}
                                        margin={"0px 8px"}
                                        className={"button-component common-btn"}
                                        handleClick={() => {
                                            // handleClickExcel()
                                        }}
                                    />
                                </div>
                                <div style={{ margin: '0px 0px 0px 0px', fontSize: "18px" }}>(Maximum upload file size 2MB)</div>
                                <div style={{ margin: '0px 0px 0px 0px', fontSize: "18px" }}>(Allowed formats: PNG, JPEG, JPG, PDF)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* {
                showAlertBox &&
                <div className='alert-warp'>
                    <Alertbox type={showType} message={showMessage} />
                </div>

            } */}
        </div>
    )
}
