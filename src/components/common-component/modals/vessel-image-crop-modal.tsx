import React, { useCallback, useEffect, useState } from 'react'
import '../../../styles/common-components/vessel-image-view-modal.scss'
import { RxCross1 } from "react-icons/rx";
import images from '../../../assets/images/imagePlaceHolder.svg'
import ButtonComponent from '../form-elements/button-component';
import { Col, Row } from 'react-bootstrap';
import Cropper from 'react-easy-crop';
import { getOrientation } from 'get-orientation/browser'
import { getCroppedImg, getRotatedImage } from '../../../helpers/canvasUtils';
import ReactCrop, { type Crop } from 'react-image-crop'
import { axiosPrivate } from '../../../middleware/axios-api';

interface VesselImageViewModalProps {
    closePopup: (val: boolean) => void,
    setImage: (val: any) => void,
    saveImage: (val: any) => void,
    image: any;
    vesselDetails: any;
}

export default function VesselImageCropModal({ closePopup, image, setImage,vesselDetails, saveImage }: VesselImageViewModalProps) {

    let vessalImages = ['djfhv', 'dfbgj', "dgfag", 'drgehr']
    const [zoom, setZoom] = useState(1);
    const [localImage, setLocalImage] = useState<any>('');
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
    const [rotation, setRotation] = useState(0)
    const ORIENTATION_TO_ANGLE: any = {
        '3': 180,
        '6': 90,
        '8': -90,
    }
    const onCropChange = useCallback((crop: any) => {
        setCrop(crop);
    }, []);

    const onZoomChange = useCallback((zoom: any) => {
        setZoom(zoom);
    }, []);

    useEffect(() => {
        handleFileChange(image)
    }, [])


    const handleFileChange = (file: any) => {
        if (file) {
            const reader: any = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // setImage(reader.result);
                setLocalImage(reader.result);
            };
        }
    };

    function readFile(file: any) {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.addEventListener('load', () => resolve(reader.result), false)
            reader.readAsDataURL(file)
        })
    }

    // const handleFileChange = async (e: any) => {
    //     if (e) {
    //         const file = e
    //         let imageDataUrl: any = await readFile(file)
    //         console.log(imageDataUrl)
    //         try {
    //             // apply rotation if needed
    //             const orientation = await getOrientation(file)
    //             const rotation = ORIENTATION_TO_ANGLE[orientation]
    //             if (rotation) {
    //                 imageDataUrl = await getRotatedImage(imageDataUrl, rotation)
    //             }
    //         } catch (e) {
    //             console.warn('failed to detect the orientation')
    //         }
    //         console.log(imageDataUrl, 'imageDataUrl')
    //         setImageSrc(imageDataUrl)
    //     }
    // }


    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
        // console.log(croppedArea, croppedAreaPixels, "dgsffgsdhfghsdfghrsdhrfgjh")
    };


    const showCroppedImage = async () => {
        try {
            const croppedImage: any = await getCroppedImg(
                image,
                localImage,
                croppedAreaPixels,
                rotation
            );


            // const encodedData = croppedImage.split(',')[1];
            // const decodedImage = atob(encodedData)
            // console.log(decodedImage, "----------------------------------------------------->")
            // if (croppedImage) {
            //     try {
            //         const res: any = await axiosPrivate.post(`/base64StringToFile`,
            //             {
            //                 base64String: croppedImage,
            //                 base64String2: croppedImage,
            //                 base64String3: croppedImage,
            //                 base64String4: croppedImage,
            //                 base64String5: croppedImage,
            //                 base64String6: croppedImage,
            //                 base64String7: croppedImage,
            //                 base64String8: croppedImage,
            //                 base64String9: croppedImage,
            //                 base64String10: croppedImage,
            //                 base64String11: croppedImage,
            //                 base64String12: croppedImage,
            //                 base64String13: croppedImage,
            //                 base64String14: croppedImage,
            //                 base64String15: croppedImage,
            //                 base64String16: croppedImage,
            //                 base64String17: croppedImage,
            //                 base64String18: croppedImage,
            //                 filename: image.name,
            //                 mimeType: image.type
            //             });

            //         if (res.status === 200) {
            //             console.log(res, "resvvvvvvvvvvvvvvvvvvv")
            //             const blob = await res.data.blob();
            //             const url = URL.createObjectURL(blob);
            //             closePopup(false)
            //             saveImage(url);
            //         } else {
            //             console.error('Error retrieving image');
            //         }
            //         // console.log(res, 'resresresres')
            //         // if (res.status === 200) {
            //         //     saveImage(res.data.file.file)
            //         //     closePopup(false)
            //         // }
            //     } catch (error) {
            //         console.log(error, "error")
            //     }
            // }




            // const croppedFile: any = await getCroppedFile(image, localImage, croppedAreaPixels, rotation);
            // // console.log(image, croppedAreaPixels, rotation)
            // // console.log('donee', croppedImage, croppedFile)
            // let url = URL.createObjectURL(croppedFile)

            closePopup(false)
            saveImage(croppedImage)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className={"vessel-image-view-modal"}>
            <div className={"container-vessel-image-view-modal"}>
                <div className='container-vessel-image-headder'>
                    <div className='container-vessel-crop-headder'>
                        <span>Vessel Photos - IMO: {vesselDetails.IMO_Number}</span>
                    </div>
                    <div>
                        <div className={"close-icon"}>
                            <span className={"cross-icon"}>
                                <RxCross1 onClick={() => { closePopup(false) }
                                } style={{ fontSize: "30px" }} />
                            </span>
                        </div>
                    </div>
                </div>
                <div className='vessel-image-boddy-wrapper'>
                    <div className='image-wrapper-vessal'>
                        {/* <img src={images} alt="" width={'100%'} />
                         */}
                        <div>
                            {/* <input type="file" onChange={handleFileChange} accept="image/*" /> */}
                            {localImage && (
                                <div className='vessel-croper'>
                                    <Cropper
                                        image={localImage}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={4 / 3} // You can adjust the aspect ratio as needed
                                        onCropChange={onCropChange}
                                        onZoomChange={onZoomChange}
                                        rotation={rotation}
                                        onRotationChange={setRotation}
                                        onCropComplete={onCropComplete}
                                        objectFit={'contain'}
                                    />
                                </div>
                            )}


                        </div>

                    </div>
                </div>


                <Col sm={12}
                    style={{
                        minHeight: '100px',
                        marginTop: '20px'
                    }}>
                    <Row style={{ justifyContent: "center", alignItems: 'center', margin: "10px" }}>
                        <Col >
                            <div>
                                <label htmlFor="zoom">Zoom</label>
                            </div>
                            <input
                                type="range"
                                id='zoom'
                                style={{ cursor: "pointer", width: "95%" }}
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e: any) => {
                                    setZoom(e.target.value)
                                }}

                                className="zoom-range"
                            />
                        </Col>
                        <Col >
                            <div>
                                <label htmlFor="Rotation">Rotation</label>
                            </div>
                            <input
                                type="range"
                                id='Rotation'
                                style={{ cursor: "pointer", width: "95%"  }}
                                value={rotation}
                                min={0}
                                max={360}
                                step={1}
                                aria-labelledby="Rotation"
                                onChange={(e: any) => {
                                    setRotation(e.target.value)
                                }}

                                className="zoom-range"
                            />
                        </Col>
                    </Row>
                    <Row style={{ justifyContent: "center", alignItems: 'center', marginBottom: "10px" }}>
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
                                closePopup(false)
                            }}
                        />
                        <ButtonComponent
                            title={"Save"}
                            height={"45px"}
                            width={"150px"}
                            backgroundColor={"#295285"}
                            color={"white"}
                            margin={"0px 8px"}
                            disabled={false}
                            //    className={isChecked ? "button-component common-btn" : "button-component-hover disabled"}
                            className={"button-component common-btn"}
                            handleClick={() => {
                                // handleCrop()
                                showCroppedImage()
                            }}
                        />
                    </Row>
                </Col>
            </div>
        </div >
    )
}



