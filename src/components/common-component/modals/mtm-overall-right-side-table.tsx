
import { IoIosArrowForward } from "react-icons/io";
import '../../../styles/pages/mtm/mtm-overall-right-side-table.scss';

interface TableData {
    rowData?: any
    openRightSideFilter?: any
    setOpenRightSideFilter: any;
}

export default function MtmOverallRightSideTable({ openRightSideFilter, setOpenRightSideFilter, rowData }: TableData) {

    return (
        <>
            <div className='mtm-main-grid-container'>
                <div className='heading'>
                    <span >
                        <button style={{ width: "30px", height: "30px", marginRight: "25px", padding: "0", border: "none", borderRadius: "15px" }} autoFocus onClick={() => { setOpenRightSideFilter() }}> <IoIosArrowForward style={{ cursor: "pointer" }} className='filter-icon' /></button>
                    </span>
                </div>
                <div
                    className="view-table-component-ch"
                    style={{ marginTop: "20px" }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "150px", textAlign: "left", paddingLeft: "15px" }}>Voyage Number</th>
                                <th style={{ width: "100px", textAlign: "right", paddingLeft: "0px" }}>Vessel Name</th>
                                <th style={{ width: "70px", textAlign: "right", paddingRight: "10px" }}>Days</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rowData?.length === 0 ? (
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
                                    <div className="main-body-header-bunker" key={i}>
                                        <tr>
                                            <td style={{ width: "150px", textAlign: "left", paddingLeft: "15px" }} >{(data['Voyage Number'])}</td>
                                            <td style={{ width: "100px", textAlign: "right", }}>{(data['Vessel Name'])}</td>
                                            <td style={{ width: "70px", textAlign: "right", paddingRight: "15px" }}>{Math.ceil(data.Days)}</td>
                                        </tr>
                                    </div>

                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
