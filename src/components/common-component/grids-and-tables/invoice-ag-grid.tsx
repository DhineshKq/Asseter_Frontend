import { useCallback, useMemo, useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import GridEyeFilter from './grid-eye-filter';
import ColumnHeadingsFillterIcon from "./column-headings-fillter-icon"
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import '../../../styles/common-components/grids-and-tables/ag-grid.scss';
import DropdownComponent from '../form-elements/dropdown-component';


interface Props {
    tabelRowData?: any;
    tableColumnData?: any;
    doubleClickUpdate?: ((val: any) => void) | undefined;
    onCellClickUpdate?: ((val: any) => void) | undefined;
    getEdit?: (data: any) => void;
    getCurruntData?: (data: any) => void;
    getSingleColumn?: (data: any) => void;
    fileName?: string
    displaylength?: number
    singleSelect?: boolean
    hidePaginationDD?: boolean
    rowHeight?: number
    groupHeaderHeight?: number
    headerHeight?: number
    gridOptions?: any

};

export interface AgGridRef {
    onBtExport: () => void;
    clearFilters: () => void;

}


const InvoiceAgGrid = forwardRef(({
    tabelRowData,
    tableColumnData,
    doubleClickUpdate,
    getEdit,
    getCurruntData,
    onCellClickUpdate,
    getSingleColumn,
    fileName,
    hidePaginationDD,
    displaylength,
    singleSelect,
    rowHeight,
    groupHeaderHeight,
    headerHeight,
    gridOptions
}: Props, ref) => {
    const gridRef = useRef<any>(null)
    const AgGridFilterRef = useRef<HTMLDivElement | null>(null);
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [columnDefs, setColumnDefs] = useState(tableColumnData);
    const [isGridEyeFilter, setIsGridEyeFilter] = useState<boolean>(false);
    const [headerList, setHeaderList] = useState<any[]>([]);
    const [pagesize, setPagesize] = useState(10);
    let value = {
        field: 'empty', headerName: '', minWidth: 75, maxWidth: 75, resizable: false, suppressMovable: true,
        cellStyle: { textAlign: 'center' },
        headerComponentFramework: ColumnHeadingsFillterIcon,
        headerComponentParams: {
            handleGridEyeFilter: (props: boolean, event: React.MouseEvent) => {
                event?.stopPropagation()
                handleGridEyeFilter(props);
            }, isGridEyeFilter
        },
    };

    // useEffect(() => {
    //     const displaylengthCount = displaylength ? displaylength : 8   //Condition for displaying length
    //     if (tableColumnData.length > displaylengthCount) {   // 8 Act------------------------>
    //         let slicedTableColumnData = tableColumnData.slice(0, displaylengthCount);
    //         setColumnDefs([...slicedTableColumnData, value])
    //     } else {
    //         setColumnDefs([...tableColumnData, value])
    //     }
    // }, []);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);


    const handleClickOutside = (event: MouseEvent) => {
        if (AgGridFilterRef.current && !AgGridFilterRef.current.contains(event.target as Node)) {
            setIsGridEyeFilter(false);
        }
    };


    useEffect(() => {
        if (gridRef.current.api) {
            onGridReady(null);
        }
    }, [columnDefs])

    useEffect(() => {
        // Find the element with the ref attribute
        const element = document.getElementById('ag-29-label');
        // Change the innerHTML if the element is found
        if (element) {
            element.innerHTML = 'No of Records:';
        }
    }, [gridRef]);
    // Get the reference to the element by ref


    useEffect(() => {
        window.addEventListener('error', e => {
            if (e.message === 'ResizeObserver loop limit exceeded' || e.message === 'ResizeObserver loop completed with undelivered notifications.') {
                const resizeObserverErrDiv = document.getElementById(
                    'webpack-dev-server-client-overlay-div'
                );
                const resizeObserverErr = document.getElementById(
                    'webpack-dev-server-client-overlay'
                );
                if (resizeObserverErr) {
                    resizeObserverErr.setAttribute('style', 'display: none');
                }
                if (resizeObserverErrDiv) {
                    resizeObserverErrDiv.setAttribute('style', 'display: none');
                }
            }
        });
    }, []);



    useEffect(() => {
        const value: any[] = tableColumnData
            .filter((column: any) => column.headerName)
            .map((column: any) => ({ name: column.headerName, id: uuidv4() }));
        setHeaderList(value)
    }, [columnDefs]);


    const handleGridEyeFilter = (iconClicked: boolean) => {
        setIsGridEyeFilter(!iconClicked);
    }


    const getParams = () => {
        return {
            fileName: fileName,
            processCellCallback: (params: any) => {
                if (params.column.getColDef().field === 'selection') {
                    // Handle the multi-select cell value appropriately (assuming it's an array of objects)
                    if (Array.isArray(params.value)) {
                        const selectedValues = params.value.map((item: any) => item.name).join(', ');
                        return selectedValues;
                    } else if (params.value && typeof params.value === 'object') {
                        // Handle the case where params.value is an object (e.g., single selected value)
                        return params.value.name; // Assuming the object has a property 'name'
                    } else {
                        // Handle the case where params.value is not an array or object (e.g., return an empty string)
                        return '';
                    }
                }
                return params.value;
            },
        };
    };


    useImperativeHandle(ref, () => {
        return {
            onBtExport: onBtExport,
            clearFilters: clearFilters,
        }
    });


    const onBtExport = useCallback(() => {
        const gridApi = gridRef.current.api;
        const originalColumnDefs = gridApi.getColumnDefs();
        gridApi.setColumnDefs(originalColumnDefs.filter((colDef: any) => colDef.field !== 'selection'));

        // Export the data as CSV with modified columnDefs
        gridApi.exportDataAsCsv(getParams());

        // Revert back to the original columnDefs
        gridApi.setColumnDefs(originalColumnDefs);
    }, [gridRef]);

    const clearFilters = useCallback(() => {
        gridRef.current!.api.setFilterModel(null);
    }, []);

    function handleHeaderNames(filteredData: any) {
        if (filteredData.length > 0) {
            let tmpColumnData: any = [];
            tmpColumnData.push(tableColumnData[0]);
            filteredData.map((item: any, index: number) => {
                tableColumnData.map(function (col: any) {
                    if (col.headerName == item.name) {
                        tmpColumnData.push(col)
                    }
                });
            });
            const filteredColumns = tmpColumnData.filter((column: any) => !tmpColumnData.includes(column.headerName));
            setColumnDefs([...filteredColumns, value])
        } else {
            setColumnDefs([tableColumnData[0], value])
        }
    }

    const defaultColDef = useMemo(() => {
        return {
            editable: false,
            sortable: true,
            filter: true,
            resizable: true,
        };
    }, []);

    const cellClickedListener = useCallback((event: any) => {
        // const rowNode = event.api.getRowNode(event.rowIndex);
        // rowNode.setSelected(!rowNode.isSelected())
        onCellClickUpdate && onCellClickUpdate("form");
        // event.data && getEdit?.(event.data)
        // event.data && getCurruntData?.(event.data);

        event.data && getSingleColumn?.(event.data);
    }, []);


    const MulticellClickedListener = useCallback((event: any) => {
        event.data && getCurruntData?.(event.data);

    }, []);



    const onGridReady = useCallback((params: any) => {
        gridRef.current.api.sizeColumnsToFit();
        // gridRef.current.api.addEventListener('paginationChanged', (e:any) =>
        // {
        //     resetPaginationSelection();
        // });
    }, []);

    const resetPaginationSelection = () => {
        //Deselect previously selected rows to reset selection
        gridRef.current.api.deselectAll();

        //Initialize pagination data
        let paginationSize = gridRef.current.api.paginationGetPageSize();
        let currentPageNum = gridRef.current.api.paginationGetCurrentPage();
        let totalRowsCount = gridRef.current.api.getDisplayedRowCount();

        //Calculate current page row indexes
        let currentPageRowStartIndex = (currentPageNum * paginationSize);
        let currentPageRowLastIndex = (currentPageRowStartIndex + paginationSize);
        if (currentPageRowLastIndex > totalRowsCount) currentPageRowLastIndex = (totalRowsCount);

        for (let i = 0; i < totalRowsCount; i++) {
            //Set isRowSelectable=true attribute for current page rows, and false for other page rows
            let isWithinCurrentPage = (i >= currentPageRowStartIndex && i < currentPageRowLastIndex);
            gridRef.current.api.getDisplayedRowAtIndex(i).setRowSelectable(isWithinCurrentPage);
        }
    };

    const handleCellDoubleClick = useCallback((event: any) => {
        doubleClickUpdate && doubleClickUpdate("form");
        event.data && getEdit?.(event.data)
    }, []);

    const onSelectionChanged = useCallback(() => {
        var selectedRows = gridRef.current.api.getSelectedRows();
        getCurruntData && getCurruntData(selectedRows);
        // getSingleColumn && getSingleColumn(selectedRows);
    }, []);

    // function onPageSizeChanged() {
    //     // var value = document.getElementById('page-size').value;
    //     gridOptions.api.paginationSetPageSize(Number(value));
    // }


    const getRowHeight = (params: any) => {
        let portlength = (params.data.cargoDetails.port.length * (rowHeight ? rowHeight : 40) * 0.5) || 0;
        let Invoicelength = (params.data.invoices.length * (rowHeight || 1)) || 0;
        if (Invoicelength > portlength) {
            return Invoicelength;
        } else if (Invoicelength <= portlength) { 
            return portlength;
        } else {
            return rowHeight;
        }
    };

    return (
        <div style={containerStyle} className='aggrid-component' data-testid={"column-header"}>
            <div ref={AgGridFilterRef}>
                {
                    isGridEyeFilter && (
                        <div className='icon-filter-aggrid' >
                            <DndProvider backend={HTML5Backend}>
                                <GridEyeFilter
                                    filterHeaderList={headerList}
                                    handleHeaderNames={handleHeaderNames}
                                    columnDefs={columnDefs}
                                />
                            </DndProvider>
                        </div>
                    )
                }
            </div>
            {
                !hidePaginationDD &&
                <div className='pagesize-dropdown'>
                    <div>No. of Records :</div>
                    <div style={{ height: "20x" }} className='ag-dropdown'>
                        <DropdownComponent
                            width={"300px"}
                            defaultValue={[{ label: pagesize, value: pagesize }]}
                            options={[{ label: 10, value: 10 }, { label: 20, value: 20 }, { label: 50, value: 50 }, { label: 100, value: 100 }]}
                            getData={(value: any) => {
                                setPagesize(value.value)
                            }}
                        />
                    </div>
                </div>
            }
            <div className={tabelRowData && tabelRowData.length === 0 ? "ag-theme-alpine ag-no-record-image" : "ag-theme-alpine"}>
                <AgGridReact
                    ref={gridRef}
                    rowHeight={rowHeight ? rowHeight : 40}
                    getRowHeight={getRowHeight}
                    groupHeaderHeight={groupHeaderHeight ? groupHeaderHeight : 30}
                    headerHeight={headerHeight ? headerHeight : 40}
                    paginationPageSize={pagesize}
                    pagination={true}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                    rowData={tabelRowData}
                    columnDefs={columnDefs}
                    rowSelection={singleSelect ? 'single' : 'multiple'}
                    // rowMultiSelectWithClick={singleSelect ? false : true}
                    // suppressRowDeselection={true}
                    defaultColDef={defaultColDef}
                    onGridReady={onGridReady}
                    onComponentStateChanged={onGridReady}
                    onGridSizeChanged={onGridReady}
                    onCellClicked={cellClickedListener}
                    onRowSelected={MulticellClickedListener}
                    suppressRowTransform={true}
                    onCellDoubleClicked={handleCellDoubleClick}
                    onSelectionChanged={onSelectionChanged}
                    gridOptions={gridOptions}
                // paginationNumberFormatter=
                // paginationNumberFormatter: (params) => {
                //     return '[' + params.value.toLocaleString() + ']';
                //   },
                ></AgGridReact>
            </div>
        </div >
    );
});

export default InvoiceAgGrid;