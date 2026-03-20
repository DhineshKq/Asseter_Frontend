import React, { useEffect, useState } from 'react'
import '../../../styles/common-components/vessel-image-view-modal.scss'
import { RxCross1 } from "react-icons/rx";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { PiDotOutlineBold } from "react-icons/pi";
import { PiDotOutlineLight } from "react-icons/pi";
import { GoDotFill } from "react-icons/go";
import { GoDot } from "react-icons/go";
import images from '../../../assets/images/imagePlaceHolder.svg'
import { Image, Row } from 'react-bootstrap';
import ButtonComponent from '../form-elements/button-component';
interface VesselImageViewModalProps {
    closePopup: () => void;
    deleteImage?: (val: any, currenIndex: number) => void;
    vesselImages: any;
    firstIndexToDisplay?: any
    requiredDelete?: boolean
    vesselDetails: any
}

export default function VesselImageViewModal({ vesselImages, requiredDelete = false, deleteImage, closePopup, firstIndexToDisplay = 0, vesselDetails }: VesselImageViewModalProps) {
    // let vesselImages = ['djfhv', 'dfbgj', "dgfag", 'drgehr']

    const [currentViewingImage, setcurrentViewingImage] = useState<any>({})
    const [currenIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (vesselImages.length > 0) {
            setcurrentViewingImage(vesselImages[firstIndexToDisplay])
            setCurrentIndex(firstIndexToDisplay)
        }
    }, [])


    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closePopup();
            }
        };

        // Add event listener for the 'keydown' event
        document.addEventListener('keydown', handleKeyPress);
        // Remove the event listener when the component is unmounted
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [])


    return (
        <div className={"vessel-image-view-modal"}>
            <div className={"container-vessel-image-view-modal"}>
                <div className='container-vessel-image-headder'>
                    <div className='container-vessel-image-vesselbg'>
                        <span>Vessel Photos - IMO: {vesselDetails.IMO_Number}</span>
                    </div>
                    <div>
                        <div className={"close-icon"}>
                            <span className={"cross-icon"}>
                                <RxCross1 onClick={() => { closePopup() }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            closePopup()
                                        }
                                    }}
                                    style={{ fontSize: "30px" }} />
                            </span>
                        </div>
                    </div>
                </div>
                <div className='vessel-image-boddy-wrapper'>
                    <div
                        className='left-arrow-wrapper'
                        style={currenIndex === 0 ? { cursor: 'not-allowed', opacity: '0.5' } : { cursor: 'pointer', opacity: '1' }}
                        onClick={() => {
                            if (currenIndex > 0) {
                                setcurrentViewingImage(vesselImages[currenIndex - 1])
                                setCurrentIndex(currenIndex - 1)
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (currenIndex > 0) {
                                    setcurrentViewingImage(vesselImages[currenIndex - 1])
                                    setCurrentIndex(currenIndex - 1)
                                }
                            }
                        }}
                    >
                        <p>
                            <IoIosArrowBack style={{ fontSize: "30px", color: '#295285' }} />
                        </p>
                    </div>
                    <div className='image-wrapper-vessal' style={{ position: 'relative' }}>
                        <Image src={currentViewingImage && currentViewingImage.src ? currentViewingImage.src : images} thumbnail style={currentViewingImage && currentViewingImage.src ? { height: "495px", width: "100%", userSelect: "none" } : { height: "495px", width: "100%", userSelect: "none", paddingBottom: "150px", paddingTop: "60px" }} />
                        <div className='vessal-details-in-image'>
                            <div className='vessal-details-in-image-sub' style={{ borderRight: "1px solid white", paddingRight: '10px' }}>
                                <div className='vessal-details-in-image-contant'>
                                    <p>IMO:</p>
                                    <p> {vesselDetails.IMO_Number}</p>
                                </div>
                                <div className='vessal-details-in-image-contant'>
                                    <p>MMSI:</p>
                                    <p> {vesselDetails.MMSI}</p>
                                </div>
                            </div>
                            <div className='vessal-details-in-image-sub' style={{ borderRight: "1px solid white", paddingRight: '10px' }}>
                                <div className='vessal-details-in-image-contant'>
                                    <p>DW:</p>
                                    <p>{vesselDetails.summer_dead_weight} {vesselDetails.summer_dead_weight && `(${vesselDetails.summer_dead_weight_unit})`}</p>
                                </div>
                                <div className='vessal-details-in-image-contant'>
                                    <p>GT:</p>
                                    <p>{vesselDetails.gross_tonnage} {vesselDetails.gross_tonnage && `(${vesselDetails.gross_tonnage_unit})`}</p>
                                </div>
                            </div>
                            <div className='vessal-details-in-image-sub'>
                                <div className='vessal-details-in-image-contant'>
                                    <p>Length:</p>
                                    <p>{vesselDetails.length} {vesselDetails.length && `(${vesselDetails.length_unit})`}</p>
                                </div>
                                <div className='vessal-details-in-image-contant'>
                                    <p>Breadth:</p>
                                    <p>{vesselDetails.breadth} {vesselDetails.breadth && `(${vesselDetails.breadth_unit})`}</p>
                                </div>
                            </div>
                        </div>
                        {

                            vesselImages.length === 0 &&
                            <div className='no-images'>
                                No photos uploaded yet.
                            </div>
                        }
                    </div>
                    <div
                        className='right-arrow-wrapper'
                        style={currenIndex === vesselImages.length - 1 || vesselImages.length === 0 ? { cursor: 'not-allowed', opacity: '0.5' } : { cursor: 'pointer', opacity: '1' }}
                        onClick={() => {
                            if (currenIndex === vesselImages.length - 1 || vesselImages.length === 0) return;
                            setcurrentViewingImage(vesselImages[currenIndex + 1])
                            setCurrentIndex(currenIndex + 1)
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (currenIndex === vesselImages.length - 1 || vesselImages.length === 0) return;
                                setcurrentViewingImage(vesselImages[currenIndex + 1])
                                setCurrentIndex(currenIndex + 1)
                            }
                        }}
                    >
                        <p>
                            <IoIosArrowForward style={{ fontSize: "35px", color: '#295285' }} />
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: "20px" }}>{
                    vesselImages.map((data: any) => {
                        return (
                            <span>
                                {
                                    currentViewingImage === data ?
                                        <GoDotFill style={{ fontSize: "25px", color: '#295285' }} /> :
                                        <GoDot style={{ fontSize: "25px", color: '#295285' }} />
                                }
                            </span>
                        )
                    })
                }
                </div>
                {
                    requiredDelete &&
                    <Row sm={12} style={{ justifyContent: "center", alignItems: 'center', width: '100%', marginBottom: "30px" }} >
                        <ButtonComponent
                            title={"Cancel"}
                            height={"45px"}
                            width={"150px"}
                            backgroundColor={"white"}
                            border={"1px solid #295285"}
                            color={'#295285'}
                            margin={"0px 8px"}
                            className={"button-component common-btn"}
                            handleClick={() => {
                                closePopup()
                            }}
                        />
                        <ButtonComponent
                            title={"Delete"}
                            height={"45px"}
                            width={"150px"}
                            backgroundColor={"#295285"}
                            color={"white"}
                            margin={"0px 8px"}
                            disabled={false}
                            //    className={isChecked ? "button-component common-btn" : "button-component-hover disabled"}
                            className={"button-component common-btn"}
                            handleClick={() => {
                                deleteImage && deleteImage(currentViewingImage, currenIndex);
                            }}
                        />
                    </Row>
                }
            </div>
        </div>
    )
}