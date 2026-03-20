import { useEffect, useRef, useState } from 'react';
import '../../styles/pages/scans/scans.scss';
import '../../styles/common-component/page-heading.scss';
import DropdownComponent from '../common-component/form-elements/dropdown-component';
import ButtonComponent from '../common-component/form-elements/button-component';
import Alertbox from '../common-component/modals/alertbox-modal';
import { getListOfDomain } from '../scan-components/Scan-components';
import { v4 as uuidv4 } from 'uuid';
import Loader from '../common-component/loader/Loader';
import { io } from "socket.io-client";
import axiosApi, { axiosPrivate } from '../../middleware/axios-api';
import { Socket_Io } from '../../middleware/axios-api';
import AnsiToHtml from 'ansi-to-html';
const ansiConverter = new AnsiToHtml();

interface propsType {
    setscanPageView: (val: string) => void;
}

export default function HstsDowngradePage({ setscanPageView }: propsType) {
    const [socket, setSocket] = useState<any>(null);
    const [dropDownOptions, setDropDownOptions] = useState<any>();
    const [targetName, setTargetName] = useState<any>(null);
    const targetNameRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [scanOutput, setScanOutput] = useState<string>("");
    const scanOutputRef = useRef<any>(null);
    const [showAlertBox, setShowAlertBox] = useState(false);
    const [showMessage, setShowMessage] = useState<string>("");
    const [showType, setShowType] = useState("warning");
    const [isRunning, setIsRunning] = useState(false); // for button state
    const scanOutputContainerRef = useRef<HTMLDivElement>(null);
    const assetIdRef = useRef<any>(null);
    const [scanId, setscanId] = useState<string>("");
    const [assetId, setAssetId] = useState<string>("");



    const clearAlert = () => {
        setTimeout(() => {
            setShowAlertBox(false);
            setShowMessage("");
        }, 5000);
    };

    // Keep refs updated
    useEffect(() => {
        targetNameRef.current = targetName;
        assetIdRef.current = assetId
    }, [targetName]);

    useEffect(() => {
        const handleUnload = () => {
            if (isRunning && scanId) {
                stopTrafficScan()
            }
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [isRunning, scanId]);

    useEffect(() => {
        return () => {
            if (isRunning && scanId) {
                stopTrafficScan();
            }
        };
    }, [isRunning, scanId]);

    useEffect(() => {
        if (scanOutputContainerRef.current) {
            scanOutputContainerRef.current.scrollTop = scanOutputContainerRef.current.scrollHeight;
        }
    }, [scanOutput]);

    useEffect(() => {
        scanOutputRef.current = scanOutput;
    }, [scanOutput]);

    // Socket connection
    useEffect(() => {
        const newSocket = io(Socket_Io);
        setSocket(newSocket);

        newSocket.on("traffic-line", (data: any) => {
            if (data?.line) {
                setScanOutput((prev) => prev + "\n" + data.line);
                setIsLoading(false);
            }
        });

        newSocket.on("traffic-error", (error: string) => {
            console.error("Traffic Error:", error);
            setIsLoading(false);
            setIsRunning(false);
            setShowMessage(error);
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
        });

        newSocket.on("traffic-done", (exitCode: number) => {
            setIsLoading(false);
            setIsRunning(false);
            if (!scanOutputRef.current.includes("Stopping Analyser")) {
                setShowMessage(exitCode === 0 ? "HSTS Downgrade Test completed." : `Scan failed with code ${exitCode}`);
                setShowType(exitCode === 0 ? "success" : "danger");
                setShowAlertBox(true);
                clearAlert();
            }
        });

        newSocket.on("disconnect", () => {
            setShowMessage("Disconnected from Hsts Downgrade.");
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    async function createScanData() {
        const workspaceId = localStorage.getItem("workspaceId");

        if (!workspaceId) {
            setShowMessage("Workspace ID is missing!");
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
            return null;
        }

        if (!targetName || !targetName.label) {
            setShowMessage("Target information is missing!");
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
            return null;
        }

        // Create payload with In Progress status (no need for summaryData yet)
        const payload = {
            assetId: assetIdRef.current,
            scan: "HSTS Downgrade",
            target: targetName.label,
            status: "Completed",
            doneAt: new Date(),
            workspaceId,
            result: "Completed"
        };

        try {
            const response = await axiosPrivate.post('/createScanController', payload);
            if (response.data?.status === true) {
                const scanIdFromResponse = response.data.data.scanId;
                setscanId(scanIdFromResponse);
                await startTrafficScan(scanIdFromResponse);

            } else {
                setShowMessage(`Failed to add asset: ${response.data?.message || "Unknown error"}`);
                setShowType("danger");
                setShowAlertBox(true);
                clearAlert();
                return null;
            }
        } catch (error: any) {
            console.error("Error adding asset:", error);
            setShowMessage(error.response?.data?.message || error.message);
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
            return null;
        }
    }

    // Start scan
    async function startTrafficScan(scanId: any) {
        const currentTarget = targetNameRef.current;

        if (!currentTarget?.label) {
            setShowMessage("Please select a target.");
            setShowType("warning");
            setShowAlertBox(true);
            clearAlert();
            return;
        }

        try {
            setIsLoading(true);
            setIsRunning(true);
            setScanOutput("");
            await axiosPrivate.post("/trafficAnalyser", {
                targetIp: currentTarget.label,
                mode: "downgrade",
                scanId
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "x-socket-id": socket?.id ?? "",
                },
            });
        } catch (error: any) {
            console.error("Error starting Hsts Downgrade:", error);
            setShowMessage(error.response?.data?.message || error.message);
            setShowType("danger");
            setShowAlertBox(true);
            setIsLoading(false);
            setIsRunning(false);
            clearAlert();
        }
    }

    async function stopTrafficScan() {
        try {
            await axiosPrivate.post("/stop-traffic-analyser", { scanId: scanId }, {
                headers: { "Content-Type": "application/json" },

            });
            console.log("Stop request sent to backend");
            setIsLoading(false);
            setIsRunning(false);
            setShowMessage("Hsts Downgrade stopped.");
            setShowType("success");
            setShowAlertBox(true);
            clearAlert();
        } catch (error) {
            console.error("Error stopping Hsts Downgrade:", error);
        }
    }

    const downloadReport = async () => {
        try {
            const response = await axiosPrivate.get(`/download-report/${scanId}`, {
                responseType: 'blob', // Important for handling binary PDF data
            });

            // Create a blob URL from the response
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);

            // Create a temporary anchor to download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `Traffic_Analyser_${scanId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Clean up the blob URL
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error: any) {
            console.error("Error fetching scan report:", error);
            setShowMessage(error?.response?.data?.message || error.message || "Unknown error");
            setShowType("danger");
            setShowAlertBox(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Load targets
    useEffect(() => {
        const fetchDomains = async () => {
            const options = await getListOfDomain("ipaddress");
            setDropDownOptions(options);
        };
        fetchDomains();
    }, []);


    return (
        <div className="scans-main-page">
            <div className="pageHeader">
                <div className="Breadcrumb">
                    <h2 className='pageHeading' style={{ cursor: "pointer" }} onClick={() => setscanPageView("Grid")}>{"Scans"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }}>{">"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px", cursor: "pointer" }} onClick={() => setscanPageView("Main")}>{" New Scan"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }}>{">"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }}>{"HSTS Downgrade"}</h2>
                </div>
            </div>

            <div className='main-container'>
                <div className="formSpace">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "400px" }} key={uuidv4()}>
                            <DropdownComponent
                                options={dropDownOptions}
                                isDisabled={isRunning} // disable target change while running
                                placeHolder={"Select Target"}
                                width={"100%"}
                                defaultValue={[targetName]}
                                color={"var(--input-bg)"}
                                getData={(val) => {
                                    setTargetName(val);
                                    setAssetId(val.value);
                                }}
                            />
                        </div>

                        <div>
                            <ButtonComponent
                                title={isRunning ? "Stop" : "Scan"}
                                height={"40px"}
                                width={"155px"}
                                backgroundColor={"var(--btn-primary-bg)"}
                                color={"white"}
                                className={"button-component-hover cancel"}
                                handleClick={isRunning ? stopTrafficScan : createScanData}
                            // handleClick={startTrafficScan}
                            />
                        </div>
                    </div>

                    {showAlertBox && (
                        <div className='alert-warp'>
                            <Alertbox type={showType} message={showMessage} />
                        </div>
                    )}

                    {isLoading && <Loader variant="inline" />}

                    {scanOutput && (
                        <>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "end" }}>
                                {!isRunning && (
                                    <div>
                                        <ButtonComponent
                                            title={"Download Report"}
                                            height={"40px"}
                                            width={"155px"}
                                            backgroundColor={"var(--btn-primary-bg)"}
                                            color={"white"}
                                            className={"button-component-hover cancel"}
                                            handleClick={downloadReport}
                                        />
                                    </div>
                                )}
                            </div>
                            <div
                                ref={scanOutputContainerRef}
                                style={{
                                    marginTop: "1.5rem",
                                    background: "#0d0d0d",
                                    padding: "1rem",
                                    fontFamily: "'Fira Code', monospace",
                                    fontSize: "14px",
                                    whiteSpace: "pre-wrap", // wraps long lines but keeps formatting
                                    height: "100%",
                                    overflowY: "auto",
                                    borderRadius: "8px",
                                    border: "1px solid #333",
                                    color: "#ddd",
                                    lineHeight: "1.4em",
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: ansiConverter.toHtml(scanOutput)
                                        .replace(/\[info\]/g, `<span style="color:#00bfff">[info]</span>`)
                                        .replace(/\[warn\]/g, `<span style="color:#ffcc00">[warn]</span>`)
                                        .replace(/\[error\]/g, `<span style="color:#ff4d4f">[error]</span>`)
                                }}
                            />
                        </>
                    )}


                </div>

            </div>
        </div>
    );
}
