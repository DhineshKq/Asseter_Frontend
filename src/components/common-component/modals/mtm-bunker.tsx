import React, { useState } from 'react'
import '../../../styles/modal/mtm-cargo-booking.scss'
import ButtonComponent from '../form-elements/button-component'
import { RxCross1 } from 'react-icons/rx'
import { Col, Row, Table } from 'react-bootstrap';
import AgGrid from '../grids-and-tables/ag-grid';
import CustomEllipsisRenderer from '../../../config/elipsis';
import { formatAmountNegative } from '../../../helpers/format-amount';
// import { TimePicker } from 'antd';

interface Props {
    selectedBunker: any;
    bunkerData: any;
    hideModal: (boolean: any) => void
}
export default function MtmBunkerModal({ hideModal, selectedBunker, bunkerData }: Props) {

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
                <div style={{ overflow: "auto", height: "100%" }}>
                    <div className='Cargo-popup-ROB'>
                        <div className='Cargo-popup-ROB-title'>
                            {selectedBunker?.val?.name || ""}{selectedBunker?.val?.voyageNumber ? "-" : ""}{selectedBunker?.val?.voyageNumber || ""} </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ display: "flex", gap: "10px" }}><div style={{ color: "#295285", fontWeight: '700' }}>Delivery Date</div> <div>{new Date(selectedBunker?.val?.deliveryDate).toLocaleDateString()}</div></div>
                            <div style={{ display: "flex", gap: "10px" }}><div style={{ color: "#295285", fontWeight: '700' }}>Re-Delivery Date</div> <div>{new Date(selectedBunker?.val?.reDeliveryDate).toLocaleDateString()}</div></div>
                        </div>

                        <Col sm={12} className='Cargo-popup-container-table-wrapper' >
                            <div
                                className="view-table-component-ch"
                                style={{ marginTop: "30px", overflow: "auto" }}
                            >
                                <table >
                                    <thead>
                                        <tr>
                                            <th style={{ paddingLeft: '8px', width: "140px", textAlign: "left", }}  >Voyage No</th>
                                            <th style={{ textAlign: "left", width: "200px", }}>Counter party</th>
                                            <th style={{ textAlign: "right", width: "200px", }}>@Delivery</th>
                                            <th style={{ textAlign: "right", width: "200px", }}>Price/Mt</th>
                                            <th style={{ textAlign: "right", width: "200px", }}>@Re-Delivery</th>
                                            <th style={{ textAlign: "right", width: "200px", position: "relative", right: "15px" }}>Price/Mt</th>
                                            <th style={{ paddingRight: '8px', textAlign: "right", width: "180px", }}>Amount Received</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedBunker.BunkerReportByVessel?.length === 0 ? (
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
                                            selectedBunker.BunkerReportByVessel &&
                                            selectedBunker?.BunkerReportByVessel?.map((data: any, i: number) => (
                                                <div className="main-body-header-bunker" key={i}>
                                                    <tr>
                                                        <td style={{ paddingLeft: '8px', width: "200px", backgroundColor: "white" }}> <b>{data.voyageNo}</b> </td>
                                                        <td style={{ width: "200px", backgroundColor: "white", position: "relative", right: "50px" }}>{data.charterer}</td>
                                                        <td style={{ width: "200px", backgroundColor: "white", textAlign: "right", position: "relative", right: "35px" }}>{formatAmountNegative(data.onDeliveryQuantityByVessel)}</td>
                                                        <td style={{ width: "200px", backgroundColor: "white", textAlign: "right", position: "relative", right: "20px" }}>{formatAmountNegative(data.onDeliveryAvgRateByVessel)}</td>
                                                        <td style={{ width: "200px", backgroundColor: "white", textAlign: "right", position: "relative", right: "10px" }}>{formatAmountNegative(data.onReDeliveryQuantityByVessel)}</td>
                                                        <td style={{ width: "200px", backgroundColor: "white", textAlign: "right", position: "relative", right: "10px" }}>{formatAmountNegative(data.onReDeliveryAvgRateByVessel)}</td>
                                                        <td style={{ paddingRight: '8px', width: "200px", backgroundColor: "white", textAlign: "right", color: data.Amountpayable < 0 ? "red" : "green" }}>{formatAmountNegative(data.Amountpayable)}</td>
                                                    </tr>
                                                </div>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Col>
                    </div>
                    <div className='Cargo-popup-ROB'>
                        <div className='Cargo-popup-ROB-title'>
                            {"Purchase History"} </div>
                        <Col sm={12} className='Cargo-popup-container-table-wrapper' >
                            <div
                                className="view-table-component-ch"
                                style={{ marginTop: "30px", overflow: "auto" }}>
                                <table >
                                    <thead>
                                        <tr>
                                            <th style={{ paddingLeft: '8px', width: "140px", textAlign: "left", }}  >Date</th>
                                            <th style={{ textAlign: "left", width: "200px", }}>Counter party</th>
                                            <th style={{ textAlign: "right", width: "200px", }}>Quantity</th>
                                            <th style={{ textAlign: "right", width: "200px", position: "relative", right: "15px" }}>Price</th>
                                            <th style={{ paddingRight: '8px', textAlign: "right", width: "180px" }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bunkerData.BunkerReportByBunker?.length === 0 ? (
                                            <div className="main-body-header">
                                                <tr className="style-grid-differ">
                                                    <td></td>
                                                    <td></td>
                                                    <td>No records found</td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </div>
                                        ) : (
                                            bunkerData.BunkerReportByBunker &&
                                            bunkerData?.BunkerReportByBunker?.map((data: any, i: number) => (
                                                <div className="main-body-header-bunker" key={i}>
                                                    <tr>
                                                        <td style={{ paddingLeft: '8px', width: "140px", backgroundColor: "white" }}> <b>{new Date(data.date).toLocaleDateString()}</b> </td>
                                                        <td style={{ width: "200px", backgroundColor: "white", }}>{data.counterParty}</td>
                                                        <td style={{ width: "200px", backgroundColor: "white", textAlign: "right" }}>{formatAmountNegative(data.quantity)}</td>
                                                        <td style={{ width: "200px", backgroundColor: "white", textAlign: "right" }}>{formatAmountNegative(data.price)}</td>
                                                        <td style={{ paddingRight: '8px', width: "200px", backgroundColor: "white", textAlign: "right" }}>{formatAmountNegative(data.total)}</td>
                                                    </tr>
                                                </div>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </Col>
                    </div>
                </div>
            </div>
        </div>
    )
}
