import React, { useState } from 'react'
import '../../../styles/modal/mtm-cargo-booking.scss'
import ButtonComponent from '../form-elements/button-component'
import { RxCross1 } from 'react-icons/rx'
import { Col, Row, Table } from 'react-bootstrap';
import AgGrid from '../grids-and-tables/ag-grid';
import CustomEllipsisRenderer from '../../../config/elipsis';
// import { TimePicker } from 'antd';

interface Props {
    selectedCargo: any;
    hideModal: (boolean: any) => void
}
export default function MtmCargoBooking({ hideModal, selectedCargo }: Props) {

    const formatAmountUSD = (amount: any) => {
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
        <div className='mtm-cargo-booking-modal'>
            <div className='mtm-cargo-booking-container'>
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
                <div style={{ overflow: "auto", height: "100%" }} >
                    {/* <TimePicker value={Value} onChange={onChange} />  */}
                    {
                        selectedCargo.ByVoyage &&
                        selectedCargo.ByVoyage?.map((data: any, i: number) => (
                            <div className='Cargo-popup-ROB' key={i}>
                                <div className='Cargo-popup-ROB-title'>
                                    VCIN- {selectedCargo.name} - {data.voyageNo} </div>
                                <Col sm={12} className='Cargo-popup-container-table-wrapper' >
                                    <div
                                        className="view-table-component-ch"
                                        style={{ marginTop: "30px", overflow: "auto" }}
                                    >
                                        <table >
                                            <thead>
                                                <tr>
                                                    <th style={{ paddingLeft: '8px', width: "140px", textAlign: "left", }}  >Charter Number</th>
                                                    <th style={{ textAlign: "right", width: "200px", }}>Outgoing Estimate ($)</th>
                                                    <th style={{ textAlign: "right", width: "200px", }}>Outgoing Actual ($)</th>
                                                    <th style={{ textAlign: "right", width: "200px", }}>Outgoing Difference ($)</th>
                                                    <th style={{ textAlign: "right", width: "200px", }}>Incoming Estimate ($)</th>
                                                    <th style={{ textAlign: "right", width: "200px", }}>Incoming Actual ($)</th>
                                                    <th style={{ textAlign: "right", width: "200px", }}>Incoming Difference ($)</th>
                                                    <th style={{ paddingRight: '8px', textAlign: "right", width: "180px", }}>P&L ($)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.ByVcoutVoyage === 0 ? (
                                                    <div className="main-body-header">
                                                        <tr className="style-grid-differ">
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td>No records found</td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                    </div>
                                                ) : (
                                                    data.ByVcoutVoyage &&
                                                    data.ByVcoutVoyage?.map((val: any, i: number) => (
                                                        <div className="main-body-header-bunker" key={i}>
                                                            <tr>
                                                                <td style={{ paddingLeft: '8px', width: "140px", backgroundColor: "white" }}> <b>{val.voyageNo}</b> </td>

                                                                <td style={{ width: "200px", backgroundColor: "white", textAlign: "right" }}>{i == 0 ? formatAmountUSD(data.OutgoingEstimate) : "-"}</td>
                                                                <td style={{ width: "200px", backgroundColor: "white", textAlign: "right" }}>{i == 0 ? formatAmountUSD(data.OutgoingActual) : "-"}</td>
                                                                <td style={{ width: "200px", backgroundColor: "white", textAlign: "right" }}>{i == 0 ? formatAmountUSD(data.OutgoingDifference) : "-"}</td>
                                                                <td style={{ width: "200px", backgroundColor: "white", textAlign: "right" }}>{formatAmountUSD((val.VcoutDetailsEstimatetotalRevCosts).toFixed(2))}</td>
                                                                <td style={{ width: "200px", backgroundColor: "white", textAlign: "right" }}>{formatAmountUSD((val.IncomingActual).toFixed(2))}</td>
                                                                <td style={{ width: "200px", backgroundColor: "white", textAlign: "right" }}>{formatAmountUSD(val.IncomingDifference)}</td>
                                                                <td style={{ paddingRight: '8px', width: "200px", backgroundColor: "white", textAlign: "right" }}>{i == 0 ? formatAmountUSD(data.PandL) : "-"}</td>
                                                            </tr>
                                                        </div>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                </Col>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}
