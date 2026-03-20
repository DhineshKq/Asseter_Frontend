
import { RxCross1 } from 'react-icons/rx';
import '../../../styles/modal/overall-position-mtm.scss';
import { Table } from 'react-bootstrap';
interface Props {
    // headerName: any;
    // physicalModalData: any;
    // dummyData?: any;
    // setPhysicalRowData: any;
    hideModal: (boolean: any) => void
    getRobSplitDatas: any
    // derivativeData: any
    // derivativeHeader: any
    // isRealised?: any
}

// derivativeHeader, isRealised, derivativeData 
export default function BunkerROBSplitDatas({ hideModal, getRobSplitDatas }: Props) {
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

    let getRobBuyDatas = getRobSplitDatas.filter((e: any) => {
        return e.tradeType == "Buy"
    });


    let bunkerData: any = []
    for (const bunker of getRobSplitDatas) {
        if (bunker.tradeType == "Sell" || bunker.tradeType == "Ballast") {

            let remainingQuantity = Math.abs(bunker.quantity);
            let sellAmount;
            if (bunkerData.length > 0) {
                getRobBuyDatas = [...bunkerData]
            }
            bunkerData = []
            for (const data of getRobBuyDatas) {
                sellAmount = parseFloat(data.quantity) - remainingQuantity;
                remainingQuantity -= parseFloat(data.quantity);  // Update remaining quantity

                // If remainingQuantity becomes negative, carry the shortage to the next iteration
                if (remainingQuantity < 0) {
                    sellAmount = Math.abs(remainingQuantity);  // Remaining shortage to be handled
                    remainingQuantity = 0;  // Reset remaining quantity for next entries

                    bunkerData.push({
                        // date: tcinPeriodInfoId.deliveryDate,
                        ...data,
                        quantity: sellAmount,
                    });
                }


            }
        }
    }

    console.log(bunkerData, "bunkerDataaaaaaaaaaaaaaa");
    return (
        <div className='mtm-overall-derivative-modal'>
            <div className='mtm-overall-derivative-container' style={{ width: "73%" }}>
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
                    <div className='overall-derivative-header'>{`${getRobSplitDatas[0]?.VesselDetails ? getRobSplitDatas[0]?.VesselDetails : "-"}`}</div>
                </div>
                <div className="view-table-component-ch" style={{ top: "15px", overflowY: "auto" }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "250px", textAlign: "left", paddingLeft: "15px" }}>Types</th>
                                <th style={{ width: "100px", textAlign: "left", paddingLeft: "0px" }}>Trade Type</th>
                                <th style={{ width: "70px", textAlign: "right", paddingRight: "10px" }}>Quantity</th>
                                <th style={{ width: "70px", textAlign: "right", paddingRight: "10px" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getRobSplitDatas?.length === 0 ? (
                                <div className="main-body-header">
                                    <tr className="style-grid-differ">
                                        <td></td>
                                        <td></td>
                                        <td>No records found</td>
                                        <td></td>
                                    </tr>
                                </div>
                            ) : (
                                getRobSplitDatas &&
                                getRobSplitDatas?.map((data: any, i: number) => (
                                    <div className="main-body-header-bunker" key={i}>
                                        <tr>
                                            <td style={{ width: "250px", textAlign: "left", paddingLeft: "15px" }} >{(data.Types)}</td>
                                            <td style={{ width: "100px", textAlign: "left", }}>{(data.tradeType)}</td>
                                            <td style={{ width: "70px", textAlign: "right", paddingRight: "15px" }}>{formatAmount(parseFloat(data.quantity).toFixed(2))}</td>
                                            <td style={{ width: "70px", textAlign: "right", paddingRight: "15px" }}>{formatAmount(parseFloat(data.amount).toFixed(2))}</td>
                                        </tr>
                                    </div>

                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className='overall-derivative-header' style={{ marginTop: "25px" }}>{`ROB`}</div>
                <div className="view-table-component-ch" style={{ top: "5px", overflowY: "auto" }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "250px", textAlign: "left", paddingLeft: "15px" }}>Types</th>
                                <th style={{ width: "100px", textAlign: "left", paddingLeft: "0px" }}>Trade Type</th>
                                <th style={{ width: "70px", textAlign: "right", paddingRight: "10px" }}>Quantity</th>
                                <th style={{ width: "70px", textAlign: "right", paddingRight: "10px" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bunkerData?.length === 0 ? (
                                <div className="main-body-header">
                                    <tr className="style-grid-differ">
                                        <td></td>
                                        <td></td>
                                        <td>No records found</td>
                                        <td></td>
                                    </tr>
                                </div>
                            ) : (
                                bunkerData &&
                                bunkerData?.map((data: any, i: number) => (
                                    <div className="main-body-header-bunker" key={i}>
                                        <tr>
                                            <td style={{ width: "250px", textAlign: "left", paddingLeft: "15px" }} >{(data.Types)}</td>
                                            <td style={{ width: "100px", textAlign: "left", }}>{(data.tradeType)}</td>
                                            <td style={{ width: "70px", textAlign: "right", paddingRight: "15px" }}>{formatAmount(parseFloat(data.quantity).toFixed(2))}</td>
                                            <td style={{ width: "70px", textAlign: "right", paddingRight: "15px" }}>{formatAmount(parseFloat(data.amount).toFixed(2))}</td>
                                        </tr>
                                    </div>

                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}