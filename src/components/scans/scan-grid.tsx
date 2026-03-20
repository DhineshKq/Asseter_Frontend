import React, { useEffect, useState } from 'react'
import '../../styles/pages/assets/assets.scss'
import '../../styles/common-component/page-heading.scss'
import AgGrid from '../../components/common-component/grids-and-tables/ag-grid';
import { Col, Modal, Row } from 'react-bootstrap';
import { axiosPrivate } from '../../middleware/axios-api';
import Actions from '../../components/common-component/grids-and-tables/cell-eye-icon';
import ButtonComponent from "../../components/common-component/form-elements/button-component"
import DeleteModal from '../../components/common-component/modals/delete-modal'
// import Loading from '../common-component/modals/loading-screen';
import Loader from '../common-component/loader/Main-loader'
import Alertbox from '../../components/common-component/modals/alertbox-modal';
import { log } from 'console';


interface propsType {
    setscanPageView: (val: string) => void;
}

export default function AssetsGridView({ setscanPageView }: propsType) {

    const [showAlertBox, setShowAlertBox] = useState(false)
    const [showMessage, setShowMessage] = useState<string>("")
    const [showType, setShowType] = useState("warning")
    const [subscriptionPlan, setSubscriptionPlan] = useState<string>('')
    const [showPdfModal, setShowPdfModal] = useState(false); // Show the PDF Modal
    const [pdfData, setPdfData] = useState<string | null>(null);

    const clearAleart = (status: any) => {
        const timer = setTimeout(() => {
            setShowAlertBox(false)
            setShowMessage("");
            clearTimeout(timer);
        }, 5000);
    }
    const [originalRowData, setOriginalRowData] = useState<any>([])
    const [currentDeletedId, setCurrentDeletedId] = useState<any>()
    const [showDeleteModel, setShowDeleteModel] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [ips, setIps] = useState([]);
    const [error, setError] = useState("");


    function formatLocalDateTime(dateString: string): string {
        if (!dateString) return 'N/A';

        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    }


    async function getScansData() {
        try {
            const workspaceId = localStorage.getItem("workspaceId");

            const response = await axiosPrivate.get('/getScansData', {
                params: {
                    workspaceId: workspaceId
                }
            });

            if (response.data.status) {
                const localTimeFormattedData = response.data.data.map((item: any) => {
                    return {
                        ...item,
                        doneAt: formatLocalDateTime(item.doneAt)
                    }
                });

                setOriginalRowData(localTimeFormattedData);
            } else {
                console.log("API responded with error:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching asset data:", error);
        }
    }
    const getScanReport = async (scanId: number) => {
        try {
            const baseURL = 'http://172.25.10.113:8000';


            const response = await axiosPrivate.get(`/scan-report/${scanId}`, {

            });

            if (response.status === 200) {
                const pdfPath = response.data;  // The response data contains the PDF path
                const fullURL = `${baseURL}/${pdfPath}`;
                setPdfData(fullURL);
                setShowPdfModal(true);
                // window.open(fullURL, '_blank');
            } else {
                console.error('Failed to fetch PDF');
            }
        } catch (error) {
            console.error('Error fetching scan report:', error);
        }
    };









    async function deleteById(id: any) {
        try {
            const workspaceId = localStorage.getItem("workspaceId");

            const response = await axiosPrivate.delete(`/deleteScan/${id}`, {
                params: {
                    workspaceId: workspaceId
                }
            });

            if (response.data.status) {
                getScansData();
            } else {
                console.log("Deletion failed:", response.data.message);
            }
        } catch (error) {
            console.error("Error deleting asset:", error);
        }
    }

    useEffect(() => {
        getScansData();
    }, []);





    const getSeverityColor = (severity: string): string => {
        switch (severity.toLowerCase()) {
            case "low":
                return "#00FF4D";
            case "medium":
                return "orange";
            case "high":
                return "#FF0000";
            default:
                return "black";
        }
    };



    const CustomEllipsisRendererInvoiceAppprovalGrid: React.FC<any> = (params: any) => {
        const value = params || "";
        const maxLength = 30; // Maximum characters allowed before truncation

        let displayValue = value;
        if (value.length > maxLength) {
            displayValue = value.substring(0, maxLength) + "...";
        }

        const cellStyle: React.CSSProperties = {
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            paddingRight: "3px",
        };

        return <div style={cellStyle}>{displayValue}</div>;
    };

    const assetsColumnData = [
        {
            field: 'scanId',
            headerName: 'Scan Id',
            headerClass: "action-button-differ",
            minWidth: 150,
            maxWidth: 150,
            resizable: false,
            suppressMovable: true,
            filter: true,
            sortable: false,
            suppressSizeToFit: false,
            cellStyle: { textAlign: 'left' },
            filtertype: "text",

        },
        {
            field: 'scan',
            headerName: 'Scan',
            minWidth: 200,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            sortable: false,
            cellStyle: { textAlign: 'left' },
            filtertype: "text",
        },
        {
            field: 'targets',
            headerName: 'Target',
            minWidth: 180,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            cellStyle: { textAlign: 'left' },
            filtertype: "text",
            sortable: false,
        },

        {
            field: 'type',
            headerName: 'Type',
            minWidth: 130,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            cellStyle: { textAlign: 'left' },
            sortable: false,
            filtertype: "text",

        },
        // {
        //     field: 'status',
        //     headerName: 'Status',
        //     minWidth: 130,
        //     resizable: false,
        //     suppressMovable: true,
        //     filter: true,
        //     suppressSizeToFit: false,
        //     cellStyle: { textAlign: 'left' },
        //     sortable: false,
        //     filtertype: "text",

        // },
        {
            field: 'doneAt',
            headerName: 'Done At',
            minWidth: 180,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            sortable: false,
            cellStyle: { textAlign: 'left' },
            filtertype: "text",
            valueFormatter: (params: any) => {

                const value = params.value;
                if (!value || value === "-") return "-";
                const date = new Date(value);
                return isNaN(date.getTime()) ? "-" : date.toLocaleString();
            },
        },

        // {
        //     field: 'Action',
        //     headerName: 'Action',
        //     headerClass: 'action-button-differ',
        //     minWidth: 200,
        //     resizable: false,
        //     suppressMovable: true,
        //     filter: false,
        //     suppressSizeToFit: false,
        //     sortable: false,
        //     cellStyle: { textAlign: 'center' },
        //     filtertype: "text",
        //     cellRenderer: Actions,
        //     cellRendererParams: (params: any) => {
        //         const handleIconClick = async (showIcon: any, data: any) => {

        //             switch (showIcon) {

        //                 case "View":

        //                     // setassetsPageView("Edit")
        //                     // setEditAssets(params.data.assetsId)
        //                     getScanReport(data.scanId);
        //                     break;

        //                 case "Delete":
        //                     setShowDeleteModel(true)
        //                     setCurrentDeletedId(params.data.scanId);

        //                     break;
        //                 default:
        //                     break;
        //             }
        //         };


        //         return {
        //             handleIconClick: handleIconClick,
        //             // marginTop,
        //             // showIcons: ['edit', 'View', 'delete','view&edit']
        //             // showIcons: ['repeat', 'share', 'delete']
        //             showIcons: ['View', 'delete']

        //         };
        //     }
        // },


    ]


    const navigate = () => {
        setscanPageView("Main")
    };



    return (
        <>
            <div className='assets-main-page'>
                <div className='pageHeader'>
                    <h2 className='pageHeading'>Scans</h2>
                    {/* <div className='heading-line'></div> */}
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                        <div style={{ display: "flex", justifyContent: "start", cursor: "not-allowed", height: "45px", width: "125px" }}>
                            <ButtonComponent

                                title="New Scan"
                                height='45px'
                                width='100%'
                                backgroundColor={'var(--btn-primary-bg)'}
                                border='1px solid #295285'
                                borderRadius={'5px'}
                                color='White'
                                disabled={false}
                                className={"button-component common-btn"}
                                handleClick={navigate}

                            // imageSrc={autoScan}
                            />
                        </div>
                    </div>
                </div>


                <div className='Ag-container' style={{ height: "85%" }}>
                    <Row>
                        <Col className='port-grid'>
                            <AgGrid
                                hidePaginationDD={true}
                                tableColumnData={assetsColumnData}
                                tabelRowData={[...originalRowData].reverse()}
                                rowHeight={90}
                                groupHeaderHeight={50}
                                headerHeight={40}
                                gridOptions={{
                                    localeText: {
                                        noRowsToShow: 'No records found'
                                    }
                                }}
                            />
                        </Col>
                    </Row>
                    <Modal show={showPdfModal} onHide={() => setShowPdfModal(false)} size="xl" centered dialogClassName="custom-modal-style">
                        <Modal.Header >
                            <Modal.Title>Scan Report</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {pdfData ? (
                                <>
                                    <iframe
                                        src={pdfData} // Directly use the path stored in the pdfData state
                                        width="100%"
                                        height="700px"
                                        title="Scan Report"
                                    />
                                </>
                            ) : (
                                <div>Loading...</div> // Show loading state if the PDF path is not yet available
                            )}
                        </Modal.Body>
                    </Modal>
                </div>

            </div>
            {
                showDeleteModel &&
                <div >
                    <DeleteModal
                        getDelete={() => {
                            setShowDeleteModel(false)
                            // checkDelete(deleteIndex, TableIdDelete)
                            deleteById(currentDeletedId);
                        }}
                        clearValue={(value) => { setShowDeleteModel(value) }}
                        modelType={"grid-delete"}

                    />
                </div>
            }
            {
                showAlertBox &&
                <div className='alert-warp'>
                    <Alertbox type={showType} message={showMessage} />
                </div>
            }
            {
                isLoading &&
                <div>
                    <Loader />
                </div>
            }
            {error && (
                <div style={{ color: "red", marginTop: "10px" }}>
                    {error}
                </div>
            )}

            {ips.length > 0 && (
                <div style={{ marginTop: "10px", color: "green" }}>
                    Found {ips.length} IP{ips.length > 1 ? 's' : ''} on your network:
                    <ul>
                        {ips.map((ip, index) => (
                            <li key={index}>{ip}</li>
                        ))}
                    </ul>
                </div>
            )}
        </>

    )


}