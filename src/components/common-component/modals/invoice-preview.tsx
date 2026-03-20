import React, { useEffect, useRef, useState } from 'react'
import "../../../styles/modal/invoice-preview.scss"
import ButtonComponent from '../form-elements/button-component'
import { formatDateTimeAsSlash } from '../../../helpers/dateTimeFormaters';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useReactToPrint } from 'react-to-print';
// import { ReactComponent as NetbulkLogo } from '../../../assets/icons/netbulk_logo.svg'
import { ReactComponent as NetbulkLogo } from '../../../assets/icons/netbulk_sv_logo-01.svg'
import { axiosPrivate } from '../../../middleware/axios-api';
import DeclineModal from './decline-modal';
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
}

export default function InvoicePreview({ saveInvoice, hidePreview, invoiceOtherValue, modeLocal, invoiceGrossAmount, viewLocal, selectedInvoiceDetails, totalAmount, invoiceDetails }: previewProps) {
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
        };

    }
    return (

        <div ref={containerRef} className={"invoice-preview-modal"} style={printEnable ? { height: 'auto', overflow: 'auto' } : {}} >
            <div className={"invoice-preview-container"} style={printEnable ? { height: 'auto' } : {}}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                    <div className='invoice-header'>{"Freight Invoice"}</div>
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
                            <div style={{ display: "flex" }}>
                                <div style={{ fontWeight: "500", width: "140px" }}>{"Cargo"}</div>
                                <div>{`: ${invoiceDetails.cargoName}`}</div>
                            </div>
                            <div style={{ display: "flex" }}>
                                <div style={{ fontWeight: "500", width: "140px" }}>{"Load Port"}</div>
                                <div>{`: ${invoiceDetails.loading}`}</div>
                            </div>
                            <div style={{ display: "flex" }}>
                                <div style={{ fontWeight: "500", width: "140px" }}>{"Discharge Port"}</div>
                                <div>{`: ${invoiceDetails.discharge ? invoiceDetails.discharge : ""}`}</div>
                            </div>
                        </div>
                    </div>
                    <div className='description-amount'>
                        <div className='invoice-description'>{"Description"}</div>
                        <div className='invoice-amount'>
                            {"Amount ($)"}
                        </div>
                    </div>
                    <div className='invoice-description-value'>
                        {invoiceGrossAmount.reduce((x: any, dec: any, i: number) => {
                            return x += `${i !== 0 ? "," : ""} ${dec.invoiceDescription}`
                        }, '')

                        }
                        {/* {invoiceGrossAmount.reduce((x: any, dec: any, i: number) => {
                            console.log(dec.invoiceDescription);
                            const description = dec.invoiceDescription.split('Qty:');
                            const formattedDescription = `${description[0]} Qty:${description[1]}\n`;
                            return x += `${i !== 0 ? "," : ""} ${formattedDescription}`;
                        }, '')} */}

                    </div>

                    <div className='amount-values'>
                        <div className='freight-percentage'>

                            <div style={{ paddingTop: "5px", paddingBottom: "10px", paddingLeft: "10px" }}>
                                {invoiceGrossAmount.map((data: any, i: number) => {
                                    return (
                                        <div key={i}>
                                            {data.values.map((x: any, index: number) => {
                                                return (
                                                    <div key={index} style={{ paddingTop: "10px" }}>
                                                        {`${invoiceGrossAmount[0].values[0].freightPercentage} % Freight: ${formatAmount(x.freightCargoQuantity)} MT @ $${formatAmount(x.freightRate)} / MT`}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                    //   data.values.map((x: any) => {
                                    //         console.log(x, "x")
                                    //         // return (`${x.freightPercentage} % Freight: ${x.freightCargoQuantity} MT @ $${x.freightRate} / MT`)

                                    //     })
                                })}
                            </div>
                            {(invoiceDetails.commissionTotalAmount && invoiceDetails.commissionTotalAmount != 0) &&
                                <div style={{ display: "flex", paddingTop: "10px", paddingLeft: "10px" }}>
                                    <div style={{ width: "200px" }}>{"Add Comm"}</div>
                                    <div>{formatAmount(invoiceDetails.commissionPercentage)}</div>
                                </div>
                            }
                            {(invoiceDetails.brokageCommissionTotal && invoiceDetails.brokageCommissionTotal != 0) &&

                                <div style={{ display: "flex", paddingTop: "10px", paddingLeft: "10px" }}>
                                    <div style={{ width: "200px" }}>{"Brokerage Comm"}</div>
                                    <div>{formatAmount(invoiceDetails.brokageCommissionPercentage)}</div>
                                </div>
                            }
                            {/* invoiceDetails.demmurageAmount !== "0" || invoiceDetails.demmurageAmount !== 0 || invoiceDetails.demmurageAmount !== "" */}

                            {(invoiceDetails.demmurageAmount && invoiceDetails.demmurageAmount != 0) &&
                                <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{"Demurrage Amount"}</div>
                            }
                            {(invoiceDetails.dispatchAmount && invoiceDetails.dispatchAmount != 0) &&
                                <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{"Despatch Amount"}</div>
                            }
                            {(invoiceDetails.miscellaneousAmount && invoiceDetails.miscellaneousAmount != 0) &&
                                <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{"Miscellaneous Amount"}</div>
                            }
                            {(invoiceDetails.otherExtraAmount && invoiceDetails.otherExtraAmount != 0) &&
                                <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{"Other Amount"}</div>
                            }
                            {invoiceOtherValue.map((data: any, i: number) => {
                                return (
                                    data.amount && data.amount != 0 && (
                                        <div key={i}>
                                            <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>
                                                {`${data.label}`}
                                            </div>
                                        </div>
                                    )

                                )
                                //   data.values.map((x: any) => {
                                //         console.log(x, "x")
                                //         // return (`${x.freightPercentage} % Freight: ${x.freightCargoQuantity} MT @ $${x.freightRate} / MT`)

                                //     })
                            })}
                        </div>
                        <div className='total-amount'>
                            <div className='amount-flex'>
                                <div style={{ paddingTop: "5px", paddingBottom: "10px", paddingLeft: "10px" }}>{invoiceGrossAmount.map((data: any, i: number) => {
                                    return (
                                        <div key={i}>
                                            {data.values.map((x: any, index: number) => {
                                                return (
                                                    <div key={index} style={{ paddingTop: "10px" }}>
                                                        {`$ ${formatAmount(x.freightTotalAmount)}`}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                    //   data.values.map((x: any) => {
                                    //         console.log(x, "x")
                                    //         // return (`${x.freightPercentage} % Freight: ${x.freightCargoQuantity} MT @ $${x.freightRate} / MT`)

                                    //     })
                                })}</div>
                                {(invoiceDetails.commissionTotalAmount && invoiceDetails.commissionTotalAmount != 0) &&
                                    <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{`($ ${formatAmount(invoiceDetails.commissionTotalAmount)})`}</div>
                                }
                                {(invoiceDetails.brokageCommissionTotal && invoiceDetails.brokageCommissionTotal != 0) &&
                                    <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{`($ ${formatAmount(invoiceDetails.brokageCommissionTotal)})`}</div>
                                }
                                {(invoiceDetails.demmurageAmount && invoiceDetails.demmurageAmount != 0) &&

                                    <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{`$ ${formatAmount(invoiceDetails.demmurageAmount)}`}</div>
                                }
                                {(invoiceDetails.dispatchAmount && invoiceDetails.dispatchAmount != 0) &&
                                    <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{`($ ${formatAmount(invoiceDetails.dispatchAmount)})`}</div>
                                }
                                {(invoiceDetails.miscellaneousAmount && invoiceDetails.miscellaneousAmount != 0) &&
                                    <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{`$ ${formatAmount(invoiceDetails.miscellaneousAmount)}`}</div>
                                }
                                {(invoiceDetails.otherExtraAmount && invoiceDetails.otherExtraAmount != 0) &&
                                    <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>{`$ ${formatAmount(invoiceDetails.otherExtraAmount)}`}</div>
                                }
                                {invoiceOtherValue.map((data: any, i: number) => {
                                    return (
                                        data.amount && data.amount != 0 && (
                                            <div key={i}>
                                                <div style={{ paddingTop: "10px", paddingLeft: "10px" }}>
                                                    {data.amount < 0 ? `($ ${formatAmount((-data.amount))})` : `$ ${formatAmount(data.amount)}`}
                                                </div>
                                            </div>
                                        )
                                    );
                                })}


                            </div>
                        </div>
                    </div>
                    <div className='invoice-total-amount'>
                        <div className='total'>{"Total"}</div>
                        <div className='amount'>{`$ ${formatAmount(totalAmount)}`}</div>
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
