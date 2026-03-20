import React, { useEffect, useState } from 'react'
import '../../styles/pages/assets/assets.scss'
import '../../styles/common-component/page-heading.scss'
import AgGrid from '../../components/common-component/grids-and-tables/ag-grid';
import { Col, Row } from 'react-bootstrap';
import { axiosPrivate } from '../../middleware/axios-api';
import Actions from '../../components/common-component/grids-and-tables/cell-eye-icon';
import ButtonComponent from "../../components/common-component/form-elements/button-component"
import DeleteModal from '../../components/common-component/modals/delete-modal'
// import Loading from '../common-component/modals/loading-screen';
import Loader from '../common-component/loader/Main-loader'
import Alertbox from '../../components/common-component/modals/alertbox-modal';
import useAuth from '../../services/hooks/useauth';
import { useCommonData } from '../../services/context/useContext';
import { getPlanActive } from '../../services/utils/checkexpiration';


interface propsType {
    setassetsPageView: (val: string) => void;
    setPlanType: React.Dispatch<React.SetStateAction<"expired" | "insufficient">>;
    setEditAssets: (val: number) => void;
    refreshGrid: boolean;
    setOriginalRowData: (val: string) => void;
    originalRowData: any
}

export default function AssetsGridView({ setPlanType, setassetsPageView, setEditAssets, setOriginalRowData, originalRowData }: propsType) {
    const [showAlertBox, setShowAlertBox] = useState(false)
    const [showMessage, setShowMessage] = useState<string>("")
    const [showType, setShowType] = useState("warning")
    const [subscriptionPlan, setSubscriptionPlan] = useState<string>('')
    const [currentDeletedId, setCurrentDeletedId] = useState<any>()
    const [showDeleteModel, setShowDeleteModel] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [ips, setIps] = useState([]);
    const [isPlanActive, setIsPlanActive] = useState(false)
    const [expiryDate, setExpiryDate] = useState("")
    const [error, setError] = useState("");

    const clearAleart = (status: any) => {
        const timer = setTimeout(() => {
            setShowAlertBox(false)
            setShowMessage("");
            clearTimeout(timer);
        }, 5000);
    }


    function formatLocalDateTime(dateString: string): string {

        if (!dateString || dateString === "Not Yet Started") return 'Not Yet Started';


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

    async function getAssetsData() {
        try {

            const workspaceId = localStorage.getItem("workspaceId"); // 👈 get from localStorage

            const response = await axiosPrivate.get('/getAssetsData', {
                params: {
                    workspaceId: workspaceId
                }
            });

            if (response.data.status) {
                const localTimeFormattedData = response.data.data.map((item: any) => {
                    return {
                        ...item,
                        activity: formatLocalDateTime(item.activity)
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


    async function autoNetworkScan() {

        setIsLoading(true);
        setError("");
        setIps([]);

        if (!isPlanActive) {
            setassetsPageView("PlanExpired");
            setPlanType("expired");
            setIsLoading(false);
            return;
        }
        if (subscriptionPlan !== "premium") {
            setassetsPageView("PlanExpired");
            setPlanType("insufficient");
            setIsLoading(false);
            return;
        }
        try {
            const workspaceId = localStorage.getItem("workspaceId");

            const response = await axiosPrivate.get("/scan-local-network", {
                params: { workspaceId },
            });

            if (response.data?.status === true) {
                setShowMessage("Asset(s) added successfully!");
                setShowType("success");
                setShowAlertBox(true);
                clearAleart("");
                await getAssetsData(); // ✅ Refresh assets
            } else {
                setShowMessage(`Failed to add asset: ${response.data?.message || "Unknown error"}`);
                setShowType("danger");
                setShowAlertBox(true);
                clearAleart("");
            }
        } catch (error: any) {
            console.error("Error adding asset:", error);
            setShowMessage(`${error?.response?.data?.message || error.message}`);
            setShowType("danger");
            setShowAlertBox(true);
            clearAleart("");
        } finally {
            setIsLoading(false);
        }
    }

    async function deleteById(id: any) {
        try {
            const workspaceId = localStorage.getItem("workspaceId");

            const response = await axiosPrivate.delete(`/deleteAssetsById/${id}`, {
                params: {
                    workspaceId: workspaceId
                }
            });

            if (response.data.status) {
                getAssetsData(); // Refresh the asset list after successful deletion
            } else {
                console.log("Deletion failed:", response.data.message);
            }
        } catch (error) {
            console.error("Error deleting asset:", error);
        }
    }


    async function getPlanData() {
        try {
            const res = await axiosPrivate.get(`/getSubscriptionPlan`);
            if (res.data.status) {
                setSubscriptionPlan(res.data.plan.toLowerCase());
            } else {
                console.log("API responded with error:", res.data.message);
            }
        } catch (error) {
            console.error("Error fetching asset data:", error);
        }
    }

    useEffect(() => {
        async function fetchScanData() {
            const scanData = await getPlanActive();
            if (scanData) {
                setIsPlanActive(scanData.isPlanActive)
                setExpiryDate(scanData.planExpiry)
            } else {
                console.log("Failed to fetch plan data.");
            }
        }

        fetchScanData();
    }, []);


    useEffect(() => {
        getAssetsData();
        getPlanData();
    }, []);


    const CustomEllipsisRendererName: React.FC<any> = ({ value }) => {
        const maxLength = 15;
        const displayValue = value?.length > maxLength ? `${value.substring(0, maxLength)}...` : value;

        const cellStyle: React.CSSProperties = {
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            paddingRight: "3px",
        };

        return <div style={cellStyle} title={value}>{displayValue}</div>;
    };


    const assetsColumnData = [
        {
            field: 'assetsId',
            headerName: 'Asset Id',
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
            field: 'targets',
            headerName: 'Targets',
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
            field: 'name',
            headerName: 'Name',
            minWidth: 200,
            resizable: false,
            suppressMovable: true,
            filter: true,
            suppressSizeToFit: false,
            sortable: false,
            cellStyle: { textAlign: 'left' },
            filtertype: "text",
            cellRenderer: CustomEllipsisRendererName,
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
        {
            field: 'scans',
            headerName: 'No.of.Scans',
            minWidth: 50,
            // maxWidth:150,
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


                        case "Edit":

                            setassetsPageView("Edit")
                            setEditAssets(params.data.assetsId)
                            break;

                        case "Delete":

                            setShowDeleteModel(true)
                            setCurrentDeletedId(params.data.assetsId);

                            break;
                        default:
                            break;
                    }
                };


                return {
                    handleIconClick: handleIconClick,
                    // marginTop,
                    // showIcons: ['edit', 'View', 'delete','view&edit']
                    showIcons: ['edit', 'delete']
                };
            }
        },


    ]

    const addForm = () => {
        if (isPlanActive) {
            setassetsPageView("Form")
        } else {
            setassetsPageView("PlanExpired")
        }
    };

    return (
        <>
            <div className='assets-main-page'>
                <div className='pageHeader'>
                    <h2 className='pageHeading'>Assets</h2>
                    {/* <div className='heading-line'></div> */}
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                        <div style={{ display: "flex", justifyContent: "start", cursor: "not-allowed", height: "45px", width: "125px" }}>
                            <ButtonComponent
                                title="Fetch Assets"
                                height='45px'
                                width='100%'
                                backgroundColor={"var(--btn-primary-bg)"}
                                border='1px solid #295285'
                                borderRadius={'5px'}
                                color='White'
                                // disabled={subscriptionPlan !== 'standard' && subscriptionPlan !== 'premium'}
                                // disabled={true}

                                className={"button-component common-btn"}
                                handleClick={autoNetworkScan}
                            />
                        </div>
                        <div style={{ display: "flex", justifyContent: "end", cursor: "not-allowed", height: "45px", width: "50px" }}>
                            <ButtonComponent
                                title={"+"}
                                height='45px'
                                width='50px'
                                backgroundColor={"var(--btn-primary-bg)"}
                                border='1px solid #295285'
                                borderRadius={'5px'}
                                color='White'
                                disabled={false}
                                className={"button-component common-btn"}
                                handleClick={addForm}
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