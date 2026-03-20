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

export default function MtmRightSideTable({ setOpenRightSideFilter, deleteId, handleUpdateDetails, derivativeHeader, rowData, isMtmOverallDetails, isVoyageDetails, voyageDetails

}: TableData) {
    const navigate = useNavigate();
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
    console.log(voyageDetails, "voyageDetails")
    return (
        <>
            <div className='main-grid-container'>


                <div style={{ marginTop: "40px" }} className='mtm-dedutions-table-wrapper' >
                    <div className='heading'>
                        <span >
                            <button style={{ width: "30px", height: "30px", marginRight: "25px", padding: "0", border: "none" }} autoFocus onClick={() => { setOpenRightSideFilter() }}> <IoIosArrowForward style={{ cursor: "pointer" }} className='filter-icon' /></button>
                        </span>
                    </div>
                    {!isMtmOverallDetails &&
                        <div style={{ overflowY: "auto", maxHeight: "700px" }}>
                            <Table striped bordered hover size="sm" className='mtm-dedutions-table'>
                                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                    <tr>
                                        <th style={{ paddingLeft: "10px" }}>Vessel Name</th>
                                        <th>Voyage No</th>
                                        <th >Trade Date</th>
                                        {/* <th >Fuel Type</th> */}
                                        <th style={{ textAlign: "right", paddingRight: "10px" }}>
                                            {
                                                voyageDetails.length > 0
                                                    ? voyageDetails[0].voyagewiseQuantity
                                                        ? "Quantity"
                                                        : voyageDetails[0].voyagewiseMtmValue
                                                            ? "MTM Value"
                                                            : "Daily Change"
                                                    : ""
                                            }

                                        </th>
                                    </tr>
                                </thead>
                                <tbody>

                                    {voyageDetails && voyageDetails.length > 0 ? (

                                        voyageDetails.map((e: any, i: any) =>
                                        (
                                            <tr style={{ cursor: 'pointer' }} onClick={() => {
                                            }} key={i}>
                                                <td style={{ paddingLeft: "10px" }}>{e.voyagewiseVesselName}</td>
                                                <td>{e.voyagewiseVoyageNumber}</td>
                                                <td>{formatDate(e.tradeData)}</td>
                                                {/* <td>{e.voyagewiseFuelType}</td> */}
                                                <td style={{ textAlign: "right", paddingRight: "10px" }}>
                                                    {
                                                        voyageDetails.length > 0
                                                            ? voyageDetails[0].voyagewiseQuantity
                                                                ? formatAmount(parseFloat(e.voyagewiseQuantity).toFixed(2))
                                                                : voyageDetails[0].voyagewiseMtmValue
                                                                    ? formatAmount(e.voyagewiseMtmValue)
                                                                    : formatAmount(e.voyagewiseDailyChange)
                                                            : ""
                                                    }

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
                    }
                    {isMtmOverallDetails &&
                        <div style={{ overflowY: "auto", maxHeight: "700px" }}>
                            <Table striped bordered hover size="sm" className='mtm-dedutions-table'>
                                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                                    <tr>
                                        <th style={{ paddingLeft: "10px" }}>Vessel Name</th>
                                        <th>Voyage No</th>
                                        <th >RouteName</th>
                                        <th style={{ textAlign: "right", paddingRight: "10px" }}>Quantity
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {voyageDetails && voyageDetails.length > 0 ? (

                                        voyageDetails.map((e: any, i: any) =>
                                        (
                                            <tr style={{ cursor: 'pointer' }} onClick={() => {
                                            }} key={i}>
                                                <td style={{ paddingLeft: "10px" }}>{e.vesselName}</td>
                                                <td>{e.voyageNo}</td>
                                                <td>{e.routeName}</td>
                                                <td style={{ textAlign: "right", paddingRight: "10px" }}>{formatAmount(e.bunkerQuantity)}
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
                    }
                </div>

            </div>
        </>
    );
}
