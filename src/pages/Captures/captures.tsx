import React, { useState } from 'react'
import '../../styles/pages/reports/reports.scss'
import '../../styles/common-component/page-heading.scss'
import ReportGridView from '../../components/captures/captures-grid';

export default function CapturesPage() {

    const [assetsPageView, setassetsPageView] = useState<string>("Grid")
    const [editAssets, setEditAssets] = useState<any>(null)
    const [refreshGrid, setRefreshGrid] = useState<boolean>(false);
    const [originalRowData, setOriginalRowData] = useState<any>([])

    return (
        <div className="assets-page-wrapper">
            <ReportGridView
                setassetsPageView={setassetsPageView}
                setEditAssets={setEditAssets}
                refreshGrid={refreshGrid}
                originalRowData={originalRowData}
                setOriginalRowData={setOriginalRowData}
            />
        </div>
    )
}