import { useEffect, useRef, useState } from 'react'
import '../../styles/pages/scans/scans.scss'
import '../../styles/common-component/page-heading.scss'
import { v4 as uuidv4 } from 'uuid';
import ButtonComponent from '../../components/common-component/form-elements/button-component';
import DropdownComponent from '../../components/common-component/form-elements/dropdown-component'
import { axiosPrivate } from '../../middleware/axios-api';
import { Socket_Io } from '../../middleware/axios-api';
import { io, Socket } from "socket.io-client";
import Alertbox from '../../components/common-component/modals/alertbox-modal';
import Loader from '../common-component/loader/Loader';
import { getListOfDomain } from '../scan-components/Scan-components'

interface propsType {
    setscanPageView: (val: string) => void;
    setassetsPageView: any;
}
const isMountedRef = { current: false };

export default function ScanReconnainsancePage({ setscanPageView, setassetsPageView, }: propsType) {
    const socket = useRef<Socket | null>(null);
    const [showAlertBox, setShowAlertBox] = useState(false)
    const [showMessage, setShowMessage] = useState<string>("")
    const [showType, setShowType] = useState("warning")
    const [scanResults, setScanResults] = useState<string[]>([]);
    const clearAlert = () => {
        setTimeout(() => {
            setShowAlertBox(false);
            setShowMessage("");
        }, 5000);
    };
    const [targetName, setTargetName] = useState<any>();
    const [dropDownOptions, setDropDownOptions] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);
    const [scannedDomain, setScannedDomain] = useState<string>("");
    const [scanId, setScanId] = useState<string>("");
    const [assetId, setAssetId] = useState<string>("");
    const [subdomains, setSubdomains] = useState<string[]>([]);
    const subdomainsRef = useRef<any>(null);
    const scanIdRef = useRef<any>(null);
    const [reachableSubdomains, setReachableSubdomains] = useState<string[]>([]);
    // const [pieChartBase64, setPieChartBase64] = useState("");
    const [reconDone, setReconDone] = useState(false);

    useEffect(() => {
        const savedScanId = localStorage.getItem("scanId");
        const savedSubdomains = localStorage.getItem("subdomains");
        const savedReachable = localStorage.getItem("reachableSubdomains");
        const savedDomain = localStorage.getItem("scannedDomain");
        if (savedScanId) setScanId(savedScanId);
        if (savedDomain) setScannedDomain(savedDomain);
        if (savedSubdomains) setSubdomains(JSON.parse(savedSubdomains));
        if (savedReachable) setReachableSubdomains(JSON.parse(savedReachable));

    }, []);

    useEffect(() => {
        subdomainsRef.current = subdomains
        scanIdRef.current = scanId
    }, [subdomains, scanId]);

    useEffect(() => {
        // Initialize socket connection
        socket.current = io(Socket_Io);

        const handleReconLine = (line: string) => {
            const lines = line.split('\n');
            lines.forEach((l) => {
                const trimmed = l.trim();
                if (!trimmed) return;

                setScanResults(prev => [...prev, trimmed]);

                if (trimmed.startsWith("🔍 Running reconnaissance on:")) {
                    const domain = trimmed.split(": ")[1];
                    setScannedDomain(domain);
                    localStorage.setItem("scannedDomain", domain);
                } else if (trimmed.startsWith("✅ Found:")) {
                    const subdomain = trimmed.split(": ")[1]?.split(" ")[0];
                    if (subdomain) {
                        setReachableSubdomains(prev => {
                            const updated = [...prev, subdomain];
                            localStorage.setItem("reachableSubdomains", JSON.stringify(updated));
                            return updated;
                        });
                    }
                } else if (trimmed.includes('.') && !trimmed.startsWith("🔎") && !trimmed.startsWith("✅")) {
                    setSubdomains(prev => {
                        const updated = [...prev, trimmed];
                        localStorage.setItem("subdomains", JSON.stringify(updated));
                        return updated;
                    });
                }
            });
        };

        const handleReconDone = () => {
            setReconDone(true);
            setIsLoading(false);
            console.log("Recon done. Generating PDF...");
            setTimeout(() => {
                const scanIdFromStorage = localStorage.getItem("scanId");
                // updateScanData(scanIdFromStorage || "");
            }, 500);
        };

        const handleReconError = (errorLine: string) => {
            console.error("Recon Error:", errorLine);
        };

        // Set up socket listeners
        socket.current.on("recon-line", handleReconLine);
        socket.current.on("recon-done", handleReconDone);
        socket.current.on("recon-error", handleReconError);

        // Clean up socket listeners on unmount
        return () => {
            socket.current?.off("recon-line", handleReconLine);
            socket.current?.off("recon-done", handleReconDone);
            socket.current?.off("recon-error", handleReconError);
            socket.current?.disconnect(); // Optionally disconnect the socket
        };
    }, []);

    async function reconnaissanceScan() {
        localStorage.removeItem("scanId");
        localStorage.removeItem("scannedDomain");
        localStorage.removeItem("subdomains");
        localStorage.removeItem("reachableSubdomains");
        setScannedDomain("");
        setScanResults([]);
        setReachableSubdomains([]);
        setSubdomains([]);
        setIsLoading(true);
        setReconDone(false);

        const workspaceId = localStorage.getItem("workspaceId");
        if (!workspaceId) {
            setShowMessage("Workspace ID is missing!");
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
            setIsLoading(false);
            return;
        }
        if (!targetName) {
            setShowMessage("Please select Target before start scan!");
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
            setIsLoading(false);
            return;
        }

        createScanData("processing");

        const payload = { domain: targetName.label, scanId };
        let firstResponseReceived = false;

        // Set up socket listeners
        socket.current?.off("recon-line").on("recon-line", (line: unknown) => {
            const textLine = typeof line === "string" ? line : line?.toString?.() || "";

            if (!firstResponseReceived) {
                firstResponseReceived = true;
            }

            const lines = textLine.split('\n');
            lines.forEach((l) => {
                const trimmed = l.trim();
                if (!trimmed) return;

                try {
                    const parsed = JSON.parse(trimmed);

                    if (parsed.type === "subdomain") {
                        const { subdomain, reachable } = parsed;

                        if (subdomain) {
                            setSubdomains(prev => {
                                const updated = prev.includes(subdomain) ? prev : [...prev, subdomain];
                                localStorage.setItem("subdomains", JSON.stringify(updated));
                                return updated;
                            });

                            if (reachable && reachable.length > 0) {
                                setReachableSubdomains(prev => {
                                    const updated = prev.includes(subdomain) ? prev : [...prev, subdomain];
                                    localStorage.setItem("reachableSubdomains", JSON.stringify(updated));
                                    return updated;
                                });
                            }
                        }
                    } else if (parsed.type === "done") {
                        setReconDone(true);
                        console.log("Recon done. Generating PDF...");
                        setTimeout(() => {
                            const scanIdFromStorage = localStorage.getItem("scanId");
                            // updateScanData(scanIdFromStorage || "");
                        }, 500);
                    }
                } catch {
                    if (trimmed.startsWith("🔍 Running reconnaissance on:")) {
                        const domain = trimmed.split(": ")[1];
                        setScannedDomain(domain);
                        localStorage.setItem("scannedDomain", domain);
                    }

                    setScanResults(prev => [...prev, trimmed]);
                }
            });
        });
        try {
            await axiosPrivate.post('/subdomain-scan', payload, {
                headers: {
                    "Content-Type": "application/json",
                    "x-socket-id": socket.current?.id // Use socket.current to access the socket ID
                }
            });
        } catch (error: any) {
            console.error("Error scanning:", error);
            setShowMessage(error.response?.data?.message || error.message);
            setShowType("danger");
            setShowAlertBox(true);
            setIsLoading(false);
        }
    }

    async function createScanData(status: "processing" | string[]) {
        const workspaceId = localStorage.getItem("workspaceId");
        if (!workspaceId) {
            setShowMessage("Workspace ID is missing!");
            setShowType("error");
            setShowAlertBox(true);
            clearAlert();
            return;
        }

        let doneAt: string | Date = "-";

        if (Array.isArray(status)) {
            doneAt = new Date();
        }

        const payload = {
            assetId: assetId,
            scan: "Reconnaissance",
            target: targetName.label,
            status: "-",
            doneAt,
            workspaceId
        };

        try {
            const response = await axiosPrivate.post('/createScanController', payload);
            if (response.data?.status === true) {
                const newScanId = response.data.data.scanId;
                setScanId(newScanId);
                localStorage.setItem("scanId", newScanId);
            } else {
                setShowMessage(`Failed to add asset: ${response.data?.message || "Unknown error"}`);
                setShowType("danger");
                setShowAlertBox(true);
                clearAlert();
            }
        } catch (error: any) {
            console.error("Error adding asset:", error);
            setShowMessage(error.response?.data?.message || error.message);
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
        }
    }

    const downloadReport = async () => {
        try {
            const response = await axiosPrivate.get(`/download-report/${scanId}`, {
                responseType: 'blob',
            });

            // Create a blob URL from the response
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);

            // Create a temporary anchor to download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `Reconnaisance_${scanId}.pdf`);
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

    async function addAssets(name: string, target: string) {
        try {
            const workspaceId = localStorage.getItem("workspaceId");

            if (!workspaceId) {
                setShowMessage("Workspace ID is missing!");
                setShowType("danger");
                setShowAlertBox(true);
                clearAlert();
                return;
            }

            const payload = {
                name,
                targets: target,
                workspaceId
            };

            const response = await axiosPrivate.post('/addAssets', payload);
            if (response.data?.status === true) {
                setShowMessage("Asset added successfully!");
                setShowType("success");
                setShowAlertBox(true);
                clearAlert();
                setTimeout(() => {
                    setassetsPageView("Grid");
                }, 1500);
            } else {
                setShowMessage(`Failed to add asset: ${response.data?.message || "Unknown error"}`);
                setShowType("danger");
                setShowAlertBox(true);
                clearAlert();
            }
        } catch (error: any) {
            setShowMessage(`${error.response?.data?.message || error.message}`);
            setShowType("danger");
            setShowAlertBox(true);
            clearAlert();
        }
    }

    useEffect(() => {
        subdomainsRef.current = subdomains;
        scanIdRef.current = scanId;
    }, [subdomains, scanId]);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const fetchDomains = async () => {
            const options = await getListOfDomain("domain");
            setDropDownOptions(options);
        };
        fetchDomains();
    }, []);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return (
        <div className="scans-main-page">
            <div className="pageHeader">
                <div className="Breadcrumb">
                    <h2 className='pageHeading' style={{ cursor: "pointer" }} onClick={() => {
                        setscanPageView("Grid")
                    }} >{"Scans"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }} >{">"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px", cursor: "pointer" }} onClick={() => {
                        setscanPageView("Main")
                    }} >{" New Scan"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }} >{">"}</h2>
                    <h2 className='pageHeading' style={{ marginLeft: "10px" }}>{"Reconnainsance"}</h2>
                </div>
            </div>
            <div className='main-container'>
                <div className="formSpace">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {/* Dropdown Container */}
                        <div style={{ width: "400px" }} key={uuidv4()}>
                            <DropdownComponent
                                options={dropDownOptions}
                                isDisabled={false}
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

                        {/* Scan Button Container */}
                        <div >
                            <ButtonComponent
                                title={"Scan"}
                                height={"40px"}
                                width={"100px"}
                                backgroundColor={"var(--btn-primary-bg)"}
                                color={"white"}
                                className={"button-component-hover cancel"}
                                disabled={isLoading}
                                handleClick={reconnaissanceScan}
                            />
                        </div>

                    </div>
                    {
                        showAlertBox &&
                        <div className='alert-warp'>
                            <Alertbox type={showType} message={showMessage} />
                        </div>
                    }

                    {scanResults.length > 0 && reconDone && (
                        <div className="scan-result-table">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <h3>Scan Results:</h3>
                                <div >
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
                            </div>
                            <div style={{ marginTop: '30px', height: '80%', overflow: 'auto' }}>
                                <table>
                                    <thead style={{ position: 'sticky', top: '0' }}>
                                        <tr>
                                            <th>#</th>
                                            <th>Discovered Domains</th>
                                            <th>Is Reachable</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subdomains.map((domain, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td className="domain-cell" onClick={() => addAssets(`Recon-${domain}`, domain)}>
                                                    <span className="domain-text">{domain}</span>
                                                    <span className="plus-icon">click to add Asset</span>
                                                </td>

                                                <td>{reachableSubdomains.includes(domain) ? "Yes" : "No"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {isLoading && <Loader variant="inline" />}
                </div>
            </div>


        </div>
    );
}