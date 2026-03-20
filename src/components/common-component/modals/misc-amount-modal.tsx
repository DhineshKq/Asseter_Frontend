import React, { useEffect, useState } from 'react'
import { RxCross1 } from 'react-icons/rx'
import DatePickerComponent from '../../common-component/form-elements/date-picker-component'
import { IoMdAdd } from 'react-icons/io'
import IconButton from '../../common-component/form-elements/icon-button'
import { Table } from 'react-bootstrap'
import RadioOrCheckbox from '../../common-component/form-elements/radio-or-checkbox'
import InputComponent from '../../common-component/form-elements/input-component'
import ButtonComponent from '../../common-component/form-elements/button-component'
import { axiosPrivate } from '../../../middleware/axios-api'
import DeleteModal from '../../common-component/modals/delete-modal'
import { formatAmount } from '../../../helpers/format-amount'
interface Props {
    hideModal: (boolean: any) => void
    setMiscAmountDatas: (data: any[]) => void;
    miscAmountDatas: any[]
    mode: any
    voyageDetails?: any
    vcinFormAllRecords?: any
    tcinFormAllRecords?: any;
    view?: any
}
export default function MiscAmountModal({ hideModal, mode, view, vcinFormAllRecords, tcinFormAllRecords, voyageDetails, setMiscAmountDatas, miscAmountDatas }: Props) {
    console.log(miscAmountDatas, "MISC")

    console.log(view, tcinFormAllRecords)

    const [showDeleteModel, setShowDeleteModel] = useState<boolean>(false)
    const [selected, setSelected] = useState<any[]>([]);
    const [selectAll, setSelectAll] = useState<boolean>(true)
    const [expenseType, setExpenseType] = useState('');
    const [amount, setAmount] = useState('');
    const [containsVcoutMiscId, setContainsVcoutMiscId] = useState(false);
    const [containsTcoutMiscId, setContainsTcoutMiscId] = useState(false);

    useEffect(() => {
        const hasVcoutMiscId = miscAmountDatas.some((item: any) => item.actualVcoutMiscId !== undefined || null);
        setContainsVcoutMiscId(hasVcoutMiscId);

        const hasTcoutMiscId = miscAmountDatas.some((item: any) => item.actualTcoutMiscId !== undefined || null);
        setContainsTcoutMiscId(hasTcoutMiscId);
    }, [miscAmountDatas])

    console.log(vcinFormAllRecords.Category, "vcinFormAllRecords.Category")
    console.log(miscAmountDatas, "MISC")

    // Function to add a new row to miscAmountDatas
    const addRow = () => {
        if (expenseType && amount) {
            setMiscAmountDatas([...miscAmountDatas, { expenseType, amount }]);
            setExpenseType('');
            setAmount('');
        }
    };

    const handleRemoveRow = async () => {
        let idList: any = [];
        let idListVcout: any = [];
        let idListTcin: any = [];
        let idListTcout: any = [];


        selected.map((e: any, i: number) => {
            if (view === "VCIN" && vcinFormAllRecords.Category === "Actual") {
                idList.push(e.actualMiscId)
            } else {
                idList.push(e.estimateMiscId)
            }

            if (view === "VCOUT" && vcinFormAllRecords.Category === "Actual") {
                idListVcout.push(e.actualVcoutMiscId)
            }
            else {
                idListVcout.push(e.estimateVcoutMiscId)
            }

            if (view === "TCIN" && tcinFormAllRecords.Category === "Actual") {
                idListTcin.push(e.actualTcinMiscId)
            }
            else {
                idListTcin.push(e.estimateTcinMiscId)
            }

            if (view === "TCOUT" && tcinFormAllRecords.Category === "Actual") {
                console.log("first entry")
                idListTcout.push(e.actualTcoutMiscId)
            }
            else {
                console.log("second entry")
                idListTcout.push(e.estimateTcoutMiscId)
            }

        })
        if (idList.length > 0 || idListVcout.length > 0) {
            try {
                let response: any
                if (view === "VCIN") {
                    if (vcinFormAllRecords.Category === "Actual") {
                        response = await axiosPrivate.patch(`delete/vcin/miscCost`, {
                            miscId: idList,
                            category: vcinFormAllRecords.Category
                        })
                    } else {
                        response = await axiosPrivate.patch(`delete/vcin/miscCost`, {
                            ids: idList,
                            category: vcinFormAllRecords.Category
                        })

                    }
                } else if (view === "VCOUT") {
                    if (containsVcoutMiscId) {
                        response = await axiosPrivate.patch(`delete/vcout/miscCost`, {
                            miscId: idListVcout,
                            category: "Actual"
                        })
                    } else {
                        response = await axiosPrivate.patch(`delete/vcout/miscCost`, {
                            miscId: idListVcout,
                            category: "Estimate"
                        })
                    }
                } else if (view === "TCIN") {
                    if (tcinFormAllRecords.Category === "Actual") {
                        response = await axiosPrivate.patch(`delete/tcin/miscCost`, {
                            miscId: idListTcin,
                            category: tcinFormAllRecords.Category
                        })
                    } else {
                        response = await axiosPrivate.patch(`delete/tcin/miscCost`, {
                            miscId: idListTcin,
                            category: "Estimate"
                        })

                    }
                } else if (view === "TCOUT") {
                    if (containsTcoutMiscId) {
                        response = await axiosPrivate.patch(`delete/tcout/miscCost`, {
                            miscId: idListTcout,
                            category: "Actual"
                        })
                    } else {
                        response = await axiosPrivate.patch(`delete/tcout/miscCost`, {
                            miscId: idListTcout,
                            category: "Estimate"
                        })
                    }
                }

                if (response.status === 200) {
                    const newMiscAmountDatas = miscAmountDatas.filter((data: any, i: number) => !selected.includes(data));
                    setMiscAmountDatas(newMiscAmountDatas);
                    setSelected([])
                    setSelectAll(true)
                    setShowDeleteModel(false);
                }
            } catch (error: any) {
                setShowDeleteModel(false);
            }
        } else {

            const newMiscAmountDatas = miscAmountDatas.filter((data: any, i: number) => {
                return !selected.includes(data);
            });
            setMiscAmountDatas(newMiscAmountDatas);
            setSelected([])
            setSelectAll(true)
            setShowDeleteModel(false);
        }

    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        if (selectAll) {
            const filteredData = miscAmountDatas.filter(
                (data: any) => data.status !== "Open" && data.status !== "Completed"
            );
            setSelected(filteredData);
        } else {
            setSelected([]);
        }
    };

    /// check box single seleck  Fun --------------------------------
    const handleCheckboxChange = (index: number, value: string, data: any) => {
        if (value === "true") {
            const newSelected = [...selected];
            newSelected.push(data)
            setSelected(newSelected);
        } else {
            const newSelected = [...selected];
            let findIndex = newSelected.findIndex((e: any) => e == data)
            newSelected.splice(findIndex, 1);
            setSelected(newSelected);
        }


    };

    let checkValue = miscAmountDatas.some((e: any) => e.scheduledDate === "" || e.quantity === "");
    const isAnySelected = selected.some(value => value); // Check if any element in selected is true
    const isSelectAllFalse = !selectAll; // Check if selectAll is false

    return (
        <>
            <div className='cargo-booking-misc-cost-overall-container'>
                <div className='cargo-manag-shipment-container'>
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
                    <div >
                        <div className={"misc-cost-header"}>{'Miscellaneous'}</div>

                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div className='misc-style-flex' style={{ gap: '10px' }}>
                                <div className='first-row' style={{ width: "50%" }}>
                                    <InputComponent
                                        height={"40px"}
                                        width={"100%"}
                                        margin={"0px 0px 0px 0px"}
                                        padding={"10px"}
                                        border={"1px solid #A9C3DC"}
                                        borderRadius={"5px"}
                                        textAlign={"left"}
                                        backgroundColor={"white"}
                                        color={"black"}
                                        type={"text"}
                                        inputTitle={"Expense Type"}
                                        maxLength={255}
                                        placeHolder={"Expense Type"}
                                        disabled={false}
                                        inputValue={expenseType}
                                        getUser={(value) => {
                                            // let quantity = value.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1');
                                            // handleUpdate("", quantity, 5)
                                            setExpenseType(value)
                                        }}
                                    />
                                </div>
                                <div className='first-row' style={{ width: "30%" }}>
                                    <InputComponent
                                        height={"40px"}
                                        width={"100%"}
                                        margin={"0px 0px 0px 0px"}
                                        padding={"10px"}
                                        border={"1px solid #A9C3DC"}
                                        borderRadius={"5px"}
                                        textAlign={"right"}
                                        backgroundColor={"white"}
                                        color={"black"}
                                        type={"text"}
                                        inputTitle={"Amount ($)"}
                                        maxLength={13}
                                        placeHolder={"0"}
                                        disabled={false}
                                        inputValue={formatAmount(amount)}
                                        getUser={(val) => {
                                            if (val.startsWith('.')) {
                                                val = '0' + val;
                                            }
                                            const value = val.replace(/^[.]|[^\d.]/g, '').replace(/(\..*?)\..*/g, '$1').replace(/(?<=\.[0-9]{2}).+/g, "");
                                            // handleUpdate("", quantity, 5)
                                            setAmount(value)
                                        }}
                                    />
                                </div>

                            </div>
                            <div className='Add-style-flex'>
                                <div style={{ cursor: "pointer" }}>
                                    <div className={""} style={{
                                        background: "#295285", height: "40px", color: "white", width: "100px", marginTop: "33px", borderRadius: "5px", display: "flex",
                                        justifyContent: "center", alignItems: "center",
                                    }} onClick={() => {
                                        addRow()
                                    }}>
                                        <IoMdAdd style={{ color: "white", fontSize: "22px" }} />  {"Add"}
                                    </div>
                                </div>
                                <div title='Filter'>
                                    <IconButton
                                        iconName={"Delete"}
                                        height={"40px"}
                                        width={"40px"}
                                        border={'1px solid #B3CAE1'}
                                        fontSize={"28px"}
                                        margin={"33px 0px 0px 0px"}
                                        color={"#295285"}
                                        opacity={(selected.length > 0) ? "1" : "0.5"}
                                        disabled={(selected.length > 0) ? false : true}
                                        cursor={(selected.length > 0) ? "pointer" : "not-allowed"}
                                        backgroundColor={"white"}
                                        hover={(selected.length > 0) ? true : false}
                                        handleClick={() => {
                                            setShowDeleteModel(true)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div style={{
                            backgroundColor: 'white', overflow: 'auto'
                        }}>
                            {/* height: "650px" */}
                            <div className={"cargo-manag-shipment-table-wrapper"} style={{ marginTop: "20px", }}>
                                <Table striped bordered hover size="sm" className='cargo-manag-shipment-table'>
                                    <thead>
                                        <tr>
                                            <th style={{ paddingLeft: "10px" }}>
                                                <RadioOrCheckbox
                                                    value={""}
                                                    type={"checkbox"}
                                                    name={`selectAll`}
                                                    checkedValue={selectAll ? "true" : ""}
                                                    getVal={(val: any) => {
                                                        // if(d) 
                                                        handleSelectAll()
                                                    }}
                                                />
                                            </th>
                                            <th>Expense Type</th>
                                            <th>Amount ($)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {miscAmountDatas.length === 0 ? (

                                            <tr className='shipment-row-records'>
                                                <td></td>
                                                <td>No records found</td>
                                                <td></td>
                                            </tr>
                                        ) :
                                            (miscAmountDatas && miscAmountDatas.map((data: any, i: number) => (
                                                <tr key={i.toString()} className='shipment-row-records' style={{ borderRight: "1px solid #B3CAE1", borderLeft: "1px solid #B3CAE1" }}>
                                                    <td style={{ paddingLeft: "10px" }}>
                                                        <RadioOrCheckbox
                                                            value={"true"}
                                                            label={' '}
                                                            type={"checkbox"}
                                                            name={`select_${i}`}
                                                            disabled={false}
                                                            checkedValue={selected.includes(data) ? "true" : "false"}
                                                            getVal={(value) => {
                                                                if (selected.includes(data)) {
                                                                    handleCheckboxChange(i, "", data)
                                                                } else {
                                                                    handleCheckboxChange(i, "true", data)
                                                                }
                                                                // setSelectindex(i)
                                                            }}
                                                        />
                                                    </td>

                                                    <td style={{ minWidth: "210px", paddingRight: "5px" }} className='laytime-date-title'>{data.expenseType}</td>
                                                    <td style={{ minWidth: "161px", paddingTop: "15px", backgroundColor: "white", position: 'relative', right: "310px", textAlign: "right" }} >{formatAmount(data.amount)}</td>
                                                </tr>
                                            )))
                                        }
                                    </tbody>

                                </Table>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                            <ButtonComponent
                                title={mode === "edit" ? "Update" : "Save"}
                                height='45px'
                                width='150px'
                                disabled={miscAmountDatas.length === 0 || checkValue ? true : false}
                                backgroundColor='#295285'
                                color='white'
                                className={miscAmountDatas.length === 0 || checkValue ? "button-component-hover disabled" : "button-component common-btn"}
                                handleClick={() => {
                                    if (!checkValue) {
                                        hideModal(false)
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
                {
                    showDeleteModel &&
                    <DeleteModal
                        clearValue={(value: any) => { setShowDeleteModel(value) }}
                        getDelete={() => { handleRemoveRow() }}
                        modelType={'grid-delete'}
                    />
                }
            </div >


        </>
    )
}
