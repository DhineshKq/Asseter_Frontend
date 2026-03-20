import React, { useEffect, useRef, useState } from 'react'
import ButtonComponent from '../form-elements/button-component'
import { formatDateTimeAsSlash } from '../../../helpers/dateTimeFormaters';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import loginHeaderImage from "../../../assets/images/netbulk-logo.png";

import { useReactToPrint } from 'react-to-print';
import '../../../styles/modal/laytime-preview.scss'
import { Col, Row, Table } from 'react-bootstrap';


interface previewProps {
    // saveInvoice: () => void;
    hidePreview: (val: any) => void;
    // selectedInvoiceDetails: any
    // invoiceDetails: any
    // totalAmount: any
    // modeLocal: any
    previewDetails: any
    selectedVoiageDetails: any
}

export default function LayTimePreview({ selectedVoiageDetails, previewDetails, hidePreview }: previewProps) {
    const containerRef = useRef(null);
    const [printEnable, setPrintEnable] = useState<boolean>(false)

    const printPDF = () => {
        const input: any = containerRef.current;

        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width
            const pageHeight = 600; // A4 height
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('invoice.pdf');
            setPrintEnable(false)
        });
    };




    const componentLaytimeFunction = useReactToPrint({
        content: () => containerRef.current,
        documentTitle: "Laytime",
        pageStyle: `
            @page {
                size: portrait;
                margin: 0.1in; // Adjust margins as needed
            }
            @media print {
                .print-page {
                    width: 100%; /* Set the width to 100% */
                    page-break-after: always; /* Add page break after each page */
                }
            }
        `,
        onAfterPrint: () => {
            setPrintEnable(false);
        },
    });

    useEffect(() => {
        if (printEnable) {
            componentLaytimeFunction()
        }
    }, [printEnable, componentLaytimeFunction]);


    const formatAmount = (amount: any) => {
        if (amount && amount !== ".") {
            const onlyNumber: any = amount.toString().replace(/[^0-9.]/g, "");
            // Handle empty input
            if (onlyNumber === "") {
                return "";
            }
            // Split input into integer and decimal parts
            const parts = onlyNumber.split(".");
            const integerPart = parts[0];
            const decimalPart = parts[1] || "00";
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

    // useEffect(() => {
    //     console.log(previewDetails, "previewDetails", selectedVoiageDetails, "selectedVoiageDetails")

    // }, [])
    // console.log(selectedVoiageDetails?.vesselDetails?.laycanStart, selectedVoiageDetails?.laycanStart, "selectedVoiageDetails?.vesselDetails?.laycanStart")


    function formatMonthDate(isoDateTime: any) {
        // Convert ISO 8601 format to Date object
        const dateObject = new Date(isoDateTime);

        // Months array for formatting
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Format date
        const formattedDate = `${dateObject.getDate()} ${months[dateObject.getMonth()]} ${dateObject.getFullYear()} ${dateObject.getHours()}:${('0' + dateObject.getMinutes()).slice(-2)}`;

        return formattedDate;
    }
    function formatOnlyMonth(isoDateTime: any) {
        // Convert ISO 8601 format to Date object
        const dateObject = new Date(isoDateTime);

        // Months array for formatting
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Format date
        const formattedDate = `${dateObject.getDate()} ${months[dateObject.getMonth()]} ${dateObject.getFullYear()} `;

        return formattedDate;
    }
    // Function for Format the quantity value  --------------------------------------------->
    const formatAmountQuantity = (value: any) => {
        if (value && value !== ".") {
            const onlyNumber = value.toString().replace(/[^0-9.]/g, "");
            // Handle empty input
            if (onlyNumber === "") {
                return "";
            }
            // Split input into integer and decimal parts
            const parts = onlyNumber.split(".");
            const integerPart = parts[0];
            const decimalPart = parts[1] || "";
            // Format the integer part with commas
            const formattedInteger = parseFloat(integerPart).toLocaleString('en-IN');
            // Handle complete decimal input (e.g., "5000.50")
            if (decimalPart !== "") {
                return `${formattedInteger}.${decimalPart}`;
            }
            // Handle incomplete decimal input (e.g., "5000.")
            if (value.toString().endsWith(".")) {
                return `${formattedInteger}.`;
            }
            // Return formatted integer
            return formattedInteger;
        }
        return "";
    };


    return (



        <>

            <div className={"laytime-preview-modal"} style={printEnable ? { height: '100%', overflow: 'auto' } : {}}>
                <div className={"laytime-preview-container"} style={printEnable ? { height: '100%', boxShadow: "0px", } : { boxShadow: "0px 20px 30px #0055D44D " }}>

                    <div ref={containerRef}>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div className='laytime-netbulk-log'>
                                    <img
                                        src={loginHeaderImage}
                                        draggable={false}
                                        className="img-fluid netbulkLogo"
                                        alt="..."
                                    />
                                </div>
                                <div className='laytime-header'>
                                    {"LAYTIME STATEMENT"}
                                </div>
                            </div>
                            <div className='laytime-border-line'></div>

                            <div className='port-details-laytime'>
                                <div>{"- Prepared For"}</div>
                                <div>
                                    <b>
                                        {/* {"Tubarao (Loading), Brazil"} */}
                                        {`${previewDetails.portDetails.portName} (${previewDetails.portDetails.portaging}) , ${previewDetails.portDetails.country}`}
                                    </b>
                                </div>
                                <div>
                                    {previewDetails.portDetails.status === "Pending Approval" ? "Not Approved" : previewDetails.portDetails.status}
                                </div>
                            </div>

                        </div>
                        <div style={printEnable ? { height: '100%' } : { height: "670px", overflowY: "auto" }} >
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                                <div className='voyage-information-main'>
                                    <p className='Voyage-heading'>
                                        {"Voyage Information"}
                                    </p>
                                    <p style={{ marginLeft: "20px" }}>
                                        {"Netbulk Pte. Ltd."}
                                    </p>
                                    <div style={{ display: "flex", lineHeight: "30px" }}>

                                        <div className='voyageinfo-details'>
                                            <div className='rightside-details'>
                                                <p className='laytime-content'>{"Vessel"}</p>
                                                <p className='laytime-content'>{"Owner"}</p>
                                                <p className='laytime-content'>{"Charter"}</p>
                                                <p className='laytime-content'>{"Charter Party Date"}</p>
                                                <p className='laytime-content'>{"Voyage Number"}</p>
                                                <p className='laytime-content'>{"LAYCAN Start"}</p>
                                                <p className='laytime-content'>{"LAYCAN End"}</p>
                                                <p className='laytime-content'>{"NOR Date"}</p>
                                            </div>
                                            <div>
                                                <p className='laytime-content'>: {selectedVoiageDetails?.vesselDetails?.name}</p>
                                                <p className='laytime-content'>: {selectedVoiageDetails?.owner}</p>
                                                <p className='laytime-content'>: {selectedVoiageDetails?.charterer}</p>
                                                <p className='laytime-content'>: {formatOnlyMonth(selectedVoiageDetails?.cpDate)}</p>
                                                <p className='laytime-content'>: {selectedVoiageDetails?.voyageNo}</p>
                                                <p className='laytime-content'>: {formatMonthDate(selectedVoiageDetails?.laycanStart)}</p>
                                                <p className='laytime-content'>: {formatMonthDate(selectedVoiageDetails?.laycanEnd)}</p>
                                                <p className='laytime-content'>: {formatMonthDate(selectedVoiageDetails?.norDate)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='voyage-information-main'>
                                    <p className='Voyage-heading'>
                                        {"Cargo & Rates"}
                                    </p>

                                    <div style={{ display: "flex", lineHeight: "30px" }}>
                                        <div className='Cargo-details'>
                                            <div className='rightside-details'>
                                                <p className='laytime-content'>{"NOR Tendered"}</p>
                                                <p className='laytime-content'>{"NOR Accepted"}</p>
                                                <p className='laytime-content'>{"Loading Commenced"}</p>
                                                <p className='laytime-content'>{"Laytime Start"}</p>
                                                <p className='laytime-content'>{"Laytime End"}</p>
                                                <p className='laytime-content'>{"Demurrage Start"}</p>
                                                <p className='laytime-content'>{"Quantity"}</p>
                                                <p className='laytime-content'>{"Loading Rate"}</p>
                                                <p className='laytime-content'>{"TT Condition"}</p>
                                                <p className='laytime-content'>{"Turn Time"}</p>
                                                <p className='laytime-content'>{"Demurrage Rate"}</p>
                                                <p className='laytime-content'>{"Despatch Rate"}</p>
                                            </div>
                                            <div>
                                                <p className='laytime-content'>: {formatMonthDate(previewDetails.portDetails.norTendered)}</p>
                                                <p className='laytime-content'>: {formatMonthDate(previewDetails.portDetails.norAccepted)}</p>
                                                <p className='laytime-content'>: {formatMonthDate(previewDetails.portDetails.loadDiscCommenced)}</p>
                                                <p className='laytime-content'>: {formatMonthDate(previewDetails.portDetails.laytimeStatrt)}</p>
                                                <p className='laytime-content'>: {formatMonthDate(previewDetails.portDetails.laytimeEnd)}</p>
                                                <p className='laytime-content'>: {formatMonthDate(previewDetails.portDetails.demmurageStart)}</p>
                                                <p className='laytime-content'>: {formatAmount(previewDetails.portDetails.quantity)}</p>
                                                <p className='laytime-content'>: {`${formatAmount(previewDetails.portDetails.loadDisRate)} ${previewDetails.portDetails.loadDisRateUnit}`}</p>
                                                <p className='laytime-content'>: {previewDetails.portDetails.turnTimeCondition}</p>
                                                <p className='laytime-content'>: {`${previewDetails.portDetails.turnTime === "" ? "00 : 00" : previewDetails.portDetails.turnTime} ${previewDetails.portDetails.turnTimeUnit}`}</p>
                                                <p className='laytime-content'>: $ {formatAmount(previewDetails.portDetails.demmurageRate)}</p>
                                                <p className='laytime-content'>: $ {formatAmount(previewDetails.portDetails.despatchRate)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div>
                                <p className='deductions-preview'>
                                    {"Deductions"}
                                </p>
                                <Col sm={12} style={{
                                    backgroundColor: 'white', height: 'auto', overflow: 'auto'
                                }} className='laytime-dedutions-preview' >
                                    <Row className='laytime-dedutions-preview-sub' style={{ margin: '0px', gap: '10px' }} >

                                        <Col sm={12} className='laytime-dedutions-preview-table-wrapper' >
                                            <Table striped bordered hover size="sm" className='laytime-dedutions-preview-table'>
                                                <thead>
                                                    <tr className='heading-name'>
                                                        <th style={{ minWidth: "200px" }}>Description</th>
                                                        <th>Start Time</th>
                                                        <th>End Time</th>
                                                        <th>Duration (hh:mm)</th>
                                                        <th>Percentage (%)</th>
                                                        <th>Laytime (hh:mm)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewDetails.deductionDatas &&
                                                        previewDetails.deductionDatas.map((data: any, i: number) => (
                                                            <tr key={i} style={{ backgroundColor: "white" }}>

                                                                <td style={{ width: "200px", backgroundColor: "white" }} >{data.description}
                                                                </td>
                                                                <td style={{ width: "150px", }} >{data.startTime ? formatMonthDate(data.startTime) : ""}
                                                                </td>
                                                                <td style={{ width: "150px", }}  >{data.endTime ? formatMonthDate(data.endTime) : ""}
                                                                </td>
                                                                <td style={{ width: "110px", backgroundColor: "white", textAlign: "right", paddingRight: "30px" }} >{data.duration}
                                                                </td>
                                                                <td style={{ width: "130px", backgroundColor: "white", textAlign: "right", paddingRight: "50px" }} >{data.percentage}
                                                                </td>
                                                                <td style={{ width: "110px", backgroundColor: "white", textAlign: "right", paddingRight: "30px" }} >{data.laytime}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>

                                            </Table>
                                        </Col>
                                    </Row>
                                </Col>
                            </div>

                            <div style={{ display: "flex", marginTop: "20px" }}>
                                <div className='bottom-details'>
                                    <p className='laytime-content' >{"Time Allowed"}</p>
                                    <p className='laytime-content' >{"Time Used"}</p>
                                    <p className='laytime-content' >{"Time Deducted"}</p>
                                    <p className='laytime-content' >{"Time On Demurrage"}</p>
                                    <p className='laytime-content' > <b>
                                        {previewDetails.portDetails.despatch === "0.00" || previewDetails.portDetails.despatch === "0" ? "Net Demurrage" : "Net Despatch"}
                                    </b>
                                    </p>
                                </div>
                                <div>
                                    <p className='laytime-content'>: {previewDetails.portDetails.timeAllowedHr} {" (hh:mm)"}</p>
                                    <p className='laytime-content'>: {previewDetails.portDetails.timeUsedHr} {" (hh:mm)"}</p>
                                    <p className='laytime-content'>: {previewDetails.portDetails.timeDeductedHr} {" (hh:mm)"}</p>
                                    <p className='laytime-content'>: {previewDetails.portDetails.timeOnDemmurageHr} {" (hh:mm)"}</p>
                                    <p className='laytime-content'> <b>

                                        : ${(previewDetails.portDetails.despatch === "0.00") || (previewDetails.portDetails.despatch === "0") ? formatAmount(previewDetails.portDetails.demmurage) : formatAmount(previewDetails.portDetails.despatch)}
                                    </b>
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>



                    {
                        !printEnable &&
                        <div>
                            <div className='layTime-preview-footer'>

                                <div style={{ marginRight: "20px" }}>
                                    <ButtonComponent
                                        title={"Cancel"}
                                        height='45px'
                                        width='150px'
                                        backgroundColor='white'
                                        border='1px solid #295285'
                                        color='#295285'
                                        className={"button-component common-btn"}
                                        handleClick={() => {
                                            hidePreview(false)
                                        }}
                                    />
                                </div>
                                <div>
                                    <ButtonComponent
                                        title={"Print"}
                                        height='45px'
                                        width='150px'
                                        disabled={false}
                                        backgroundColor='#295285'
                                        color='white'
                                        className={"button-component common-btn"}
                                        handleClick={() => {
                                            setPrintEnable(true)

                                        }}

                                    />
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>

        </>
    )
}
