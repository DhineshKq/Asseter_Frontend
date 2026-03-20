import { useState, useEffect } from 'react';
import { BsFilter } from 'react-icons/bs';
import { HiArrowNarrowRight } from 'react-icons/hi';
import { CiSearch } from 'react-icons/ci';
import { AiFillCaretDown } from 'react-icons/ai';
import { IoIosArrowForward } from "react-icons/io";
import DropdownComponent from '../form-elements/dropdown-component';
import ButtonComponent from '../form-elements/button-component';
import '../../../styles/common-component-charts/right-grid.scss';
import MultiSelectDropDown from '../multi-select-dropdown/multi-select-dropdown';
import { Checkbox, FormControl, InputLabel, ListItemIcon, ListItemText, MenuItem, Select } from '@mui/material'
import moment from 'moment';
import IconButton from '../form-elements/icon-button';
import { useSelector } from 'react-redux';
import { Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface TableData {
    setOpenRightSideFilter: () => void;
    rowData?: any
    derivativeHeader?: any
    isVoyageDetails?: any
    voyageDetails?: any
    isMtmOverallDetails?: any
    handleUpdateDetails: (val: any) => void
    deleteId: (val: any) => void
}

export default function RightSideTable({ setOpenRightSideFilter, deleteId, handleUpdateDetails, derivativeHeader, rowData, isMtmOverallDetails, isVoyageDetails, voyageDetails

}: TableData) {
    // const navigate = useNavigate();
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
    const Permission = useSelector((state: any) => state.Permission);
    const accessType = Permission?.accessType === "Read Only" ? true : false;
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
    return (
        <>
            <div className='main-grid-container'>
                <div className='heading'>
                    {isVoyageDetails !== "voyageDetails" &&
                        <span >
                            <button style={{ width: "30px", height: "30px", marginRight: "25px", padding: "0", border: "none" }} autoFocus onClick={() => { setOpenRightSideFilter() }}> <IoIosArrowForward style={{ cursor: "pointer" }} className='filter-icon' /></button>
                            <h2>{rowData[0].product + " " + rowData[0].period}</h2>
                        </span>
                    }
                    {isVoyageDetails == "voyageDetails" &&
                        <span >
                            <button style={{ width: "30px", height: "30px", marginRight: "25px", padding: "0", border: "none" }} autoFocus onClick={() => { setOpenRightSideFilter() }}> <IoIosArrowForward style={{ cursor: "pointer" }} className='filter-icon' /></button>
                        </span>
                    }
                </div>
                <div style={{ margin: "20px 0px 0px 0px" }}>
                    <b>{isVoyageDetails == "voyageDetails" ? "" : "Purchase History"}</b>
                </div>
                {isVoyageDetails !== "voyageDetails" &&
                    <>
                        <div
                            className="view-table-component-ch"
                            style={{ marginTop: "20px", overflow: "auto" }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "100px", textAlign: "left", paddingLeft: "15px" }}>Date</th>
                                        {/* <th style={{ width: "70px", textAlign: "left", paddingLeft: "0px" }}>Type</th> */}
                                        <th style={{ width: "120px", textAlign: "right", paddingLeft: "0px" }}>Quantity</th>
                                        <th style={{ width: "120px", textAlign: "right", paddingLeft: "0px" }}>Unit</th>
                                        <th style={{ width: "120px", textAlign: "right", paddingLeft: "0px" }}>Price</th>
                                        <th className="access" style={{ textAlign: "center", width: "130px" }}>
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rowData?.filter((data: any) => data.buySell === "Buy").length === 0 ? (
                                        <div className="main-body-header">
                                            <tr className="style-grid-differ">
                                                <td></td>
                                                <td></td>
                                                <td>No records found</td>
                                                <td></td>
                                            </tr>
                                        </div>
                                    ) : (
                                        rowData &&
                                        rowData?.map((data: any, i: number) => (
                                            data.buySell === "Buy" &&
                                            <div className="main-body-header-bunker" key={i}>
                                                <tr>
                                                    <td style={{ width: "100px", textAlign: "left", paddingLeft: "15px" }} >{formatDate(data.tradeDate)}</td>
                                                    {/* <td style={{ width: "70px", textAlign: "left", }}>{data?.buySell}</td> */}
                                                    <td style={{ width: "120px", textAlign: "right", }}>{formatAmount(data.quantity)}</td>
                                                    <td style={{ width: "120px", textAlign: "right", }}>{(data.quantityUnit)}</td>
                                                    <td style={{ width: "120px", textAlign: "right", }}>{formatAmount(data?.price)}</td>
                                                    <td className="" style={{
                                                        textAlign: "center",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        padding: "5px",
                                                        paddingRight: "10px",
                                                    }}>
                                                        <IconButton
                                                            iconName={"Edit"}
                                                            height={"40px"}
                                                            width={"40px"}
                                                            fontSize={"25px"}
                                                            margin={"0px 8px"}
                                                            color={"#295285"}
                                                            border={"1px solid #B3CAE1"}
                                                            backgroundColor={accessType ? "#AEAEAE" : "#FFFFFF"}
                                                            hover={accessType ? false : true}
                                                            cursor={accessType ? "not-allowed" : "pointer"}
                                                            disabled={accessType}
                                                            handleClick={() => {
                                                                handleUpdateDetails(data.tradingHistoryId)
                                                            }}
                                                        />

                                                        <div>
                                                            <IconButton
                                                                iconName={"Delete"}
                                                                height={"40px"}
                                                                width={"40px"}
                                                                fontSize={"25px"}
                                                                margin={"0px 8px"}
                                                                color={"#295285"}
                                                                border={"1px solid #B3CAE1"}
                                                                backgroundColor={accessType ? "#AEAEAE" : "#FFFFFF"}
                                                                hover={accessType ? false : true}
                                                                disabled={accessType}
                                                                cursor={accessType ? "not-allowed" : "pointer"}
                                                                handleClick={() => {
                                                                    deleteId(data.tradingHistoryId);
                                                                    // setCurrentIndex(i);
                                                                    // setIdData({
                                                                    //     tcoutId: data.tcoutBunkerId,
                                                                    //     tcinId: data.tcinBunkerId,
                                                                    //     vcoutId: data.vcoutBunkerId,
                                                                    // });
                                                                }}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            </div>

                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <div style={{ margin: "20px 0px 0px 0px" }} >
                                <b>  {"Sales History"}</b>
                            </div>

                            <div
                                className="view-table-component-ch"
                                style={{ marginTop: "20px", overflow: "auto" }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th style={{ width: "100px", textAlign: "left", paddingLeft: "15px" }}>Date</th>
                                            {/* <th style={{ width: "70px", textAlign: "left", paddingLeft: "0px" }}>Type</th> */}
                                            <th style={{ width: "120px", textAlign: "right", paddingLeft: "0px" }}>Quantity</th>
                                            <th style={{ width: "120px", textAlign: "right", paddingLeft: "0px" }}>Unit</th>
                                            <th style={{ width: "120px", textAlign: "right", paddingLeft: "0px" }}>Price</th>
                                            <th className="access" style={{ textAlign: "center", width: "130px" }}>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rowData?.filter((data: any) => data.buySell === "Sell").length === 0 ? (
                                            <div className="main-body-header">
                                                <tr className="style-grid-differ">
                                                    <td colSpan={4}>No records found</td>
                                                </tr>
                                            </div>
                                        ) : (
                                            rowData &&

                                            rowData?.map((data: any, i: number) => (
                                                data.buySell === "Sell" &&
                                                <div className="main-body-header-bunker" key={i}>
                                                    <tr>
                                                        <td style={{ width: "100px", textAlign: "left", paddingLeft: "15px" }} >{formatDate(data.tradeDate)}</td>
                                                        {/* <td style={{ width: "70px", textAlign: "left", }}>{data?.buySell}</td> */}
                                                        <td style={{ width: "120px", textAlign: "right", }}>{formatAmount(data.quantity)}</td>
                                                        <td style={{ width: "120px", textAlign: "right", }}>{(data.quantityUnit)}</td>
                                                        <td style={{ width: "120px", textAlign: "right", }}>{formatAmount(data?.price)}</td>
                                                        <td className="" style={{
                                                            textAlign: "center",
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            padding: "5px",
                                                            paddingRight: "10px",
                                                        }}>
                                                            <IconButton
                                                                iconName={"Edit"}
                                                                height={"40px"}
                                                                width={"40px"}
                                                                fontSize={"25px"}
                                                                margin={"0px 8px"}
                                                                color={"#295285"}
                                                                border={"1px solid #B3CAE1"}
                                                                backgroundColor={accessType ? "#AEAEAE" : "#FFFFFF"}
                                                                hover={accessType ? false : true}
                                                                cursor={accessType ? "not-allowed" : "pointer"}
                                                                disabled={accessType}
                                                                handleClick={() => {
                                                                    handleUpdateDetails(data.tradingHistoryId)
                                                                }}
                                                            />

                                                            <div>
                                                                <IconButton
                                                                    iconName={"Delete"}
                                                                    height={"40px"}
                                                                    width={"40px"}
                                                                    fontSize={"25px"}
                                                                    margin={"0px 8px"}
                                                                    color={"#295285"}
                                                                    border={"1px solid #B3CAE1"}
                                                                    backgroundColor={accessType ? "#AEAEAE" : "#FFFFFF"}
                                                                    hover={accessType ? false : true}
                                                                    disabled={accessType}
                                                                    cursor={accessType ? "not-allowed" : "pointer"}
                                                                    handleClick={() => {
                                                                        deleteId(data.tradingHistoryId);
                                                                        // setCurrentIndex(i);
                                                                        // setIdData({
                                                                        //     tcoutId: data.tcoutBunkerId,
                                                                        //     tcinId: data.tcinBunkerId,
                                                                        //     vcoutId: data.vcoutBunkerId,
                                                                        // });
                                                                    }}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </div>

                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                }
                {isVoyageDetails == "voyageDetails" &&
                    <>
                        {(isMtmOverallDetails && (derivativeHeader !== "Derivative - Overall" && derivativeHeader !== "Voyage Component - Overall")) &&
                            <>

                                <div style={{ marginTop: "40px" }} className='mtm-dedutions-table-wrapper' >
                                    <div style={{ height: "700px", overflow: "auto" }}>
                                        <Table striped bordered hover size="sm" className='mtm-dedutions-table'>
                                            <thead>
                                                <tr>
                                                    <th style={{ paddingLeft: "10px" }}>Vessel Name</th>
                                                    <th>Voyage No</th>
                                                    <th >Route</th>
                                                    <th style={{ textAlign: "right", paddingRight: "10px" }}>{voyageDetails.length > 0 && voyageDetails[0].voyageWiseMTMValue ? "MTM" : "Daily Change"}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {voyageDetails && voyageDetails.length > 0 ? (

                                                    voyageDetails.map((e: any, i: any) =>
                                                    (
                                                        <tr style={{ cursor: 'pointer' }} onClick={() => {
                                                            // navigate("/operation")
                                                        }} key={i}>
                                                            <td style={{ paddingLeft: "10px" }}>{e.vesselName}</td>
                                                            <td>{e.voyageNo}</td>
                                                            <td>{e.routeName}</td>
                                                            <td style={{ textAlign: "right", paddingRight: "10px" }}>
                                                                {e.voyageWiseMTMValue === 0 || e.voyagewiseDailyChange === 0
                                                                    ? "0.00"
                                                                    : formatAmount(e.voyageWiseMTMValue || e.voyagewiseDailyChange)}
                                                            </td>

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
                            </>
                        }
                        {(!isMtmOverallDetails && (derivativeHeader !== "Derivative - Overall" && derivativeHeader !== "Voyage Component - Overall")) &&
                            <>

                                <div style={{ marginTop: "40px" }} className='mtm-dedutions-table-wrapper' >
                                    <div style={{ height: "700px", overflow: "auto" }}>
                                        <Table striped bordered hover size="sm" className='mtm-dedutions-table'>
                                            <thead>
                                                <tr>
                                                    <th style={{ paddingLeft: "10px" }}>Vessel Name</th>
                                                    <th>Voyage No</th>
                                                    <th >Route</th>
                                                    <th style={{ textAlign: "right", paddingRight: "10px" }}>{voyageDetails.length > 0 && voyageDetails[0].quantityWiseTotalQuantity ? "Quantity" : "Days"}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {voyageDetails && voyageDetails.length > 0 ? (

                                                    voyageDetails.map((e: any, i: any) =>
                                                    (
                                                        <tr style={{ cursor: 'pointer' }} onClick={() => {
                                                            // navigate("/operation")
                                                        }} key={i}>
                                                            <td style={{ paddingLeft: "10px" }}>{e.quantityWiseVesselName}</td>
                                                            <td>{e.quantityWisevoyageNo}</td>
                                                            <td>{e.routeName}</td>
                                                            <td style={{ textAlign: "right", paddingRight: "10px" }}>{voyageDetails.length > 0 && voyageDetails[0].quantityWiseTotalQuantity ? formatAmount(e.quantityWiseTotalQuantity) : parseFloat(e.daysyWiseTotaldays).toFixed(2)}</td>
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
                            </>
                        }
                        {(derivativeHeader === "Derivative - Overall" || derivativeHeader === "Voyage Component - Overall") &&
                            <>

                                <div style={{ marginTop: "40px" }} className='mtm-dedutions-table-wrapper' >
                                    <div style={{ height: "700px", overflow: "auto" }}>
                                        <Table striped bordered hover size="sm" className='mtm-dedutions-table'>
                                            <thead>
                                                <tr>
                                                    <th
                                                        style={{ paddingLeft: "10px" }}
                                                    >Trade Date</th>
                                                    <th >Route</th>
                                                    <th >Type</th>
                                                    <th style={{ textAlign: "right", paddingLeft: "10px" }}>
                                                        {voyageDetails.length > 0
                                                            ? voyageDetails[0].periodWiseTotalDays
                                                                ? "Days"
                                                                : voyageDetails[0].periodwiseMtmValue
                                                                    ? "MTM"
                                                                    : voyageDetails[0].periodWiseDailyChange
                                                                        ? "Daily Change"
                                                                        : "Quantity"
                                                            : "Quantity"}

                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {voyageDetails && voyageDetails.length > 0 ? (

                                                    voyageDetails.map((e: any, i: any) =>
                                                    (
                                                        <tr style={{ cursor: 'pointer' }} onClick={() => {
                                                            // navigate("/operation")
                                                        }} key={i}>
                                                            <td style={{ paddingLeft: "10px" }}>{formatDate(e.periodwiseTradeDate)}</td>
                                                            <td>{e.routeName}</td>
                                                            <td>{e.periodwiseBuySell}</td>
                                                            <td style={{ textAlign: "right", paddingRight: "10px" }}>
                                                                {voyageDetails.length > 0
                                                                    ? voyageDetails[0].periodWiseTotalDays
                                                                        ? parseFloat(e.periodWiseTotalDays).toFixed(2)
                                                                        : voyageDetails[0].periodwiseMtmValue
                                                                            ? formatAmount(e.periodwiseMtmValue)
                                                                            : voyageDetails[0].periodWiseDailyChange
                                                                                ? formatAmount(e.periodWiseDailyChange)
                                                                                : formatAmount(e.periodWiseTotalQuantity)
                                                                    : formatAmount(e.periodWiseTotalQuantity)}
                                                            </td>
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
                            </>
                        }
                    </>
                }
            </div>
        </>
    );
}
