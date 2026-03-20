import React, { ReactNode, useEffect, useState } from 'react'
import { RxCross1 } from 'react-icons/rx'
import { Col, Row, Table } from 'react-bootstrap';
import AgGrid from '../grids-and-tables/ag-grid';
import CustomEllipsisRenderer from '../../../config/elipsis';
import DropdownComponent from '../form-elements/dropdown-component';
import '../../../styles/modal/other-pandl.scss'
import { commaSeperator } from '../../../helpers/format-amount';

interface Props {
    hideModal: (boolean: any) => void
    modalType: string
    otherAmountDetails?: any
}

export default function OtherPandLModal({ hideModal, modalType, otherAmountDetails }: Props) {

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
        <div className='other-pandl-modal'>
            <div className='other-pandl-container'>
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

                <div>
                    <div className={"main-heading"}>{"Others Details"}</div>

                    <div className={"other-details-sub-container"}>

                        <Table bordered >
                            {(modalType == "VCOUT Estimate" || modalType == "VCIN Estimate" || modalType == "VCOUT Actual" || modalType == "VCIN Actual") &&
                                <tbody>
                                    <tr className={'data-row'} >
                                        <td className="particulars">Load PDA</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersLoadPort)}`}
                                        </td>
                                    </tr>
                                    <tr className="data-row" >
                                        <td className="particulars text-right">Discharge PDA</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersDischargePort)}`}
                                        </td>
                                    </tr>
                                </tbody>
                            }

                            {(modalType == "TCOUT Estimate" || modalType == "TCOUT Actual") &&
                                <tbody>
                                    <tr className={'data-row'} >
                                        <td className="particulars">Bunker Expense</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersBunkerValue)}`}
                                        </td>
                                    </tr>
                                    <tr className="data-row" >
                                        <td className="particulars text-right">HSFO Conversion Charges</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersHsfoValue)}`}
                                        </td>
                                    </tr>
                                    <tr className={'data-row'} >
                                        <td className="particulars">Load PDA</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersLoadPortValue)}`}
                                        </td>
                                    </tr>
                                    <tr className="data-row" >
                                        <td className="particulars text-right">Discharge PDA</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersDischargePortValue)}`}
                                        </td>
                                    </tr>
                                    <tr className={'data-row'} >
                                        <td className="particulars">ILOHC</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersIlohcValue)}`}
                                        </td>
                                    </tr>
                                    <tr className="data-row" >
                                        <td className="particulars text-right">IHC</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersIhcValue)}`}
                                        </td>
                                    </tr>
                                    <tr className={'data-row'} >
                                        <td className="particulars">Misc Cost</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersMiscValue)}`}
                                        </td>
                                    </tr>
                                    <tr className="data-row" >
                                        <td className="particulars text-right">CVE</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersCveRateValue)}`}
                                        </td>
                                    </tr>
                                    <tr className={'data-row'} >
                                        <td className="particulars">Additional Charges</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersInvoiceOtherAmountValue)}`}
                                        </td>
                                    </tr>
                                    <tr className="data-row" >
                                        <td className="particulars text-right">OnHire Survey</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.othersOnHireRateValue)}`}
                                        </td>
                                    </tr>
                                </tbody>
                            }
                            {(modalType == "TCIN Estimate" || modalType == "TCIN Actual") &&
                                <tbody>
                                    <tr className={'data-row'} >
                                        <td className="particulars">Bunker Expense</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.bunkerValueAmount)}`}
                                        </td>
                                    </tr>
                                    <tr className="data-row" >
                                        <td className="particulars text-right">HSFO Conversion Charges</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.hsfoFuelAmount)}`}
                                        </td>
                                    </tr>
                                    <tr className={'data-row'} >
                                        <td className="particulars">ILOHC</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.ilohc)}`}
                                        </td>
                                    </tr>
                                    <tr className="data-row" >
                                        <td className="particulars text-right">IHC</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.ihc)}`}
                                        </td>
                                    </tr>
                                    <tr className={'data-row'} >
                                        <td className="particulars">Misc Cost</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.miscCost)}`}
                                        </td>
                                    </tr>
                                    <tr className="data-row" >
                                        <td className="particulars text-right">CVE</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.cveRate)}`}
                                        </td>
                                    </tr>
                                    <tr className={'data-row'} >
                                        <td className="particulars">Additional Charges</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.invoiceOtherAmount)}`}
                                        </td>
                                    </tr>
                                    <tr className="data-row" >
                                        <td className="particulars text-right">OnHire Survey</td>
                                        <td className="estimate-in non-header text-right">
                                            {`${commaSeperator(otherAmountDetails.onHireRate)}`}
                                        </td>
                                    </tr>
                                </tbody>
                            }
                        </Table>
                    </div>

                    {/* <div className={"other-amount-details"}>
                        {(modalType == "VCOUT Estimate" || modalType == "VCIN Estimate" || modalType == "VCOUT Actual" || modalType == "VCIN Actual") &&
                            <div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"Load PDA: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersLoadPort)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"Discharge PDA: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersDischargePort)}`}</div>
                                </div>
                            </div>
                        }


                        {(modalType == "TCOUT Estimate" || modalType == "TCOUT Actual") &&
                            <div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"Bunker Expense: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersBunkerValue)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"HSFO Conversion Charges: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersHsfoValue)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"load PDA: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersLoadPortValue)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"Discharge PDA: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersDischargePortValue)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"ILOHC: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersIlohcValue)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"IHC: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersIhcValue)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"Misc Cost: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersMiscValue)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"CVE: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersCveRateValue)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"Additional Charges: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersInvoiceOtherAmountValue)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"OnHire Survey: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.othersOnHireRateValue)}`}</div>
                                </div>
                            </div>
                        }
                        {(modalType == "TCIN Estimate" || modalType == "TCIN Actual") &&
                            <div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"Bunker Expense: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.bunkerValueAmount)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"HSFO Conversion Charges: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.hsfoFuelAmount)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"ILOHC: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.ilohc)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"IHC: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.ihc)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"Misc Cost: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.miscCost)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"CVE: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.cveRate)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"Additional Charges: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.invoiceOtherAmount)}`}</div>
                                </div>
                                <div className={"details-grid"}>
                                    <div className={"details-grid-heading"}>{"OnHire Survey: "}</div>
                                    <div className={"details-grid-values"}>{`${commaSeperator(otherAmountDetails.onHireRate)}`}</div>
                                </div>
                            </div>
                        }
                    </div> */}
                </div>
            </div>
        </div>
    )
}
