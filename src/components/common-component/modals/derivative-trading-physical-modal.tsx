import React, { useEffect, useState } from 'react'
import '../../../styles/common-components/vessel-image-view-modal.scss'
import { RxCross1 } from "react-icons/rx";
import '../../../styles/common-component-charts/right-grid.scss';
interface DerivativeTradingPhysicalModalProps {
    closePopup: () => void;
    rowData?: any;
}

export default function DerivativeTradingPhysicalModal({ closePopup, rowData }: DerivativeTradingPhysicalModalProps) {

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closePopup();
            }
        };

        // Add event listener for the 'keydown' event
        document.addEventListener('keydown', handleKeyPress);
        // Remove the event listener when the component is unmounted
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [])
    const formatAmount = (amount: any) => {
        if (amount && amount !== ".") {
            const onlyNumber: any = amount.toString().replace(/[^0-9.-]/g, "");
            if (onlyNumber === "") {
                return "";
            }
            const parts = onlyNumber.split(".");
            const integerPart = parts[0];
            const decimalPart = parts[1] || "";
            const formattedInteger = parseFloat(integerPart).toLocaleString();
            if (decimalPart !== "") {
                return `${formattedInteger}.${decimalPart}`;
            }
            if (amount.toString().endsWith(".")) {
                return `${formattedInteger}.`;
            }
            return formattedInteger;
        }
        return "";
    };

    return (
        <div className={"vessel-image-view-modal"}>
            <div className={"container-vessel-image-view-modal"} style={{ height: "400px", width: "45%" }}>
                <div style={{ height: "450px", width: "100%", padding: "25px" }}>

                    <div>
                        <div className={"close-icon"}>
                            <span className={"cross-icon"}>
                                <RxCross1 onClick={() => { closePopup() }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            closePopup()
                                        }
                                    }}
                                    style={{ fontSize: "30px" }} />
                            </span>
                        </div>
                        <div style={{ fontSize: "30px", fontWeight: "500", color: "#295285" }}>
                            {"Physical"}
                        </div>
                        <div style={{ display: "flex", marginTop: "10px" }}>
                            <div style={{ marginRight: "40px", display: "flex" }}>
                                <div style={{ fontWeight: "bold", marginRight: "10px" }}>Vessel Name </div>
                                <div>{rowData?.vesselName}</div>
                            </div>
                            <div style={{ marginRight: "40px", display: "flex" }}>
                                <div style={{ fontWeight: "bold", marginRight: "10px" }}>Product </div>
                                <div>{rowData?.product}</div>
                            </div>
                            <div style={{ marginRight: "10px", display: "flex" }}>
                                <div style={{ fontWeight: "bold", marginRight: "10px" }}>Voyage No </div>
                                <div>{rowData?.voyageNumber}</div>
                            </div>
                        </div>
                        <div>
                            <div
                                className="view-table-component-ch"
                                style={{ marginTop: "30px", overflow: "auto" }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: "110px", textAlign: "left", paddingLeft: "15px", }}>Particulars</th>
                                            <th style={{ width: "120px", textAlign: "right", paddingLeft: "0px" }}>Buy Estimate $</th>
                                            <th style={{ width: "120px", textAlign: "right", paddingLeft: "0px" }}>Buy Actual $</th>
                                            <th style={{ width: "120px", textAlign: "right", paddingLeft: "0px" }}>Sell Estimate $</th>
                                            <th style={{ width: "120px", textAlign: "right", paddingLeft: "0px", paddingRight: "10px" }}>Sell Actual $</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(rowData)?.length === 0 ? (
                                            <div className="main-body-header">
                                                <tr className="style-grid-differ">
                                                    <td></td>
                                                    <td></td>
                                                    <td>No records found</td>
                                                    <td></td>
                                                </tr>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="main-body-header-bunker">
                                                    <tr>
                                                        <td style={{ width: "120px", textAlign: "left", paddingLeft: "10px" }} >{"Quantity"}</td>
                                                        <td style={{ width: "90px", textAlign: "right", }}>{rowData?.estimateQuantity && !isNaN(rowData.estimateQuantity) ? formatAmount(rowData.estimateQuantity) : ""}
                                                        </td>
                                                        <td style={{ width: "115px", textAlign: "right", }}>{
                                                            rowData?.quantity && !isNaN(rowData.quantity) ? formatAmount(rowData?.quantity) : ""
                                                        }</td>
                                                        <td style={{ width: "115px", textAlign: "right", }}>{formatAmount(rowData?.vcoutEstimateTotalQuantity)}</td>
                                                        <td style={{ width: "115px", textAlign: "right", paddingRight: "10px" }}>{formatAmount(rowData?.vcoutTotalQuantity)}</td>
                                                    </tr>
                                                </div>
                                                <div className="main-body-header-bunker">
                                                    <tr>
                                                        <td style={{ width: "120px", textAlign: "left", paddingLeft: "10px" }} >{"Price"}</td>
                                                        <td style={{ width: "90px", textAlign: "right", }}>{formatAmount(rowData?.estimatePrice)}</td>
                                                        <td style={{ width: "115px", textAlign: "right", }}>{formatAmount(rowData?.price)}</td>
                                                        <td style={{ width: "115px", textAlign: "right", }}>{formatAmount(rowData?.vcoutEstimateAveragePrice)}</td>
                                                        <td style={{ width: "115px", textAlign: "right", paddingRight: "10px" }}>{formatAmount(rowData?.vcoutAveragePrice)}</td>
                                                    </tr>
                                                </div>
                                                <div className="main-body-header-bunker">
                                                    <tr>
                                                        <td style={{ width: "120px", textAlign: "left", paddingLeft: "10px" }} >{"Revenue / Cost"}</td>
                                                        <td style={{ width: "90px", textAlign: "right", }}>{formatAmount(rowData?.estimateQuantity * rowData?.estimatePrice)}</td>
                                                        <td style={{ width: "115px", textAlign: "right", }}>{formatAmount(rowData?.quantity * rowData?.price)}</td>
                                                        <td style={{ width: "115px", textAlign: "right", }}>{formatAmount(rowData?.vcoutEstimateTotalQuantity * rowData?.vcoutEstimateAveragePrice)}</td>
                                                        <td style={{ width: "115px", textAlign: "right", paddingRight: "10px" }}>{formatAmount(rowData?.vcoutTotalQuantity * rowData?.vcoutAveragePrice)}</td>
                                                    </tr>
                                                </div>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}