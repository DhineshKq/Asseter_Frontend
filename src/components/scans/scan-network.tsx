import React, { useEffect, useRef, useState } from "react";
import "../../styles/pages/scans/scans.scss";
import "../../styles/common-component/page-heading.scss";
import DropdownComponent from "../common-component/form-elements/dropdown-component";
import ButtonComponent from "../common-component/form-elements/button-component";
import Alertbox from "../common-component/modals/alertbox-modal";
import { getListOfDomain } from "../scan-components/Scan-components";
import Loader from "../common-component/loader/Loader";
import RadioOrCheckbox from "../common-component/form-elements/radio-or-checkbox";
import axiosApi, { axiosPrivate, Socket_Io } from "../../middleware/axios-api";
import { io, Socket } from "socket.io-client";
import AnsiToHtml from "ansi-to-html";

const ansiConverter = new AnsiToHtml();

interface propsType {
    setscanPageView: (val: string) => void;
}

export default function ScanNetworkPage({ setscanPageView }: propsType) {
    type PortInfo = { port: string; state: string; service: string };
    type ScanInfo = {
        host: string;
        state: string;
        protocol: string;
        osGuess: string;
        ports: PortInfo[];
    };

    const [socket, setSocket] = useState<Socket | null>(null);
    const [dropDownOptions, setDropDownOptions] = useState<any>();
    const [targetName, setTargetName] = useState<any>(null);
    const [scanId, setScanId] = useState<string>("");
    const [assetId, setAssetId] = useState<string>("");
    const [scanType, setScanType] = useState<string>("Fast Scan");
    const [customPort, setCustomPort] = useState<string>("");

    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [scanOutput, setScanOutput] = useState<string>("");
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [showAlertBox, setShowAlertBox] = useState(false);
    const [showMessage, setShowMessage] = useState<string>("");
    const [showType, setShowType] = useState<"success" | "danger" | "warning">("warning");

    // ✅ Use array instead of single host
    const [scanResults, setScanResults] = useState<ScanInfo[]>([]);

    const clearAlert = () => {
        setTimeout(() => {
            setShowAlertBox(false);
            setShowMessage("");
        }, 5000);
    };

    useEffect(() => {
        const newSocket = io(Socket_Io);
        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("Connected to socket:", newSocket.id);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        const fetchDomains = async () => {
            const options = await getListOfDomain("ipRangeAndCider");
            setDropDownOptions(options);
        };
        fetchDomains();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const onScanResult = (data: any) => {
            console.log("✅ Received scanResult:", data);

            setScanOutput(JSON.stringify(data.scanOutput, null, 2));
            setIsRunning(false);
            setIsLoading(false);

            setShowMessage("Scan completed successfully");
            setShowType("success");
            setShowAlertBox(true);
            clearAlert();

            if (Array.isArray(data.scanOutput) && data.scanOutput.length > 0) {
                const mappedHosts = data.scanOutput.map((h: any) => {
                    const tcpPorts = h.protocols?.tcp || [];
                    const mappedPorts = tcpPorts.map((p: any) => ({
                        port: String(p.port),
                        state: p.state,
                        service: p.name || p.product || "unknown",
                    }));

                    return {
                        host: h.host || "",
                        state: h.state || "",
                        protocol: "tcp",
                        osGuess: h.os?.[0] || "Unknown",
                        ports: mappedPorts,
                    };
                });
                setScanResults(mappedHosts);
            }
            setEndTime(Date.now());
        };

        socket.on("scanResult", onScanResult);

        return () => {
            socket.off("scanResult", onScanResult);
        };
    }, [socket]);



    const getDuration = () => {
        if (!startTime || !endTime) return "-";
        const durationMs = endTime - startTime;
        const seconds = Math.floor((durationMs / 1000) % 60);
        const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    };
    

    async function createScanData() {
        const workspaceId = localStorage.getItem("workspaceId");
        if (!workspaceId) {
            setShowMessage("Workspace ID is missing!");
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
            return;
        }

        if (!targetName?.label) {
            setShowMessage("Target information is missing!");
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
            return;
        }

        const payload = {
            assetId,
            scan: "Network Scan",
            target: targetName.label,
            status: "-",
            doneAt: new Date(),
            workspaceId,
            result: "In Progress",
        };

        try {
            setIsLoading(true);
            const response = await axiosPrivate.post("/createScanController", payload);

            if (response.data?.status === true) {
                const scanIdFromResponse = response.data.data.scanId;
                setScanId(scanIdFromResponse);
                await startNetworkScan(scanIdFromResponse);
            } else {
                setShowMessage(response.data?.message || "Failed to add asset");
                setShowType("danger");
                setShowAlertBox(true);
                clearAlert();
                setIsLoading(false);
            }
        } catch (error: any) {
            console.error("Error adding asset:", error);
            setShowMessage(error.response?.data?.message || error.message);
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
            setIsLoading(false);
        }
    }

    const startNetworkScan = async (scanId: string) => {
        if (!socket || !targetName?.label) return;
        setStartTime(Date.now());
        setEndTime(null);
        setScanOutput("");
        setIsRunning(true);
        setScanResults([]); // ✅ clear previous results

        try {
            const payload = {
                target: targetName.label,
                scanId,
                scanType: scanType === "Custom port scan" ? customPort : scanType,
            };

            await axiosPrivate.post("/network-scan", payload, {
                headers: { "x-socket-id": socket.id },
            });
        } catch (err: any) {
            console.error("Error starting scan:", err);
            setIsRunning(false);
            setIsLoading(false);
            setShowMessage(err.message || "Failed to start scan");
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
        }
    };

    const downloadReport = async () => {
        setIsLoading(true);
        try {
            const response = await axiosPrivate.get(`/download-report/${scanId}`, {
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", `Network_Scan_${scanId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error: any) {
            console.error("Error fetching scan report:", error);
            setShowMessage(error?.response?.data?.message || error.message);
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="scans-main-page">
            <div className="pageHeader">
                <div className="Breadcrumb">
                    <h2 className='pageHeading' style={{ cursor: "pointer" }} onClick={() => setscanPageView("Grid")}>
                        Scans
                    </h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }}>{">"}</h2>
                    <h2 className='pageHeading'
                        style={{ marginLeft: "10px", cursor: "pointer" }}
                        onClick={() => setscanPageView("Main")}
                    >
                        New Scan
                    </h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }}>{">"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }}>Network Scan</h2>
                </div>
            </div>

            <div className="main-container">
                <div className="formSpace">
                    {/* === Controls === */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "400px" }}>
                            <DropdownComponent
                                options={dropDownOptions}
                                isDisabled={isRunning}
                                placeHolder={"Select Target"}
                                width={"100%"}
                                defaultValue={targetName}
                                color={"var(--input-bg)"}
                                getData={(val) => {
                                    setTargetName(val);
                                    setAssetId(val.value);
                                }}
                            />
                        </div>
                        <div>
                            <ButtonComponent
                                title={"Scan"}
                                height={"40px"}
                                width={"155px"}
                                backgroundColor={"var(--btn-primary-bg)"}
                                disabled={isRunning}
                                color={"white"}
                                className={"button-component-hover cancel"}
                                handleClick={createScanData}
                            />
                        </div>
                    </div>

                    {/* === Scan Type === */}
                    <div style={{ display: "flex", marginTop: "10px", gap: "15px", height: "25px" }}>
                        <div style={{ display: "flex", gap: "15px", height: "50px" }}>
                            {["Fast Scan", "Full Scan", "Custom port scan"].map((type) => (
                                <RadioOrCheckbox
                                    key={type}
                                    value={type}
                                    type="radio"
                                    name="scanType"
                                    checkedValue={scanType}
                                    getVal={setScanType}
                                    disabled={isRunning}
                                />
                            ))}
                        </div>
                        {scanType === "Custom port scan" && (
                            <div className="form-group">
                                <input
                                    id="customPort"
                                    type="text"
                                    autoComplete="off"
                                    className="form-control form-input"
                                    placeholder="Port / Port Range"
                                    maxLength={50}
                                    value={customPort}
                                    onChange={(e) => setCustomPort(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {showAlertBox && (
                        <div className="alert-warp">
                            <Alertbox type={showType} message={showMessage} />
                        </div>
                    )}

                    {isLoading && <Loader variant="inline" />}

                    {scanOutput && (
                        <>
                            <div style={{ display: "flex", alignItems: "end", justifyContent: "end" }}>
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

                            <div className="scan-results">
                                {/* ==== KPI CARDS ==== */}
                                <div className="summary-cards">
                                    <div className="summary-card">
                                        <h4>Duration</h4>
                                        <p>{getDuration()}</p>
                                    </div>
                                    <div className="summary-card">
                                        <h4>Total Hosts</h4>
                                        <p>{scanResults.length}</p>
                                    </div>
                                    <div className="summary-card">
                                        <h4>Hosts Up</h4>
                                        <p className="green">
                                            {scanResults.filter(h => h.state === "up").length}
                                        </p>
                                    </div>
                                    <div className="summary-card">
                                        <h4>Open Ports</h4>
                                        <p>{scanResults.reduce((sum, h) => sum + h.ports.length, 0)}</p>
                                    </div>
                                </div>

                                {/* ==== HOST SUMMARY ==== */}
                                <h3 className="section-title">Host Summary</h3>
                                <table className="scan-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>IP</th>
                                            <th>Status</th>
                                            <th>OS Guess</th>
                                            <th>Open Ports</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {scanResults.map((h, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td>{h.host}</td>
                                                <td>
                                                    <span className={`badge ${h.state === "up" ? "green" : "red"}`}>
                                                        {h.state}
                                                    </span>
                                                </td>
                                                <td>{h.osGuess}</td>
                                                <td>{h.ports.length}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* ==== PORT DETAILS ==== */}
                                <h3 className="section-title">Open Ports & Services</h3>
                                <table className="scan-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>IP</th>
                                            <th>Port</th>
                                            <th>State</th>
                                            <th>Service</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            let rowCounter = 1; // ✅ single counter across all rows
                                            return scanResults.flatMap((h, idx) =>
                                                h.ports.length > 0 ? (
                                                    h.ports.map((p, pIdx) => (
                                                        <tr key={`${idx}-${pIdx}`}>
                                                            <td>{rowCounter++}</td> {/* ✅ sequential numbering */}
                                                            <td>{h.host}</td>
                                                            <td>{p.port}</td>
                                                            <td>
                                                                <span className={`badge ${p.state === "open" ? "green" : "red"}`}>
                                                                    {p.state}
                                                                </span>
                                                            </td>
                                                            <td>{p.service}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr key={`${idx}-noports`}>
                                                        <td>{rowCounter++}</td> {/* ✅ still increments */}
                                                        <td>{h.host}</td>
                                                        <td colSpan={3}>No open ports</td>
                                                    </tr>
                                                )
                                            );
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
