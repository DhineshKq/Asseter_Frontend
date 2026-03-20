import { useEffect, useState } from 'react'
import '../../styles/pages/reports/reports.scss'
import '../../styles/common-component/page-heading.scss'
import AgGrid from '../../components/common-component/grids-and-tables/ag-grid';
import { Col, Modal, Row } from 'react-bootstrap';
import { axiosPrivate } from '../../middleware/axios-api';
import Actions from '../../components/common-component/grids-and-tables/cell-eye-icon';
import Loader from '../common-component/loader/Main-loader'



interface propsType {
    setassetsPageView: (val: string) => void;
    setEditAssets: (val: number) => void;
    refreshGrid: boolean;
    setOriginalRowData: (val: string) => void;
    originalRowData: any
}

export default function ReportGridView({setOriginalRowData, originalRowData }: propsType) {
    const [showAlertBox, setShowAlertBox] = useState(false)
    const [showMessage, setShowMessage] = useState<string>("")
    const [showType, setShowType] = useState("warning")
    const [isLoading, setIsLoading] = useState(false)
    const [ips, setIps] = useState([]);
    const [error, setError] = useState("");
    const [pdfData, setPdfData] = useState<string | null>(null);
    const [showPdfModal, setShowPdfModal] = useState(false); // Show the PDF Modal

    async function getReports() {
        setIsLoading(true);
        try {
            const workspaceId = localStorage.getItem("workspaceId");


            if (!workspaceId) {
                throw new Error("Missing workspaceId");
            }

            const response = await axiosPrivate.post('/getScanReports', {
                workspaceId,
            });

            const { status, data, message } = response.data;

            if (status) {
                const formattedData = data.map((item: any) => ({
                    ...item,
                    createdAt: new Date(item.createdAt).toLocaleString(),
                }));
                setOriginalRowData(formattedData);
            } else {
                console.warn("API Error:", message);
                setShowMessage(message);
                setShowType("danger");
                setShowAlertBox(true);
            }
        } catch (error: any) {
            console.error("Error fetching report data:", error);
            setShowMessage(error?.response?.data?.message || error.message || "Unknown error");
            setShowType("danger");
            setShowAlertBox(true);
        } finally {
            setIsLoading(false);
        }
    }

    const getScanReport = async (scanId: number) => {
        setIsLoading(true);
        try {
            const baseURL = 'http://172.25.10.113:8000';
            const response = await axiosPrivate.get(`/scan-report/${scanId}`);

            if (response.status === 200) {
                const pdfPath = response.data;
                const fullURL = `${baseURL}/${pdfPath}`;
                setPdfData(fullURL);
                setShowPdfModal(true);
            } else {
                setShowMessage("Failed to fetch PDF");
                setShowType("danger");
                setShowAlertBox(true);
            }
        } catch (error: any) {
            console.error("Error fetching scan report:", error);
            setShowMessage(error?.response?.data?.message || error.message || "Unknown error");
            setShowType("danger");
            setShowAlertBox(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getReports();
    }, []);

    const CustomEllipsisRenderer: React.FC<any> = ({ value }) => {
        const cellStyle: React.CSSProperties = {
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            display: "block",
            maxWidth: "100%", // shrink with column width
        };

        return (
            <div style={cellStyle} title={value}>
                {value}
            </div>
        );
    };

    const assetsColumnData = [
        {
            field: 'id',
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
            cellRenderer: CustomEllipsisRenderer,

        },
        {
            field: 'scan',
            headerName: 'Scan',
            headerClass: "action-button-differ",
            minWidth: 150,
            resizable: false,
            suppressMovable: true,
            filter: true,
            sortable: false,
            suppressSizeToFit: false,
            cellStyle: { textAlign: 'left' },
            filtertype: "text",
            cellRenderer: CustomEllipsisRenderer,


        },
        {
            field: 'targetName',
            headerName: 'Target',
            minWidth: 150,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            filtertype: "text",
            sortable: false,
            cellRenderer: CustomEllipsisRenderer,

        },
        {
            field: 'fileName',
            headerName: 'File Name',
            minWidth: 300,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            sortable: false,
            cellStyle: { textAlign: 'left' },
            filtertype: "text",
            cellRenderer: CustomEllipsisRenderer,

        },
        {
            field: 'fileSize',
            headerName: 'File Size',
            minWidth: 130,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            cellStyle: { textAlign: 'left' },
            sortable: false,
            filtertype: "text",
            cellRenderer: CustomEllipsisRenderer,


        },
        {
            field: 'createdAt',
            headerName: 'Created At',
            minWidth: 50,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            sortable: false,
            cellStyle: { textAlign: 'left' },
            filtertype: "text",
            valueFormatter: (params: any) => {
                return params.value != null && params.value !== 0 ? params.value : '-';
            },
            cellRenderer: CustomEllipsisRenderer,

        },
        {
            field: 'Action',
            headerName: 'Action',
            headerClass: 'action-button-differ',
            minWidth: 200,
            resizable: false,
            suppressMovable: true,
            filter: false,
            suppressSizeToFit: false,
            sortable: false,
            cellStyle: { textAlign: 'center' },
            filtertype: "text",
            cellRenderer: Actions,
            cellRendererParams: (params: any) => {

                const handleIconClick = async (showIcon: any, data: any) => {
                    switch (showIcon) {
                        case "View":
                            getScanReport(data.id);
                            break;
                        default:
                            break;
                    }
                };
                return {
                    handleIconClick: handleIconClick,
                    showIcons: ['View']
                };
            }
        },


    ]

    return (
        <>
            <div className='report-main-page'>
                <div className='pageHeader'>
                    <h2 className='pageHeading'>Reports</h2>

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