
import { RxCross1 } from 'react-icons/rx';
import '../../../styles/modal/overall-position-mtm.scss';
import { Table } from 'react-bootstrap';
import { useState } from 'react';
import BunkerROBSplitDatas from './bunker-split-table';
interface Props {
    // headerName: any;
    // physicalModalData: any;
    // dummyData?: any;
    // setPhysicalRowData: any;
    hideModal: (boolean: any) => void
    getRobDatas: any
    // derivativeData: any
    // derivativeHeader: any
    // isRealised?: any
}

// derivativeHeader, isRealised, derivativeData 
export default function BunkerROBDatas({ hideModal, getRobDatas }: Props) {
    const [isSplitUpPopUp, setIsSplitUpPopUp] = useState<boolean>(false);
    const [getBunkerBreakerUpDatas, setGetBunkerBreakerUpDatas] = useState<boolean>(false);

    console.log(getRobDatas, "getRobDatas")
    function formatDate(date: any) {
        if (date) {
            let dateTime = new Date(date);
            const day = String(dateTime.getDate()).padStart(2, '0');
            const month = String(dateTime.getMonth() + 1).padStart(2, '0');
            const year = dateTime.getFullYear();
            return `${day}/${month}/${year}`;
        } else {
            return "";
        }
    }
    const formatAmount = (amount: any) => {
        console.log(amount, "amount")
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
        return "0.00";
    };
    return (
        <div className='mtm-overall-derivative-modal'>
            <div className='mtm-overall-derivative-container' style={{ width: "75%" }}>
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
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div className='overall-derivative-header'>{"Bunker ROB"}</div>
                        <div style={{ display: "flex", gap: "25px", marginRight: "100px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <div className='overall-derivative-header' style={{ fontSize: "18px" }}>{"VLSFO:"}</div>
                                <div style={{ fontSize: "16px", fontWeight: 500 }}>{parseFloat(getRobDatas.reduce((total: any, value: any) => {
                                    return total += value.fuelQuantities.VLSFO.total
                                }, 0)).toFixed(2)}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <div className='overall-derivative-header' style={{ fontSize: "18px" }}>{"HSFO:"}</div>
                                <div style={{ fontSize: "16px", fontWeight: 500 }}>{parseFloat(getRobDatas.reduce((total: any, value: any) => {
                                    return total += value.fuelQuantities.HSFO.total
                                }, 0)).toFixed(2)}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <div className='overall-derivative-header' style={{ fontSize: "18px" }}>{"LSMGO:"}</div>
                                <div style={{ fontSize: "16px", fontWeight: 500 }}>{parseFloat(getRobDatas.reduce((total: any, value: any) => {
                                    return total += value.fuelQuantities.LSMGO.total
                                }, 0)).toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="view-table-component-ch" style={{ top: "15px", overflow: "auto" }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "250px", textAlign: "left", paddingLeft: "15px" }}>Vessel Name</th>
                                <th style={{ width: "70px", textAlign: "right", paddingLeft: "0px" }}>VLSFO Quantity</th>
                                <th style={{ width: "100px", textAlign: "right", paddingLeft: "0px" }}>VLSFO Price</th>
                                <th style={{ width: "70px", textAlign: "right", paddingRight: "10px" }}>HSFO Quantity</th>
                                <th style={{ width: "100px", textAlign: "right", paddingRight: "10px" }}>HSFO Price</th>
                                <th style={{ width: "70px", textAlign: "right", paddingRight: "10px" }}>LSMGO Quantity</th>
                                <th style={{ width: "100px", textAlign: "right", paddingRight: "10px" }}>LSMGO Price</th>
                                {/* <th style={{ width: "70px", textAlign: "right", paddingRight: "10px" }}>Total Quantity</th> */}
                                <th style={{ width: "100px", textAlign: "right", paddingRight: "10px" }}>Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getRobDatas?.length === 0 ? (
                                <div className="main-body-header">
                                    <tr className="style-grid-differ">
                                        <td></td>
                                        <td></td>
                                        <td>No records found</td>
                                        <td></td>
                                    </tr>
                                </div>
                            ) : (
                                getRobDatas &&
                                getRobDatas?.map((data: any, i: number) => (
                                    <div className="main-body-header-bunker" key={i}>
                                        <tr>
                                            <td style={{ width: "250px", textAlign: "left", paddingLeft: "15px" }} >{(data.vessel)}</td>
                                            <td onClick={() => {
                                                if (data.fuelQuantities.VLSFO.details.length > 0) {

                                                    setIsSplitUpPopUp(true)
                                                    setGetBunkerBreakerUpDatas(data.fuelQuantities.VLSFO.details)
                                                }
                                            }} style={data.fuelQuantities.VLSFO.details.length > 0 ? { width: "70px", textAlign: "right", cursor: "pointer", color: "blue" } : { width: "70px", textAlign: "right" }}>{formatAmount(parseFloat(data.fuelQuantities.VLSFO.total).toFixed(2))}</td>
                                            <td style={{ width: "100px", textAlign: "right", paddingRight: "15px", cursor: "pointer" }}>{formatAmount(parseFloat(data.fuelQuantities.vlsfoAmount).toFixed(2))}</td>
                                            <td onClick={() => {
                                                if (data.fuelQuantities.HSFO.details.length > 0) {
                                                    setIsSplitUpPopUp(true)
                                                    setGetBunkerBreakerUpDatas(data.fuelQuantities.HSFO.details)
                                                }
                                            }} style={data.fuelQuantities.HSFO.details.length > 0 ? { width: "70px", textAlign: "right", cursor: "pointer", color: "blue" } : { width: "70px", textAlign: "right" }}>{formatAmount(parseFloat(data.fuelQuantities.HSFO.total).toFixed(2))}</td>
                                            <td style={{ width: "100px", textAlign: "right", paddingRight: "15px", cursor: "pointer" }}>{formatAmount(parseFloat(data.fuelQuantities.hsfoAmount).toFixed(2))}</td>
                                            <td onClick={() => {
                                                if (data.fuelQuantities.LSMGO.details.length > 0) {
                                                    setIsSplitUpPopUp(true)
                                                    setGetBunkerBreakerUpDatas(data.fuelQuantities.LSMGO.details)
                                                }
                                            }} style={data.fuelQuantities.LSMGO.details.length > 0 ? { width: "70px", textAlign: "right", cursor: "pointer", color: "blue" } : { width: "70px", textAlign: "right" }}>{formatAmount(parseFloat(data.fuelQuantities.LSMGO.total).toFixed(2))}</td>
                                            <td style={{ width: "100px", textAlign: "right", paddingRight: "15px", cursor: "pointer" }}>{formatAmount(parseFloat(data.fuelQuantities.lsmgoAmount).toFixed(2))}</td>
                                            {/* <td style={{ width: "70px", textAlign: "right", paddingRight: "15px", cursor: "pointer" }}>{formatAmount(parseFloat(data.fuelQuantities.total).toFixed(2))}</td> */}
                                            <td style={{ width: "100px", textAlign: "right", paddingRight: "15px", cursor: "pointer" }}>{formatAmount(parseFloat(data.fuelQuantities.amount).toFixed(2))}</td>
                                        </tr>
                                    </div>

                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isSplitUpPopUp &&
                <BunkerROBSplitDatas
                    hideModal={() => {
                        setIsSplitUpPopUp(false)
                    }}
                    getRobSplitDatas={getBunkerBreakerUpDatas}
                />

            }
        </div>
    )
}