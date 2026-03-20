import React, { useEffect, useState } from 'react'
import ScansGrid from '../../components/scans/scan-grid';
import ScansMainView from '../../components/scans/scans-mainPage';
import ScansReconnaissance from '../../components/scans/scan-reconnaissance';
import ScansVulnerability from '../../components/scans/scan-vulnerability';
import ScanSqlInjection from '../../components/scans/sca-sqlInjection'
import ScanTrafficAnalysis from '../../components/scans/scan-trafficAnalyser'
import HstsDowngradePage from '../../components/scans/scan-hstsDowngrade'
import ScanNetworkPage from '../../components/scans/scan-network'
import PlanExpired from '../../components/common-component/subscription/planExpired';


export default function AssetsPage() {

    const [scanPageView, setscanPageView] = useState<string>("Grid")
    const [assetsPageView, setassetsPageView] = useState<string>("Grid")
    const [planType, setplanType] = useState<"expired" | "insufficient">("expired");

    return (
        <div>

            {scanPageView === "Grid" &&
                <ScansGrid
                    setscanPageView={(val) => {
                        setscanPageView(val)
                    }}
                />
            }
            {scanPageView === "Main" &&
                <ScansMainView
                    setscanPageView={(val) => {
                        setscanPageView(val)
                    }}
                    setPlanType={setplanType}
                />
            }
            {scanPageView === "Reconnaissance" &&
                <ScansReconnaissance
                    setscanPageView={(val) => {
                        setscanPageView(val)
                    }}
                    setassetsPageView={setassetsPageView}
                />
            }
            {scanPageView === "Vulnerability Scanner" &&
                <ScansVulnerability
                    setscanPageView={(val) => {
                        setscanPageView(val)
                    }}
                />
            }
            {scanPageView === "Sql Injection" &&
                <ScanSqlInjection
                    setscanPageView={(val) => {
                        setscanPageView(val)
                    }}
                />
            }
            {scanPageView === "Traffic Analyser" &&
                <ScanTrafficAnalysis
                    setscanPageView={(val) => {
                        setscanPageView(val)
                    }}
                />
            }
            {scanPageView === "Hsts Downgrade" &&
                <HstsDowngradePage
                    setscanPageView={(val) => {
                        setscanPageView(val)
                    }}
                />
            }
            {scanPageView === "Network Scan" &&
                <ScanNetworkPage
                    setscanPageView={(val) => {
                        setscanPageView(val)
                    }}
                />
            }
            {scanPageView === "PlanExpired" &&
                <PlanExpired
                    type={planType}
                    setassetsPageView={(val) => {
                        setscanPageView(val)
                    }}
                    cancelPageView="Main"
                />
            }
        </div>
    )
}