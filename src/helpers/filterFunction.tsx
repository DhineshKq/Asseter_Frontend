export const Filter = (value: any, filterType: string, orginalRowData: any[], setRowData: any) => {
    let filteredData: any = orginalRowData;
    let resultArray: any = [];
    let allFiltersMet = true;
    for (const filterKey in value) {
        const filter = value[filterKey];
        const filterWordLower = filter.filterWord?.toLowerCase();

        switch (filter.filterType) {
            case 'Contains':
                filteredData = filteredData.filter((item: any) =>
                    item[filter.columnName]?.toString().toLowerCase().includes(filterWordLower)
                );

                break;
            case 'Not contains':
                filteredData = filteredData.filter((item: any) =>
                    !item[filter.columnName]?.toString().toLowerCase().includes(filterWordLower)
                );
                break;
            case 'Equals':
                filteredData = filteredData.filter((item: any) =>
                    item[filter.columnName]?.toString().toLowerCase() === filterWordLower
                );
                break;
            case 'Not equal':
                filteredData = filteredData.filter((item: any) =>
                    item[filter.columnName]?.toString().toLowerCase() !== filterWordLower
                );
                break;
            case 'Starts with':
                filteredData = filteredData.filter((item: any) =>
                    item[filter.columnName]?.toString().toLowerCase().startsWith(filterWordLower)
                );
                break;
            case 'Ends with':
                filteredData = filteredData.filter((item: any) =>
                    item[filter.columnName]?.toString().toLowerCase().endsWith(filterWordLower)
                );
                break;
            case 'Blank':
                filteredData = filteredData.filter((item: any) =>
                    !item[filter.columnName]
                );
                break;
            case 'Not blank':
                filteredData = filteredData.filter((item: any) =>
                    item[filter.columnName]
                );
                break;
            case 'Less than':
                filteredData = filteredData.filter((item: any) =>
                    item[filter.columnName] < filterWordLower
                );
                break;
            case 'Less than or equals':
                filteredData = filteredData.filter((item: any) =>
                    item[filter.columnName] <= filterWordLower
                );
                break;
            case 'Greater than':
                filteredData = filteredData.filter((item: any) =>
                    item[filter.columnName] > filterWordLower
                );
                break;
            case 'Greater than or equals':
                filteredData = filteredData.filter((item: any) =>
                    item[filter.columnName] >= filterWordLower
                );
                break;
            default:
                break;
        }
        if (filterType === 'Any') {
            resultArray.push(...filteredData);
            filteredData = orginalRowData
        } else {
            filteredData = filteredData;

            if (filteredData.length > 0) {
                resultArray = filteredData;
            } else {
                resultArray = [];
            }
        }
    }
    const uniqueArray = removeDuplicates(resultArray);
    if (filterType === 'Any') {
        setRowData(uniqueArray);
    } else if (filterType === 'All' && allFiltersMet) {
        setRowData(uniqueArray);
    }
}


function removeDuplicates(resultArray: any) {
    const uniqueArray: any = [];
    for (let i = 0; i < resultArray.length; i++) {
        if (!uniqueArray.includes(resultArray[i])) {
            uniqueArray.push(resultArray[i]);
        }
    }
    return uniqueArray;
}