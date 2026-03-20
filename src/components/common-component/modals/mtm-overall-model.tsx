
import { RxCross1 } from 'react-icons/rx';
import '../../../styles/modal/overall-position-mtm.scss';
import { Table } from 'react-bootstrap';
interface Props {
    // headerName: any;
    // physicalModalData: any;
    // dummyData?: any;
    // setPhysicalRowData: any;
    hideModal: (boolean: any) => void
    derivativeData: any
    derivativeHeader: any
    isRealised?: any
}

export default function MtmOverallDerivativePosition({ hideModal, derivativeHeader, isRealised, derivativeData }: Props) {
    console.log(derivativeData)
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

            // Check if the number is negative
            const isNegative = amount < 0;

            // Handle complete decimal input (e.g., "5000.50")
            if (decimalPart !== "") {
                const formattedDecimal = `.${decimalPart}`;
                return isNegative ? `(${formattedInteger.toString().slice(1)}${formattedDecimal})` : `${formattedInteger}${formattedDecimal}`;
            }

            // Handle incomplete decimal input (e.g., "5000.")
            if (amount.toString().endsWith(".")) {
                return isNegative ? `(${formattedInteger.toString().slice(1)}.)` : `${formattedInteger}.`;
            }

            // Return formatted integer with brackets for negative values, without the minus symbol
            return isNegative ? `(${formattedInteger.toString().slice(1)})` : formattedInteger;
        }
        return "";
    };
    console.log(derivativeHeader)
    return (
        <div className='mtm-overall-derivative-modal'>
            <div className='mtm-overall-derivative-container'>
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
                    <div className='overall-derivative-header'>{derivativeHeader}</div>
                </div>
                <div style={{ marginTop: "12px", maxHeight: "90%", maxWidth: "100%", overflow: "auto" }} className='mtm-dedutions-table-wrapper' >
                    <Table striped bordered hover size="sm" className='mtm-dedutions-table'>
                        <thead style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1 }}>
                            <tr>
                                <th style={{ width: "100px", paddingLeft: "10px" }}>Buy / Sell</th>
                                <th style={{ width: "200px" }}>Counter Party</th>
                                <th style={{ width: "120px" }}>Product</th>
                                <th style={{ width: "120px" }}>Period</th>
                                <th style={{ width: "150px" }}>Date</th>
                                <th style={{ textAlign: "end", width: "150px" }}>
                                    {(derivativeHeader === "Voyage Component - Overall" || derivativeHeader === "Derivative (Fuel Oil) - Overall") ? "Quantity (mt)" : "Quantity (Days)"}
                                </th>
                                <th style={{ textAlign: "end", paddingRight: "50px", width: "200px" }}>Price ($)</th>
                                <th style={{ width: "200px" }}>Broker Name</th>
                                <th style={{ width: "200px", textAlign: "end" }}>{derivativeHeader === "Derivative (Fuel Oil) - Overall" ? "Broker Commission" : "Broker Commission %"}</th>
                                <th style={{ textAlign: "end", paddingRight: "10px", width: "200px" }}>Value ($)</th>
                                {!isRealised &&
                                    <>
                                        <th style={{ textAlign: "end" }}>Index Value</th>
                                        <th style={{ textAlign: "end", paddingRight: "10px" }}>MTM P&L</th>
                                    </>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {derivativeData && derivativeData.length > 0 ? (
                                derivativeData.map((e: any, i: any) => (
                                    <tr key={i}>
                                        <td style={{ width: "100px", paddingLeft: "10px" }}>{e.buyShell}</td>
                                        <td style={{ width: "200px" }}>{e.counterParty}</td>
                                        <td style={{ width: "120px" }}>{e.product}</td>
                                        <td style={{ width: "120px" }}>{e.period}</td>
                                        <td style={{ width: "150px" }}>{formatDate(e.date)}</td>
                                        <td style={{ textAlign: "right", width: "150px" }}>{e.buyShell == "Buy" ? `${formatAmount(e.quantity)}` : `-${formatAmount(e.quantity)}`}</td>
                                        <td style={{ textAlign: "right", paddingRight: "50px", width: "200px" }}>{e.price == "NaN" ? "0.00" : formatAmount(e.price)}</td>
                                        <td style={{ width: "200px" }}>{e.brokerName || "-"}</td>
                                        <td style={{ width: "200px", textAlign: "end" }}>{e.brokerCommission || "-"}</td>
                                        <td style={{ textAlign: "right", paddingRight: "10px", width: "200px" }}>{formatAmount(e.value)||(0).toFixed(2)}</td>
                                        {!isRealised &&
                                            <>
                                                <td style={{ textAlign: "right" }}>{formatAmount(e.indexValue)}</td>
                                                <td style={{ textAlign: "right", paddingRight: "10px" }}>{formatAmount(e["p&l"])}</td>
                                            </>
                                        }
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={12} style={{ textAlign: "center" }}>No Records to Show</td>
                                </tr>
                            )}
                        </tbody>


                    </Table>
                </div>
            </div>
        </div>
    )
}