const getCroppedFile = (originalImage: File, imageSrc: string, crop: any, rotation = 0) => {
    return new Promise((resolve) => {
        const image = new Image();
        image.src = imageSrc;

        image.onload = () => {
            const maxSize = Math.max(image.width, image.height);
            const safeArea = 2 * (maxSize / 2);

            const canvas = document.createElement('canvas');
            canvas.width = safeArea;
            canvas.height = safeArea;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                resolve(null);
                return;
            }

            ctx.translate(safeArea / 2, safeArea / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-safeArea / 2, -safeArea / 2);

            ctx.drawImage(
                image,
                safeArea / 2 - image.width * 0.5,
                safeArea / 2 - image.height * 0.5
            );

            const x = Math.round(safeArea / 2 - crop.width * 0.5);
            const y = Math.round(safeArea / 2 - crop.height * 0.5);
            const width = Math.round(crop.width);
            const height = Math.round(crop.height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create a File object with the same extension as the original image
                        const fileExt = imageSrc.split('.').pop();
                        const fileName = originalImage.name;
                        const croppedFile = new File([blob], fileName, { type: originalImage.type });
                        resolve(croppedFile);
                    } else {
                        resolve(null);
                    }
                },
                'image/jpeg', // Specify the output format if needed
                1
            );
        };
    });
};
