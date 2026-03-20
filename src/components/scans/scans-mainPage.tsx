import React, { useEffect, useState } from 'react'
import '../../styles/pages/scans/scans.scss'
import '../../styles/common-component/page-heading.scss'
import { getPlanActive } from '../../services/utils/checkexpiration';


interface propsType {
    setscanPageView: (val: string) => void;
    setPlanType: React.Dispatch<React.SetStateAction<"expired" | "insufficient">>;
}

export default function ScanMainPage({ setPlanType, setscanPageView }: propsType) {
    const [isPlanActive, setIsPlanActive] = useState(false)
    const [expiryDate, setExpiryDate] = useState("")

    const handleScanClick = (scanType: string) => {
        if (isPlanActive) {
            setscanPageView(scanType);
        } else {
            setscanPageView("PlanExpired");
            setPlanType("expired");
        }
    };


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

    return (
        <div className="scans-main-page">
            <div className="pageHeader">
                    <div className="Breadcrumb">
                        <h2 className='pageHeading' style={{ cursor: "pointer",width:"50px" }} onClick={() => {
                            setscanPageView("Grid")
                        }} >{"Scans"}</h2>
                        <h2 className='pageHeading' style={{ marginLeft: "10px",width:"10px" }} >{">"}</h2>
                        <h2 className='pageHeading' style={{ marginLeft: "10px",width:"91px" }}>{"New Scan"}</h2>
                    </div>
                
            </div>

            <div className="scanGrid">

                <div className="scanContainer" onClick={() => handleScanClick("Reconnaissance")}>
                    <h6>🔍 Reconnaissance</h6>
                    <p className="description">
                        Discover and enumerate all publicly available subdomains linked to the target domain.
                        Gain visibility into your attack surface before deeper testing.
                    </p>
                    <p className="inputNeeded"><b>Required Input:</b> Target Domain (e.g., example.com)</p>
                </div>

                <div className="scanContainer" onClick={() => handleScanClick("Vulnerability Scanner")}>
                    <h6>🛡️ Vulnerability Scanner</h6>
                    <p className="description">
                        Perform a detailed security assessment of the target site to identify potential vulnerabilities.
                        Generates a structured vulnerability report with actionable remediation steps.
                    </p>
                    <p className="inputNeeded"><b>Required Input:</b> Full Web URL (e.g., https://example.com)</p>
                </div>

                {/* <div className="scanContainer" onClick={() => handleScanClick("Sql Injection")}>
                    <h6>💾 SQL Injection Test</h6>
                    <p className="description">
                        Probe the target for SQL Injection weaknesses that could expose or compromise database information.
                        Includes detection for error-based, union-based, and blind SQLi vectors.
                    </p>
                    <p className="inputNeeded"><b>Required Input:</b> Target Domain or Full Web URL</p>
                </div> */}

                <div className="scanContainer" onClick={() => handleScanClick("Traffic Analyser")}>
                    <h6>📡 Traffic Analysis</h6>
                    <p className="description">
                        Monitor and analyze live network traffic to detect unusual patterns, suspicious activity,
                        and possible data exfiltration attempts in real time.
                    </p>
                    <p className="inputNeeded"><b>Required Input:</b> Target IP Address</p>
                </div>

                <div className="scanContainer" onClick={() => handleScanClick("Hsts Downgrade")}>
                    <h6>⚠️ HSTS Downgrade Test</h6>
                    <p className="description">
                        Test if the target is vulnerable to HSTS downgrade attacks, which could allow interception
                        of supposedly secure HTTPS traffic.
                    </p>
                    <p className="inputNeeded"><b>Required Input:</b> Target IP Address</p>
                </div>

                <div className="scanContainer" onClick={() => handleScanClick("Network Scan")}>
                    <h6>🌐 Network Scan</h6>
                    <p className="description">
                        Perform an in-depth scan to identify open ports, running services, and exposed software versions
                        across single hosts or entire network ranges.
                    </p>
                    <p className="inputNeeded"><b>Required Input:</b> IP Address / IP Range / CIDR Notation</p>
                </div>

            </div>
        </div>
    );
}
