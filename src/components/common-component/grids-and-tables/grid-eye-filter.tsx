import React, { useEffect, useState, useCallback } from 'react';
import { CiSearch } from 'react-icons/ci';
import DragAndDropHeader from './drag-and-drop-header';
import update from 'immutability-helper'
import '../../../styles/common-components/grids-and-tables/grid-eye-filter.scss';

interface GridEyeFilterProps {
    filterHeaderList: any;
    columnDefs: any;
    handleHeaderNames: (filteredData: string[]) => void;
}

const GridEyeFilter: React.FC<GridEyeFilterProps> = ({ filterHeaderList, handleHeaderNames, columnDefs }) => {
    const [filteredData, setFilteredData] = useState<any>(filterHeaderList);
    const [checkedId, setCheckedId] = useState<string[]>([]);

    useEffect(() => {
        setFilteredData(filterHeaderList);
        setTimeout(() => {
            let ids: string[] = [];
            const selectAllElement = document.querySelector('.select-all') as HTMLInputElement | null;

            selectAllElement!.checked = columnDefs.length - 2 === document.querySelectorAll<HTMLInputElement>('.header-list-checkbox').length;
            document.querySelectorAll<HTMLInputElement>('.header-list-checkbox').forEach((ele) => {
                if (columnDefs.findIndex(function (header: any) {
                    return header.headerName == ele.value
                }) != -1) {
                    ele.checked = true;
                    ids.push(ele.id)
                }
            });
            setCheckedId(ids)
        }, 100);
    }, []);

    useEffect(() => {
        handleHeaderNames(filteredData.filter((e: any) => columnDefs.findIndex(function (header: any) {
            return header.headerName == e.name
        }) != -1));
    }, [filteredData])

    function filterDatas(event: React.ChangeEvent<HTMLInputElement>) {
        const keyword = event.target.value.toLowerCase();
        const filtered = Object.values(filterHeaderList).filter((item: any) => (item.name).toLowerCase().includes(keyword));
        const headerListCheckboxes = document.querySelectorAll<HTMLInputElement>('.header-list-checkbox');

        headerListCheckboxes.forEach((ele) => {
            let isHidden = true;
            filtered.forEach((e: any) => {
                if (e.name === ele.value) {
                    isHidden = false;
                }
            });
            if (isHidden) {
                ele.parentElement!.parentElement!.style.display = 'none';
            } else {
                ele.parentElement!.parentElement!.style.display = 'flex';
            }
        });
    }

    function handleCheckAll(e: React.ChangeEvent<HTMLInputElement>) {
        let ids: string[] = [];
        let values: any[] = [];

        (document.querySelectorAll('.header-list-checkbox') as NodeListOf<HTMLInputElement>).forEach((ele) => {
            ele.checked = e.target.checked;
            ids.push(ele.id);
            if (ele.checked) {
                values.push(filteredData.filter((e: any) => e.id == ele.id)[0]);
            }
        });

        if (e.target.checked) {
            handleHeaderNames(values);
            setCheckedId(ids)
        } else {
            handleHeaderNames([]);
            setCheckedId([])
        }
    }

    function handleCheckbox() {
        let ids: string[] = [];
        let values: any[] = [];
        let allChecked = true;
        const selectAllElement = document.querySelector('.select-all') as HTMLInputElement | null;

        (document.querySelectorAll('.header-list-checkbox') as NodeListOf<HTMLInputElement>).forEach((ele) => {
            if (ele.checked) {
                ids.push(ele.id);
                values.push(filteredData.filter((e: any) => e.id == ele.id)[0]);
            } else {
                setCheckedId(checkedId.filter((e) => e !== ele.id))
            }
            if (!ele.checked) {
                allChecked = false;
            }
        });
        handleHeaderNames(values);
        setCheckedId(ids)

        if (selectAllElement) {
            selectAllElement.checked = allChecked;
        }
    }

    const moveHeader = useCallback((dragIndex: number, hoverIndex: number) => {
        setFilteredData((prevData: any) =>
            update(prevData, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevData[dragIndex]],
                ],
            }),
        )
    }, [])

    return (
        <div className="grid-eye-filter">
            <div className="searching-bar">
                <span className="searching-checkbox">
                    <input
                        type="checkbox"
                        className="select-all"
                        value="selectedAll"
                        onChange={(e) => {
                            handleCheckAll(e);
                        }}
                    />
                </span>
                <span className="input-box">
                    <input placeholder="Search" onChange={(event) => filterDatas(event)} autoFocus className='input-box-Input' />
                    <CiSearch className="search-icon" />
                </span>
            </div>
            {filteredData.map((headerName: any, i: number) => (
                <DragAndDropHeader
                    key={headerName.id}
                    index={i}
                    id={headerName.id}
                    isChecked={checkedId.includes(headerName.id)}
                    text={headerName.name}
                    moveHeader={moveHeader}
                    handleCheckbox={handleCheckbox}
                />
            ))}
        </div>
    );
};

export default GridEyeFilter;