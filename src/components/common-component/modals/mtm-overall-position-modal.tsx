import React, { ReactNode, useEffect, useState } from 'react'
import { RxCross1 } from 'react-icons/rx'
import { Col, Row, Table } from 'react-bootstrap';
import AgGrid from '../grids-and-tables/ag-grid';
import CustomEllipsisRenderer from '../../../config/elipsis';
import DropdownComponent from '../form-elements/dropdown-component';
import '../../../styles/modal/mtm-overall-position.scss'

interface Props {
    headerName: any;
    physicalModalData: any;
    dummyData?: any;
    setPhysicalRowData: any;
    selectedTab?: any;
    hideModal: (boolean: any) => void
}

export default function MtmOverallPosition({ hideModal, headerName, dummyData, physicalModalData, setPhysicalRowData, selectedTab }: Props) {
    const [tableDetails, setTableDetails] = useState<any>({})
    const [headers, setHeaders] = useState<any>([])
    const [optionsList, setOptionsList] = useState<any>([])
    const [selectOption, setSelectOption] = useState<any>('All')

    useEffect(() => {
        const { highestKey, value } = findHighestKeyInDays(physicalModalData)

        setHeaders(value)
        let options = [
            {
                label: "All",
                value: "All"
            }
        ]
        Object.keys(physicalModalData).map((e) => {
            options.push({
                label: e,
                value: e
            })
        })
        setOptionsList(options)
        setTableDetails(physicalModalData)
    }, [])

    function findHighestKeyInDays(data: any) {
        let highestKey: any = 0;
        let value: any = [];
        if (data) {
            Object.keys(data).map((key: any) => {
                Object.keys(data[key]).map((e) => {
                    if ("voyageDetails" !== e) {
                        Object.keys(data[key][e]).map((val) => {
                            if (!value.includes(val)) {
                                value.push(val)
                            }
                        })
                    }
                })
            });
        }

        return { highestKey, value };
    }

    // Function for set a classname --------------------------------->
    const getClassNameForValue = (value: any): string => {
        return (typeof value === 'string' && value.startsWith('-')) || (typeof value === 'number' && value < 0) ? 'negative' : 'positive';
    };

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
        <div className='mtm-overall-position-modal'>
            <div className='mtm-overall-position-container'>
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
                    <div>

                        <div className={"realised-modal-heading"} style={{ width: "300px", marginBottom: "15px", }}>
                            {`Derivative - ${selectedTab}`}
                        </div>
                    </div>
                    {/* style={{ height: "calc(80vh - 50px)" }} */}
                    {/* <div > */}
                    <div className={"mtm-realised-sub-container modal-table"} >
                        <table className='financial-table modal-derivative'>
                            <thead>
                                <tr >
                                    <th className='access'>Buy / Sell</th>
                                    <th className='access'>Counter Party</th>
                                    <th className='access'>Product</th>
                                    <th className='access'>Period</th>
                                    <th className='access'>Date</th>
                                    <th className='access' style={{ justifyContent: "flex-end" }}>Quantity (Days)</th>
                                    <th className='access' style={{ justifyContent: "flex-end", padding: "0px 10px" }}>Price</th>
                                    <th className='access' style={{ padding: "0px 10px" }}>Broker Name</th>
                                    <th className='access' style={{ justifyContent: "flex-end" }}>Broker Commission %</th>
                                    <th className='access' style={{ justifyContent: "flex-end" }}>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    dummyData && dummyData.map((item: any) => (
                                        <tr style={{ cursor: "pointer", height: "50px" }}>
                                            <td className='middle-icons'>{'BUY'}</td>
                                            <td className='middle-icons'>{'SGX'}</td>
                                            <td className='middle-icons'>{'C5 TC'}</td>
                                            <td className='middle-icons'>{'Jun-24'}</td>
                                            <td className='middle-icons'>{'11/05/2024'}</td>
                                            <td className='middle-icons' style={{ justifyContent: "flex-end" }}>{'15'}</td>
                                            <td className='middle-icons' style={{ justifyContent: "flex-end", padding: "0px 10px" }}>{'22,000'}</td>
                                            <td className='middle-icons' style={{ padding: "0px 10px" }}>{'GIF'}</td>
                                            <td className='middle-icons' style={{ justifyContent: "flex-end" }}>{'0.1'}</td>
                                            <td className='middle-icons' style={{ justifyContent: "flex-end" }}>{'330,000'}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    {/* </div> */}
                </div>
            </div>
        </div>
    )
}


{/* <div className='bottom-main'>
                        <div className={"bottom-heading"}>
                            {"Derivatives - Capsize"}
                        </div>
                        <div className='sub-content-value'>
                            <div className='sub-name'>
                                {"Profit & Loss"}
                            </div>
                            <div className='derivatives-value' style={{ marginLeft: "25px" }}>
                                <div className='sub-value'>
                                    {"$136,852.00"}
                                </div>
                                <div className='sub-value-name'>
                                    {"Derivatives"}
                                </div>
                            </div>
                        </div>
                    </div> */}