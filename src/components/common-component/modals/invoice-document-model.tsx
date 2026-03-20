import { useEffect, useState } from 'react';
import { RxCross1 } from 'react-icons/rx';
import Loading from './loading-screen';
import Alertbox from './alertbox-modal';
import { ReactComponent as ZommIn } from '../../../assets/icons/zoom-in.svg'
import { ReactComponent as ZommOut } from '../../../assets/icons/zomm-out.svg'
import { ReactComponent as Download } from '../../../assets/icons/download.svg'
import { axiosPrivate } from '../../../middleware/axios-api';
import "../../../styles/common-component/document-modal.scss"
interface props {
    closeDocument: (val: any) => void;
    documentFile: any;
    showDocumentModal?: any
}

export default function InvoiceDocumentModal({ closeDocument, documentFile, showDocumentModal}: props) {
    const [pdfUrl, setPdfUrl] = useState<string | null>("");
    const [imgUrl, setImgUrl] = useState<string | null>("");
    const [zoomLevel, setZoomLevel] = useState(580);
    const [loadingScreen, setLoadingScreen] = useState(false)
    const [showAlertBox, setShowAlertBox] = useState<boolean>(false)
    const [showMessage, setShowMessage] = useState<string>("")
    const [showType, setShowType] = useState<string>("warning")



    // UseEffect for local files...
    useEffect(() => {
        if (documentFile.file && documentFile.file.name) {
            const fileExtension = (documentFile.file.name.split('.').pop() || '').toLowerCase();

            const isValidExtension = fileExtension === 'pdf' || fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png';
            const isPdf = fileExtension === 'pdf';

            if (!isValidExtension) {
                return;
            }

            const fileurl = URL.createObjectURL(documentFile.file)
            if (isPdf) {
                setPdfUrl(fileurl);
            } else {
                setImgUrl(fileurl);
            }
        }
    }, [documentFile]);

    // UseEffect for API calling to rendering the documents 
    useEffect(() => {
        if (!documentFile?.file.name) {
            downloadfile()
        }
    }, [showDocumentModal])

    const downloadfile = async () => {
        setLoadingScreen(true)
        try {
            const response = await axiosPrivate.post(`vcin/get/invoice-document`, { fileName: documentFile.file },
                {
                    responseType: "arraybuffer"
                });

            const contentType = response.headers['content-type'];
            const isPdf = contentType === 'application/pdf' ? contentType === 'application/pdf' : false;
            const blob = new Blob([response.data], { type: contentType });
            const objectURL = URL.createObjectURL(blob);

            // const fileURL = URL.createObjectURL(response.data);
            const fileURL = objectURL;

            if (isPdf) {
                setPdfUrl(fileURL);
            } else {
                setImgUrl(fileURL);
            }
            if (response.status === 200) {
                setLoadingScreen(false)
            }

            return blob;
        } catch (error: any) {
            setShowAlertBox(true)
            setShowMessage(error.message)
            setShowType("warning")
            setLoadingScreen(false)
        }
    }

    const handleDownloadClick = async (imgUrl: any) => {
        let file = imgUrl.file;
        let fileName = imgUrl.fileName || file.name;

        if (typeof imgUrl.file === 'string') {
            file = await downloadfile();
        }

        // Create a URL for the Blob
        const url = window.URL.createObjectURL(file);

        // Create a link element
        const link = document.createElement('a');
        link.href = url;

        // Set the filename for the download
        link.download = fileName;

        // Simulate a click on the link to trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    // Function for ZoomIn..
    const handleZoomIn = () => {
        if (zoomLevel < 1500) {
            setZoomLevel(zoomLevel + 200);
        }
    };

    // Function for ZoomOut..
    const handleZoomOut = () => {
        if (zoomLevel > 300) {
            setZoomLevel(zoomLevel - 200);
        }
    };

    return (
        <>
            <div className={"document-modal"}>
                <div className={"container"}>
                    <div className='close-icon-documentname'>
                        {/* <p>{documentName && documentName.length > 15 ? documentName.slice(0, 15) + "..." : documentName}</p> */}
                    </div>
                    <div className={"close-icon"}>
                        <span className={"cross-icon"}>
                            <RxCross1 onClick={(val) => closeDocument(false)} style={{ fontSize: "30px" }} />
                        </span>
                    </div>
                    <div className='document-content'>
                        <>
                            {
                                (pdfUrl) ? (
                                    <div style={{ height: "580px", width: "580px" }}>
                                        <object
                                            data={pdfUrl}
                                            type="application/pdf"
                                            width="100%"
                                            height="100%"
                                            aria-label="Online PDF"
                                        ></object>
                                    </div>
                                ) : imgUrl ? (
                                    <div style={{ overflow: "hidden", overflowY: "auto", overflowX: "auto", maxHeight: "580px", maxWidth: "580px" }}>
                                        <img src={imgUrl}
                                            alt="Image"
                                            style={{
                                                maxHeight: `${zoomLevel}px`,
                                                maxWidth: `${zoomLevel}px`,
                                            }} />
                                    </div>
                                ) : (
                                    <div>No valid file found</div>
                                )
                            }
                            {imgUrl &&
                                <div className='zoom-main'>
                                    <ZommIn className={"zoomIn"} onClick={handleZoomIn} />
                                    <ZommOut className={"zoomOut"} onClick={handleZoomOut} />
                                    <span className='download-icon'>
                                        <Download className={"zoomOut"} onClick={() => handleDownloadClick(documentFile)} />
                                    </span>
                                </div>
                            }
                        </>
                    </div>
                </div>
            </div>
            {showAlertBox && <Alertbox type={showType} message={showMessage} />}
            {loadingScreen && <Loading />}
        </>
    )
}