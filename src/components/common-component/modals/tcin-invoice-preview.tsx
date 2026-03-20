import React, { useEffect, useRef, useState } from 'react'
import "../../../styles/modal/invoice-preview.scss"
import ButtonComponent from '../form-elements/button-component'
import { formatDateTimeAsSlash } from '../../../helpers/dateTimeFormaters';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useReactToPrint } from 'react-to-print';
// import { ReactComponent as NetbulkLogo } from '../../../assets/icons/netbulk_logo.svg'
import { ReactComponent as NetbulkLogo } from '../../../assets/icons/netbulk_sv_logo-01.svg'

import DeclineModal from './decline-modal';
import { axiosPrivate } from '../../../middleware/axios-api';
import Alertbox from './alertbox-modal';
import Loading from './loading-screen';
import { useSelector } from 'react-redux';




interface previewProps {
    saveInvoice: () => void;
    hidePreview: (val: any) => void;
    selectedInvoiceDetails: any
    invoiceDetails: any
    totalAmount: any
    modeLocal: any
    viewLocal: any
    invoiceGrossAmount: any
    invoiceOtherValue: any
    offHireCostValues: any
    paymentsMadeValue: any
}

export default function TcinInvoicePreview({ saveInvoice, hidePreview, invoiceOtherValue, paymentsMadeValue, offHireCostValues, modeLocal, invoiceGrossAmount, viewLocal, selectedInvoiceDetails, totalAmount, invoiceDetails }: previewProps) {
    const containerRef = useRef(null);
    const [printEnable, setPrintEnable] = useState<boolean>(false)
    const [remarkModal, setRemarkModal] = useState(false);
    const [showType, setShowType] = useState("warning") // error message showType
    const [showMessage, setShowMessage] = useState<string>("") // error message showMessage
    const [showAlertBox, setShowAlertBox] = useState(false) // error message ShowAlertBox
    const [isLoading, setIsLoading] = useState(false)
    const [approval, setApproval] = useState({
        remark: "",
    })
    const Permission = useSelector((state: any) => state.Permission);
    const accessType = Permission?.accessType === "Read Only" ? true : false;
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

    const conponentPDFMaster: any = useRef()
    const conponentPDFMasterfunction = useReactToPrint({
        content: () => containerRef.current,
        documentTitle: "MasterData",
        pageStyle: `
            @page {
              size: potrait;
              margin: 0.5in; // Adjust margins as needed
            }
          `,
        onAfterPrint: () => {
            setPrintEnable(false);
        },
    });

    useEffect(() => {
        if (printEnable) {
            conponentPDFMasterfunction()
        }
    }, [printEnable, conponentPDFMasterfunction]);


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
    async function handleInvoiceApprovalSave(status: any) {
        try {
            const response: any = await axiosPrivate.patch(`approval/invoice/update/${selectedInvoiceDetails.vesselDetails.id}`, {
                "status": status,
                "type": selectedInvoiceDetails.vesselDetails.type,
                "remarks": approval.remark

            })
            if (response.status === 200) {
                setIsLoading(false)
                setShowAlertBox(true)
                setShowType('success')
                setShowMessage(response.data.message)
                setTimeout(() => {
                    setShowAlertBox(false)
                    hidePreview(false)
                    saveInvoice()
                }, 1000)
                // setLoadi
                // setLoading(false)
                // Alert("success", response?.data?.message, true, '');
                // setPageViewFun('grid', '')

            }
        }
        catch (error: any) {
            setShowAlertBox(true)
            setShowType('danger')
            setIsLoading(false)
            setShowMessage(error?.response?.data?.error)
            setTimeout(() => {
                setShowAlertBox(false)
                hidePreview(false)
                saveInvoice()
            }, 1000)
            // setShowAlertBox(true)
            // setShowType('danger')
            // setLoading(false)
            // setShowMessage(error?.response?.data?.error)
            // clearAlert("")
        };

    }
    return (

        <div ref={containerRef} className={"invoice-preview-modal"} style={printEnable ? { height: 'auto', overflow: 'auto' } : {}} >
            <div className={"invoice-preview-container"} style={printEnable ? { height: 'auto' } : {}}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <div className='invoice-header'>{"Hire Invoice"}</div>
                    <NetbulkLogo className='netbulk-logo' style={{ height: "60px" }} />
                </div>
                <div className={`details-container`} style={printEnable ? { height: 'auto' } : {}}>
                    <div className='bill-details'>
                        <div className='bill-from-address'>
                            <div>
                                <div className='bill-from-header'>{"Bill From"}</div>
                                <div className='bill-from-name'>{invoiceDetails.billFrom}</div>
                                <div style={{ paddingTop: "5px" }}>{invoiceDetails.billFromAddress}</div>
                            </div>
                            <div>
                                <div style={{ paddingTop: "10px" }} className='bill-from-header'>{"Bill To"}</div>
                                <div className='bill-from-name'>{invoiceDetails.billTo}</div>
                                <div style={{ paddingTop: "5px" }}>{invoiceDetails.billToAddress}</div>
                            </div>
                        </div>
                        <div className='bill-to-address'>
                            <div style={{ display: "flex" }}>
                                <div style={{ fontWeight: "500", width: "140px" }}>{"Invoice No"}</div>
                                <div>{`: ${invoiceDetails.invoiceNumber}`}</div>
                            </div>
                            <div style={{ display: "flex" }}>
                                <div style={{ fontWeight: "500", width: "140px" }}>{"Issue Date"}</div>
                                <div>{`: ${formatDate(invoiceDetails.issuedDate)}`}</div>
                            </div>
                            <div style={{ display: "flex" }}>
                                <div style={{ fontWeight: "500", width: "140px" }}>{"Due Date"}</div>
                                <div>{`: ${formatDate(invoiceDetails.dueDate)}`}</div>
                            </div>
                            <div style={{ display: "flex" }}>
                                <div style={{ fontWeight: "500", width: "140px" }}>{"Vessel"}</div>
                                <div>{`: ${selectedInvoiceDetails.vesselDetails.name}`}</div>
                            </div>
                            <div style={{ display: "flex" }}>
                                <div style={{ fontWeight: "500", width: "140px" }}>{"Voyage No"}</div>
                                <div>{`: ${selectedInvoiceDetails.voyageNo}`}</div>
                            </div>

                        </div>
                    </div>
                    <div className='description-amount'>
                        <div className='invoice-description'>{"Description"}</div>
                        <div className='invoice-amount'>
                            {"Amount ($)"}
                        </div>
                    </div>
                    {/* <div className='invoice-description-value'>
                        {invoiceGrossAmount.reduce((x: any, dec: any, i: number) => {
                            console.log(dec.invoiceDescription)
                            return x += `${i !== 0 ? "," : ""} ${dec.invoiceDescription}`
                        }, '')

                        }
                        {invoiceGrossAmount.reduce((x: any, dec: any, i: number) => {
                            console.log(dec.invoiceDescription);
                            const description = dec.invoiceDescription.split('Qty:');
                            const formattedDescription = `${description[0]} Qty:${description[1]}\n`;
                            return x += `${i !== 0 ? "," : ""} ${formattedDescription}`;
                        }, '')}

                    </div>  */}

                    <div className='tcin-amount-values'>
                        <div className='hire-period-main'>
                            <div className='hire-period-datas'>
                                {invoiceGrossAmount.map((data: any, i: number) => {
                                    return (
                                        <div key={i} style={{ paddingBottom: "10px" }}>
                                            <p style={{ margin: "0px" }}>{`Description: ${data.invoiceDescription}`}</p>
                                            <p style={{ margin: "0px" }}>{`Hire Period: ${formatDate(data.hireFromDate)} To ${formatDate(data.hireToDate)}`}</p>
                                            <p style={{ margin: "0px" }}>{`No of days: ${formatAmount(data.hireDays)}`}</p>
                                            <p style={{ margin: "0px" }}> {`Rate: $ ${formatAmount(data.hireRate)} / Day`}</p>
                                        </div>
                                    )

                                })}
                            </div>
                            <div className='hire-period-total'>
                                {invoiceGrossAmount.map((data: any, i: number) => {
                                    return (
                                        <div key={i}>
                                            {
                                                <div style={{ paddingBottom: "45px" }}>
                                                    {`$ ${formatAmount(data.hireTotalAmount)}`}
                                                </div>

                                            }
                                        </div>
                                    )

                                })}
                            </div>
                        </div>
                        <div className='add-comm-main' style={{ display: "flex" }}>
                            <div className='add-comm-datas'>
                                {(invoiceDetails.grossBallastAmount && invoiceDetails.grossBallastAmount != 0) &&
                                    <div style={{ display: "flex", paddingTop: "10px" }}>
                                        <div style={{ width: "200px" }}>{"Gross Ballast Bonus"}</div>
                                    </div>
                                }
                            </div>
                            <div className='add-comm-total'>
                                {(invoiceDetails.grossBallastAmount && invoiceDetails.grossBallastAmount != 0) &&
                                    <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{`$ ${formatAmount(invoiceDetails.grossBallastAmount)}`}</div>
                                }
                            </div>
                        </div>
                        <div className='add-comm-main' style={{ display: "flex" }}>
                            <div className='add-comm-datas'>
                                {(invoiceDetails.commissionTotalAmount && invoiceDetails.commissionTotalAmount != 0) &&
                                    <div style={{ display: "flex", paddingTop: "10px" }}>
                                        <div style={{ width: "200px" }}>{"Add Comm"}</div>
                                        <div>{invoiceDetails.commissionType === "%" ? `${formatAmount(invoiceDetails.commissionPercentage)} %` : formatAmount(invoiceDetails.commissionPercentage)}</div>
                                    </div>
                                }
                            </div>
                            <div className='add-comm-total'>
                                {(invoiceDetails.commissionTotalAmount && invoiceDetails.commissionTotalAmount != 0) &&
                                    <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{`($ ${formatAmount(invoiceDetails.commissionTotalAmount)})`}</div>
                                }
                            </div>
                        </div>
                        <div className='add-comm-main' style={{ display: "flex" }}>
                            <div className='add-comm-datas'>
                                {(invoiceDetails.brokageCommissionTotal && invoiceDetails.brokageCommissionTotal != 0) &&
                                    <div style={{ display: "flex", paddingTop: "10px" }}>
                                        <div style={{ width: "200px" }}>{"Brokerage Comm"}</div>
                                        <div>{invoiceDetails.brokageCommissionType === "%" ? `${formatAmount(invoiceDetails.brokageCommissionPercentage)} %` : formatAmount(invoiceDetails.brokageCommissionPercentage)}</div>
                                    </div>
                                }
                            </div>
                            <div className='add-comm-total'>
                                {(invoiceDetails.brokageCommissionTotal && invoiceDetails.brokageCommissionTotal != 0) &&
                                    <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{`($ ${formatAmount(invoiceDetails.brokageCommissionTotal)})`}</div>
                                }
                            </div>
                        </div>
                        {(invoiceDetails.hireSurveyAmount && invoiceDetails.hireSurveyAmount > 0) &&
                            <>
                                <div className='add-comm-main' style={{ display: "flex" }}>
                                    <div className='add-comm-datas'>
                                        {(invoiceDetails.hireSurveyAmount && invoiceDetails.hireSurveyAmount > 0) &&
                                            <div style={{ display: "flex", paddingTop: "10px" }}>
                                                <div style={{ width: "200px" }}>{"On Hire Survey"}</div>
                                            </div>
                                        }
                                    </div>
                                    <div className='add-comm-total'>
                                        {(invoiceDetails.hireSurveyAmount && invoiceDetails.hireSurveyAmount > 0) &&
                                            <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{`$ ${formatAmount(invoiceDetails.hireSurveyAmount)}`}</div>
                                        }
                                    </div>
                                </div>
                            </>
                        }
                        <div className='cve-period-main'>
                            {(invoiceDetails.cveTotalAmount && invoiceDetails.cveTotalAmount > 0) &&
                                <div className='cve-period-datas'>
                                    <div>
                                        <p style={{ margin: "0px" }}>{`CVE: ${formatDate(invoiceDetails.cveFromDate)} To ${formatDate(invoiceDetails.cveToDate)}`}</p>
                                        <p style={{ margin: "0px" }}>{`No of days: ${formatAmount(invoiceDetails.cveDays)}`}</p>
                                        <p style={{ margin: "0px" }}> {`Rate: $ ${formatAmount(invoiceDetails.cveRate)} / Day`}</p>
                                    </div>

                                </div>
                            }
                            {(invoiceDetails.cveTotalAmount && invoiceDetails.cveTotalAmount > 0) &&
                                <div className='cve-period-total'>
                                    <div>
                                        <div style={{ paddingTop: "45px" }}>
                                            {`$ ${formatAmount(invoiceDetails.cveTotalAmount)}`}
                                        </div>

                                    </div>

                                </div>
                            }
                        </div>

                        {(invoiceDetails.bunkerConsumedtotalAmount && invoiceDetails.bunkerConsumedtotalAmount > 0) &&
                            <div className='bunker-consume-main'>
                                <div className='bunker-consume-datas'>
                                    <div style={{ fontWeight: "500", paddingTop: "10px" }}>{"Bunker Consumed"}</div>
                                    {(invoiceDetails.bunkerConsumeVlsfoPrice && invoiceDetails.bunkerConsumeVlsfoPrice > 0) &&
                                        <div style={{ paddingTop: "10px" }}>{`VLSFO: $ ${formatAmount(invoiceDetails.bunkerConsumeVlsfoPrice)} @ ${formatAmount(invoiceDetails.bunkerConsumeVlsfoQuantity)}`}</div>
                                    }
                                    {(invoiceDetails.bunkerConsumeLsmgoPrice && invoiceDetails.bunkerConsumeLsmgoPrice > 0) &&
                                        <div style={{ paddingTop: "10px" }}>{`LSGMO: $ ${formatAmount(invoiceDetails.bunkerConsumeLsmgoPrice)} @ ${formatAmount(invoiceDetails.bunkerConsumeLsmgoQuantity)}`}</div>
                                    }
                                    {(invoiceDetails.bunkerConsumeHfoPrice && invoiceDetails.bunkerConsumeHfoPrice > 0) &&

                                        <div style={{ paddingTop: "10px" }}>{`HSFO: $ ${formatAmount(invoiceDetails.bunkerConsumeHfoPrice)} @ ${formatAmount(invoiceDetails.bunkerConsumeHfoQuantity)}`}</div>
                                    }
                                </div>
                                <div className='bunker-consume-total' style={{ gap: "10px" }}>
                                    <div>{`$ ${formatAmount((parseFloat(invoiceDetails.bunkerConsumeVlsfoPrice) * parseFloat(invoiceDetails.bunkerConsumeVlsfoQuantity)).toFixed(2))}`}</div>
                                    <div>{`$ ${formatAmount((parseFloat(invoiceDetails.bunkerConsumeLsmgoPrice) * parseFloat(invoiceDetails.bunkerConsumeLsmgoQuantity)).toFixed(2))}`}</div>
                                    <div>{`$ ${formatAmount((parseFloat(invoiceDetails.bunkerConsumeHfoPrice) * parseFloat(invoiceDetails.bunkerConsumeHfoQuantity)).toFixed(2))}`}</div>
                                    {/* <div>{`$ ${formatAmount(invoiceDetails.bunkerConsumedtotalAmount)}`}</div> */}
                                </div>
                            </div>
                        }
                        {(invoiceDetails.bunkerOnDeliverytotalAmount && invoiceDetails.bunkerOnDeliverytotalAmount > 0) &&
                            <div className='bunker-consume-main'>
                                <div className='bunker-consume-datas'>
                                    <div style={{ fontWeight: "500", paddingTop: "10px" }}>{"Bunker On Delivery"}</div>
                                    {(invoiceDetails.bunkerOnDeliveryVlsfoPrice && invoiceDetails.bunkerOnDeliveryVlsfoPrice > 0) &&
                                        <div style={{ paddingTop: "10px" }}>{`VLSFO: $ ${formatAmount(invoiceDetails.bunkerOnDeliveryVlsfoPrice)} @ ${formatAmount(invoiceDetails.bunkerOnDeliveryVlsfoQuantity)}`}</div>
                                    }
                                    {(invoiceDetails.bunkerOnDeliveryLsmgoPrice && invoiceDetails.bunkerOnDeliveryLsmgoPrice > 0) &&
                                        <div style={{ paddingTop: "10px" }}>{`LSGMO:$ ${formatAmount(invoiceDetails.bunkerOnDeliveryLsmgoPrice)} @ ${formatAmount(invoiceDetails.bunkerOnDeliveryLsmgoQuantity)}`}</div>
                                    }
                                    {(invoiceDetails.bunkerOnDeliveryHfoPrice && invoiceDetails.bunkerOnDeliveryHfoPrice > 0) &&
                                        <div style={{ paddingTop: "10px" }}>{`HSFO: $ ${formatAmount(invoiceDetails.bunkerOnDeliveryHfoPrice)} @ ${formatAmount(invoiceDetails.bunkerOnDeliveryHfoQuantity)}`}</div>
                                    }
                                </div>
                                <div className='bunker-consume-total' style={{ gap: "10px" }}>
                                    <div>{`$ ${formatAmount((parseFloat(invoiceDetails.bunkerOnDeliveryVlsfoPrice) * parseFloat(invoiceDetails.bunkerOnDeliveryVlsfoQuantity)).toFixed(2))}`}</div>
                                    <div>{`$ ${formatAmount((parseFloat(invoiceDetails.bunkerOnDeliveryLsmgoPrice) * parseFloat(invoiceDetails.bunkerOnDeliveryLsmgoQuantity)).toFixed(2))}`}</div>
                                    <div>{`$ ${formatAmount((parseFloat(invoiceDetails.bunkerOnDeliveryHfoPrice) * parseFloat(invoiceDetails.bunkerOnDeliveryHfoQuantity)).toFixed(2))}`}</div>
                                </div>
                            </div>
                        }
                        {(invoiceDetails.bunkerOnReDeliverytotalAmount && invoiceDetails.bunkerOnReDeliverytotalAmount > 0) &&
                            <div className='bunker-consume-main'>
                                <div className='bunker-consume-datas'>
                                    <div style={{ fontWeight: "500", paddingTop: "10px" }}>{"Bunker On Re-Delivery"}</div>
                                    {(invoiceDetails.bunkerOnReDeliveryVlsfoPrice && invoiceDetails.bunkerOnReDeliveryVlsfoPrice > 0) &&
                                        <div style={{ paddingTop: "10px" }}>{`VLSFO: $ ${formatAmount(invoiceDetails.bunkerOnReDeliveryVlsfoPrice)} @ ${formatAmount(invoiceDetails.bunkerOnReDeliveryVlsfoQuantity)}`}</div>
                                    }
                                    {(invoiceDetails.bunkerOnReDeliveryLsmgoPrice && invoiceDetails.bunkerOnReDeliveryLsmgoPrice > 0) &&

                                        <div style={{ paddingTop: "10px" }}>{`LSGMO: $ ${formatAmount(invoiceDetails.bunkerOnReDeliveryLsmgoPrice)} @ ${formatAmount(invoiceDetails.bunkerOnReDeliveryLsmgoQuantity)}`}</div>
                                    }
                                    {(invoiceDetails.bunkerOnReDeliveryHfoPrice && invoiceDetails.bunkerOnReDeliveryHfoPrice > 0) &&
                                        <div style={{ paddingTop: "10px" }}>{`HSFO: $ ${formatAmount(invoiceDetails.bunkerOnReDeliveryHfoPrice)} @ ${formatAmount(invoiceDetails.bunkerOnReDeliveryHfoQuantity)}`}</div>
                                    }
                                </div>
                                <div className='bunker-consume-total' style={{ gap: "10px" }}>
                                    <div>{`$ ${formatAmount((parseFloat(invoiceDetails.bunkerOnReDeliveryVlsfoPrice) * parseFloat(invoiceDetails.bunkerOnReDeliveryVlsfoQuantity)).toFixed(2))}`}</div>
                                    <div>{`$ ${formatAmount((parseFloat(invoiceDetails.bunkerOnReDeliveryLsmgoPrice) * parseFloat(invoiceDetails.bunkerOnReDeliveryLsmgoQuantity)).toFixed(2))}`}</div>
                                    <div>{`$ ${formatAmount((parseFloat(invoiceDetails.bunkerOnReDeliveryHfoPrice) * parseFloat(invoiceDetails.bunkerOnReDeliveryHfoQuantity)).toFixed(2))}`}</div>
                                </div>
                            </div>
                        }
                        {invoiceOtherValue.map((data: any, i: number) => {
                            return (
                                data.amount && data.amount != 0 && (
                                    <div className='other-amount-main'>
                                        <div className='other-amount-datas'>
                                            <div key={i}>
                                                {`${data.label}`}
                                            </div>

                                        </div>
                                        <div className='other-amount-total'>
                                            <div key={i}>
                                                {data.amount < 0 ? `($ ${formatAmount((-data.amount))})` : `$ ${formatAmount(data.amount)}`}

                                            </div>
                                        </div>
                                    </div>
                                )
                            )
                        })}
                        {offHireCostValues.map((data: any, i: number) => {
                            return (
                                (data.offHireTotalAmount > 0 || data.offHireAddCommissionTotal > 0 || data.offHireCveTotal > 0 || data.offHireBunkerTotal > 0) && (
                                    <div className='hire-period-main'>
                                        <div className='hire-period-datas'>
                                            <div key={i}>
                                                <div style={{ fontWeight: "500", paddingTop: "10px" }}>{"Off Hire Cost"}</div>
                                                {
                                                    (data.offHireTotalAmount && data.offHireTotalAmount > 0) &&
                                                    <>

                                                        <div style={{ paddingTop: "10px" }}>{`Off Hire Period: ${formatDate(data.offHireFromDate)} To ${formatDate(data.offHireToDate)}`}</div>
                                                        <div>{`No of days: ${formatAmount(data.offHireDays)}`}</div>
                                                        <div> {`Rate: $ ${formatAmount(data.offHireRate)} / Day`}</div>
                                                        <div> {`Deduction: ${formatAmount(data.offHireDeduction)} %`}</div>
                                                    </>
                                                }
                                                {
                                                    (data.offHireAddCommissionTotal && data.offHireAddCommissionTotal > 0) &&
                                                    <div style={{ display: "flex", paddingTop: "10px", gap: "30px" }}>
                                                        <div>{"Add Comm"}</div>
                                                        <div>{data.offHireAddCommissionType === "%" ? `${formatAmount(data.offHireAddCommission)}%` : `${formatAmount(data.offHireAddCommission)}`}</div>
                                                    </div>
                                                }
                                                {(data.offHireCveTotal && data.offHireCveTotal > 0) &&

                                                    <div style={{ paddingTop: "10px" }}>{`CVE: No of days: ${formatAmount(data.offHireCveDays)}, Rate: $ ${formatAmount(data.offHireCveRate)} / Day`}</div>
                                                }
                                                {(data.offHireBunkerTotal && data.offHireBunkerTotal > 0) &&
                                                    <>
                                                        <div style={{ paddingTop: "30px", fontWeight: "500" }}>{"Off Hire Bunker Consumed"}</div>
                                                        {(data.offHireVlsfoRate && data.offHireVlsfoRate > 0) &&

                                                            <div style={{ paddingTop: "10px" }}>{`VLSFO: $ ${formatAmount(data.offHireVlsfoRate)} @ ${formatAmount(data.offHireVlsfoQuantity)}`}</div>
                                                        }
                                                        {(data.offHireLsmgoRate && data.offHireLsmgoRate > 0) &&

                                                            <div style={{ paddingTop: "10px" }}>{`LSGMO: $ ${formatAmount(data.offHireLsmgoRate)} @ ${formatAmount(data.offHireLsmgoQuantity)}`}</div>
                                                        }
                                                        {(data.offHireHfoRate && data.offHireHfoRate > 0) &&

                                                            <div style={{ paddingTop: "10px" }}>{`HSFO: $ ${formatAmount(data.offHireHfoRate)} @ ${formatAmount(data.offHireHfoQuantity)}`}</div>
                                                        }
                                                    </>
                                                }
                                            </div>
                                        </div>
                                        <div className='hire-period-total' key={i}>

                                            {
                                                (data.offHireTotalAmount && data.offHireTotalAmount > 0) &&
                                                <div>{`($ ${formatAmount(data.offHireTotalAmount)})`}</div>
                                            }
                                            {
                                                (data.offHireAddCommissionTotal && data.offHireAddCommissionTotal > 0) &&
                                                <div style={{ paddingTop: "10px" }}>{`$ ${formatAmount(data.offHireAddCommissionTotal)}`}</div>
                                            }
                                            {(data.offHireCveTotal && data.offHireCveTotal > 0) &&

                                                <div style={{ paddingTop: "35px" }}>{`($ ${formatAmount(data.offHireCveTotal)})`}</div>
                                            }
                                            {(data.offHireBunkerTotal && data.offHireBunkerTotal > 0) &&
                                                <div style={{ height: "108px", paddingTop: "73px" }}>{`($ ${formatAmount((parseFloat(data?.offHireVlsfoRate) * parseFloat(data?.offHireVlsfoQuantity)).toFixed(2))})`}</div>
                                            }
                                            {(data.offHireBunkerTotal && data.offHireBunkerTotal > 0) &&
                                                <div style={{ height: "30px" }}>{`($ ${formatAmount((parseFloat(data?.offHireLsmgoRate) * parseFloat(data?.offHireLsmgoQuantity)).toFixed(2))})`}</div>
                                            }
                                            {(data.offHireBunkerTotal && data.offHireBunkerTotal > 0) &&
                                                <div style={{ height: "30px" }}>{`($ ${formatAmount((parseFloat(data?.offHireHfoRate) * parseFloat(data?.offHireHfoQuantity)).toFixed(2))})`}</div>
                                            }

                                        </div>
                                    </div>
                                ))
                        })}

                        {paymentsMadeValue.map((data: any, i: number) => {
                            return (
                                data.amount && data.amount != 0 && (
                                    <div className='other-amount-main'>
                                        <div className='other-amount-datas'>
                                            <div key={i}>
                                                <div style={{ fontWeight: "500" }}>{"Payments Made"}</div>
                                                {`${data.label}`}
                                            </div>

                                        </div>
                                        <div className='other-amount-total'>
                                            <div key={i}>
                                                {`($ ${formatAmount(data.amount)})`}

                                            </div>
                                        </div>
                                    </div>
                                )
                            )
                        })}
                    </div>
                    <div className='invoice-total-amount'>
                        <div className='total'>{"Total"}</div>
                        <div className='amount'>{`$ ${formatAmount(totalAmount)}`}</div>
                        {/* <div className='amount'>{`$ ${totalAmount < 0 ? '-' : ''}${formatAmount(Math.abs(parseFloat(totalAmount)))}`}</div> */}

                    </div>
                </div>

                <div className='preview-notes'>{"Note: This invoice is computer-generated, so no signature is required"}</div>
                <div className='nb-email'>{"info@nbbbytes.com"}</div>
                {
                    !printEnable &&
                    <div className='invoice-form-footer'>
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
                                    // setViewLocal("invoiceGrid")
                                    hidePreview(false)
                                }}
                            />
                        </div>
                        {
                            <div>
                                {viewLocal === "invoiceForm" &&

                                    <ButtonComponent
                                        title={modeLocal === "edit" ? "Update" : "Save"}
                                        height='45px'
                                        width='150px'
                                        backgroundColor='#295285'
                                        color='white'
                                        className={"button-component common-btn"}
                                        handleClick={() => {
                                            saveInvoice()
                                        }}
                                    />
                                }
                                {viewLocal === "invoiceGrid" &&
                                    <ButtonComponent
                                        title={"Print"}
                                        height='45px'
                                        width='150px'
                                        backgroundColor='#295285'
                                        color='white'
                                        className={"button-component common-btn"}
                                        handleClick={() => {
                                            // saveInvoice()
                                            // printPDF()
                                            setPrintEnable(true)


                                        }}
                                    />
                                }
                            </div>
                        }
                        {
                            <div style={{ display: "flex", gap: "20px" }}>
                                {viewLocal === "Approval" &&

                                    <ButtonComponent
                                        title={"Decline"}
                                        height='45px'
                                        width='150px'
                                        backgroundColor='#295285'
                                        color='white'
                                        className={accessType ? "button-component-hover disabled" : "button-component common-btn"}
                                        handleClick={() => {
                                            // saveInvoice()
                                            setRemarkModal(true)
                                        }}
                                    />
                                }
                                {viewLocal === "Approval" &&
                                    <ButtonComponent
                                        title={"Approve"}
                                        height='45px'
                                        width='150px'
                                        backgroundColor='#295285'
                                        color='white'
                                        className={accessType ? "button-component-hover disabled" : "button-component common-btn"}

                                        // className={"button-component common-btn"}
                                        handleClick={() => {
                                            // saveInvoice()
                                            // printPDF()
                                            // setPrintEnable(true)
                                            setApproval({
                                                ...approval,
                                                remark: ""
                                            })


                                            handleInvoiceApprovalSave("Approved")
                                        }}
                                    />
                                }
                            </div>
                        }

                    </div>
                }
            </div>
            {
                showAlertBox &&
                <div className='alert-warp'>
                    <Alertbox type={showType} message={showMessage} />
                </div>

            }
            {
                isLoading &&
                <div>
                    <Loading />
                </div>
            }
            {
                remarkModal &&
                <DeclineModal
                    remarkValue={approval.remark}
                    hideModal={(value) => {
                        setRemarkModal(value)
                        setApproval({
                            remark: "",

                        })
                    }}
                    remarkFun={(value) => {
                        setApproval({
                            ...approval,
                            remark: value
                        })
                    }}
                    submitFun={() => {
                        handleInvoiceApprovalSave("Declined")

                    }}
                />
            }
        </div>
    )
}
