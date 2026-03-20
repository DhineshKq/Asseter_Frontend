import React, { useState } from 'react'
import '../../../styles/modal/mtm-physical-modal.scss'
import ButtonComponent from '../form-elements/button-component'
import { RxCross1 } from 'react-icons/rx'
import { Col, Row, Table } from 'react-bootstrap';
import AgGrid from '../grids-and-tables/ag-grid';
import CustomEllipsisRenderer from '../../../config/elipsis';
import Loading from './loading-screen';
// import { TimePicker } from 'antd';

interface Props {
    selectedBunker: any;
    vesselDetails: any;
    loading: any;
    hideModal: (boolean: any) => void
}
export default function MtmPhysicalModal({ hideModal, loading, vesselDetails, selectedBunker }: Props) {
    const formatAmountUSD = (amount: any) => {
        if (amount && amount !== ".") {
            const onlyNumber: any = amount.toString().replace(/[^0-9.]/g, "");
            // Handle empty input
            if (onlyNumber === "") {
                return "";
            }
            // Split input into integer and decimal parts
            const parts = onlyNumber.split(".");
            const integerPart = parts[0];
            const decimalPart = parts[1] || "";
            // Format the integer part with commas
            const formattedInteger = parseFloat(integerPart).toLocaleString();
            // Handle complete decimal input (e.g., "5000.50")
            if (decimalPart !== "") {
                return `${formattedInteger}.${decimalPart}`;
            }
            // Handle incomplete decimal input (e.g., "5000.")
            if (amount.toString().endsWith(".")) {
                return `${formattedInteger}.`;
            }
            // Return formatted integer
            return formattedInteger;
        }
        return "";
    };
    // Formate Amount Function
    const formatAmount = (amount: any) => {
        if (amount && amount !== ".") {
            const onlyNumber: any = amount.toString().replace(/[^0-9.-]/g, "");
            // Handle empty input
            if (onlyNumber === "") {
                return "";
            }
            // Split input into integer and decimal parts
            const parts = onlyNumber.split(".");
            const integerPart = parts[0];
            const decimalPart = parts[1] || "";
            // Format the integer part with commas
            const formattedInteger = parseFloat(integerPart).toLocaleString();
            // Handle complete decimal input (e.g., "5000.50")
            if (decimalPart !== "") {
                return `${formattedInteger}.${decimalPart}`;
            }
            // Handle incomplete decimal input (e.g., "5000.")
            if (amount.toString().endsWith(".")) {
                return `${formattedInteger}.`;
            }
            // Return formatted integer
            return formattedInteger;
        }
        return "";
    };
    return (
        <div className='mtm-cargo-physical-modal'>
            <div className='mtm-cargo-physical-container'>
                <div>
                    <div className={"close-icon"}>
                        <span className={"cross-icon"}>
                            <RxCross1 onClick={() => { hideModal(false) }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        hideModal(false)
                                    }
                                }}
                                style={{ fontSize: "30px" }} />
                        </span>
                    </div>
                </div>
                <div style={{ overflow: "auto", height: "100%" }}>
                    <div className='Cargo-popup-ROB'>
                        <div className='Cargo-popup-ROB-title'>
                            {"Vessel"} </div>
                        <div className='vessel-details'>
                            <div className='vessel-details-sub'>
                                <div className='vessel-details-sub-vessel-name' style={{ fontWeight: "bold" }}>
                                    Vessel Name
                                </div>
                                <div className='vessel-details-sub-name' style={{ fontWeight: "bold" }}>
                                    Buy Days
                                </div>
                                <div className='vessel-details-sub-name' style={{ fontWeight: "bold" }}>
                                    Sell Days
                                </div>
                                <div className='vessel-details-sub-name' style={{ fontWeight: "bold" }}>
                                    Buy Total ($)
                                </div>
                                <div className='vessel-details-sub-name' style={{ fontWeight: "bold" }}>
                                    Sell Total ($)
                                </div>
                                <div className='vessel-details-sub-name-last' style={{ fontWeight: "bold" }}>
                                    MTM ($)
                                </div>

                            </div>
                            {/* <div className='vessel-details-sub'> */}
                            {/* {selectedBunker && selectedBunker.map((value: any, index: number) => ( */}
                            <div className='vessel-details-sub'>
                                <div className='vessel-details-sub-vessel-name'>
                                    {vesselDetails.vesselname}
                                </div>
                                <div className='vessel-details-sub-name'>
                                    {vesselDetails.buydays}
                                </div>
                                <div className='vessel-details-sub-name'>
                                    {vesselDetails.sellDays}
                                </div>
                                <div className='vessel-details-sub-name'>
                                    {formatAmount(vesselDetails.buyTotal)}
                                </div>
                                <div className='vessel-details-sub-name'>
                                    {formatAmount(vesselDetails.selltotal)}
                                </div>
                                <div className='vessel-details-sub-name-last'
                                >
                                    {formatAmount((vesselDetails.MTM))}
                                </div>
                            </div>

                            {/* ))} */}


                            {/* </div> */}
                        </div>

                        <Col sm={12} className='Cargo-popup-container-table-wrapper' >
                            {/* <div
                                className="view-table-component-ch"
                                style={{ marginTop: "30px", overflow: "auto" }}
                            > */}
                            <Table bordered responsive>
                                <tbody style={{ cursor: 'pointer' }} onClick={() => {
                                    // setOverallPositionComponent(true);
                                    // setHeader("Bunker")
                                }}>
                                    <tr>
                                        <td className={"table-row-header"}>Month</td>
                                        {
                                            // selectedBunker.physicalReportByVessel.length === 0 ? 
                                            (
                                                selectedBunker.physicalReportByVessel && selectedBunker.physicalReportByVessel.map((value: any, index: number) => (
                                                    < td key={index} > {
                                                        value.monthYear
                                                    }</td>
                                                ))
                                                // ) : (
                                                // <td style={{ textAlign: "center" }}>No Records Found</td>
                                            )}
                                    </tr>
                                    <tr>
                                        <td className={"table-row-header-buy"}>Buy</td>
                                        {selectedBunker.physicalReportByVessel && selectedBunker.physicalReportByVessel.length > 0 ? (
                                            selectedBunker.physicalReportByVessel && selectedBunker.physicalReportByVessel.map((value: any, index: number) => (
                                                <td key={index} style={{ height: "55px", minWidth: "155px" }}>
                                                    <div>
                                                        {value.days}
                                                    </div>
                                                    <div>
                                                        {`( ${formatAmountUSD(value.amount)} )`}
                                                    </div>
                                                </td>
                                            ))
                                        ) : (
                                            <td style={{ textAlign: "center" }}>No Records Found</td>
                                        )}
                                    </tr>
                                    <tr>
                                        <td className={"table-row-header-buy"}>Sell</td>
                                        {selectedBunker.physicalReportByVessel && selectedBunker.physicalReportByVessel.length > 0 ? (
                                            selectedBunker.physicalReportByVessel && selectedBunker.physicalReportByVessel.map((value: any, index: number) => (
                                                <td key={index} style={{ height: "55px", minWidth: "155px" }}>
                                                    <div>
                                                        {value.selladays}
                                                    </div>
                                                    <div>
                                                        {`( ${formatAmountUSD(String(parseInt(value.sellamount)))} )`}
                                                    </div>
                                                </td>
                                            ))
                                        ) : (
                                            <td style={{ textAlign: "center" }}>No Records Found</td>
                                        )}
                                    </tr>
                                </tbody>
                            </Table>
                            {/* </div> */}

                        </Col>
                    </div>

                </div>
            </div>

            {
                loading &&
                <Loading />
            }
        </div >
    )
}
