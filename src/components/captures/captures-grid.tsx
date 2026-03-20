import React, { useEffect, useState } from 'react'
import '../../styles/pages/reports/reports.scss'
import '../../styles/common-component/page-heading.scss'
import AgGrid from '../../components/common-component/grids-and-tables/ag-grid';
// import { Col, Row } from 'react-bootstrap';
import { Col, Modal, Row } from 'react-bootstrap';
import { axiosPrivate } from '../../middleware/axios-api';
import Loader from '../common-component/loader/Main-loader'


interface propsType {
    setassetsPageView: (val: string) => void;
    setEditAssets: (val: number) => void;
    refreshGrid: boolean;
    setOriginalRowData: (val: string) => void;
    originalRowData: any
}

export default function CapturesGridView({setOriginalRowData, originalRowData }: propsType) {
    const [showAlertBox, setShowAlertBox] = useState(false)
    const [showMessage, setShowMessage] = useState<string>("")
    const [showType, setShowType] = useState("warning")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("");

    async function getCaptures() {
        setIsLoading(true);
      
        try {
          const workspaceId = localStorage.getItem("workspaceId");
      
          if (!workspaceId ) {
            throw new Error("Missing workspaceId");
          }
      
          const response = await axiosPrivate.post('/getCaptures', {
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
            console.warn("API error:", message);
            setShowType("danger");
            setShowMessage(message);
            setShowAlertBox(true);
          }
      
        } catch (error: any) {
          console.error("Fetch failed:", error);
          setShowType("danger");
          setShowMessage(error?.response?.data?.message || error.message || "Unknown error occurred");
          setShowAlertBox(true);
      
        } finally {
          setIsLoading(false);
        }
      }
      

    useEffect(() => {
        getCaptures()
    }, []);


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
            headerClass: "action-button-differ",
            minWidth: 150,
            resizable: false,
            suppressMovable: true,
            filter: true,
            sortable: false,
            suppressSizeToFit: false,
            cellStyle: { textAlign: 'left' },
            filtertype: "text",

        },
        {
            field: 'targets',
            headerName: 'Target',
            minWidth: 150,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            filtertype: "text",
            sortable: false,
        },
        {
            field: 'status',
            headerName: 'Scan Status',
            minWidth: 300,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            sortable: false,
            cellStyle: { textAlign: 'left' },
            filtertype: "text",
        },
        {
            field: 'results',
            headerName: 'Result',
            minWidth: 130,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            cellStyle: { textAlign: 'left' },
            sortable: false,
            filtertype: "text",

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
            }
        },


    ]

    return (
        <>
            <div className='report-main-page'>
                <div className='pageHeader'>
                    <h2 className='pageHeading'>Captures</h2>

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
        </>

    )


}