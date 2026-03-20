
import { RxCross1 } from 'react-icons/rx';
import '../../../styles/modal/overall-position-mtm.scss';
import { Table } from 'react-bootstrap';
import { useState } from 'react';
import ButtonComponent from '../form-elements/button-component';
import PreviewModel from './preview-model';
import { axiosPrivate } from '../../../middleware/axios-api';
interface Props {
    // headerName: any;
    // physicalModalData: any;
    // dummyData?: any;
    // setPhysicalRowData: any;
    hideModal: (boolean: any) => void
    // derivativeData: any
    // derivativeHeader: any
    realisedBunkerDerivativeOverallValue?: any
    financialYear: any
}

export default function OverallDataPrint({ hideModal, realisedBunkerDerivativeOverallValue, financialYear }: Props) {
    const options = ["Capesize", "Supramax", "Handysize", "Panamax"];
    const categoryOptions = ["P&L", "Physical MTM", "Derivative MTM", "Physical Bunker MTM", "Derivative Bunker MTM", "Baltic Index Data", "Fuel Index Data", "Operations Data"];
    const [selected, setSelected] = useState<string[]>([]);
    const [categorySelected, setCategorySelected] = useState<string[]>([]);
    const [pAndL, setPAndL] = useState<any>({
        physicalRealised: 0,
        physicalRealisedDailyChange: 0,
        physicalMtm: 0,
        derivativeRealised: 0,
        derivativeRealisedDailyChange: 0,
        derivativeMtm: 0,
        bunkerRealised: 0,
        bunkerRealisedDailyChange: 0,
        bunkerMtm: 0,
        totalRealised: 0,
        totalMtm: 0,
    })

    const [physicalMtmData, setPhysicalMtmData] = useState<any>({})
    const [riskDaysData, setRiskDaysData] = useState<any>({})
    const [DerivativeMtmData, setDerivativeMtmData] = useState<any>({})
    const [physicalBunkerData, setPhysicalBunkerData] = useState<any>({})
    const [derivativeBunkerData, setDerivativeBunkerData] = useState<any>({})
    const [balticData, setBalticData] = useState<any>([])
    const [balticIndexMonths, setBalticIndexMonths] = useState<any>([])
    const [fuelIndexMonths, setFuelIndexMonths] = useState<any>([])
    const [fuelIndexData, setFuelIndexData] = useState<any>([])
    const [operationFixtureDatas, setOperationFixtureDatas] = useState<any>([])

    const [previewModel, setPreviewModel] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // console.log(realisedBunkerDerivativeOverallValue, "realisedBunkerDerivativeOverallValue")
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

    const handleCheckboxChange = (option: string) => {
        if (option === "All") {
            if (selected.length === options.length) {
                setSelected([]); // Unselect everything
            } else {
                setSelected([...options]); // Select all options
            }
        } else {
            if (selected.includes(option)) {
                const newSelected = selected.filter((item) => item !== option);
                setSelected(newSelected);
            } else {
                const newSelected = [...selected, option];
                if (newSelected.length === options.length) {
                    setSelected([...options]); // Re-enable "All" when all options are selected
                } else {
                    setSelected(newSelected);
                }
            }
        }
    };

    const isAllSelected = selected.length === options.length;

    const handleCategoryCheckboxChange = (option: string) => {
        if (option === "All") {
            if (categorySelected.length === categoryOptions.length) {
                setCategorySelected([]); // Unselect everything
            } else {
                setCategorySelected([...categoryOptions]); // Select all categoryOptions
            }
        } else {
            if (categorySelected.includes(option)) {
                const newSelected = categorySelected.filter((item) => item !== option);
                setCategorySelected(newSelected);
            } else {
                const newSelected = [...categorySelected, option];
                if (newSelected.length === categoryOptions.length) {
                    setCategorySelected([...categoryOptions]); // Re-enable "All" when all categoryOptions are selected
                } else {
                    setCategorySelected(newSelected);
                }
            }
        }
    };

    const isAllCategorySelected = categorySelected.length === categoryOptions.length;

    const getClassNameForValue = (value: any): string => {
        return (typeof value === 'string' && value.startsWith('-')) || (typeof value === 'number' && value < 0) ? 'negative' : 'positive';
    };
    function sortDataByDate(data: any) {
        // Define a custom order for months and quarters
        const monthOrder: any = {
            "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
            "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
            "Q1": 13, "Q2": 14, "Q3": 15, "Q4": 16
        };

        // Function to convert the date keys to sortable format
        function getDateSortKey(dateKey: any) {
            // Split the date key into its components (e.g., "Jan 24 2023" -> ["Jan", "24", "2023"])
            const parts: string[] = dateKey.split(' ');
            // Extract month or quarter part (e.g., "Jun", "Q2")
            const monthOrQuarter: any = parts[0];
            // Extract day part (e.g., "24") if it exists
            const day = parts.length > 2 ? parts[1] : "0";
            // Extract year part (e.g., "2023")
            const year = parts.length > 2 ? parts[2] : parts[1];

            // Determine sorting order based on monthOrder mapping
            const monthOrQuarterOrder = monthOrder[monthOrQuarter];
            const dayOrder = parseInt(day);
            const yearOrder = parseInt(year);

            // Combine to create a sortable key (year, month/quarter, day)
            return yearOrder * 10000 + monthOrQuarterOrder * 100 + dayOrder;
        }

        // Get all keys and sort them based on the custom order
        const sortedKeys = Object.keys(data).sort((a, b) => {

            const dateSortKeyA = getDateSortKey(a);
            const dateSortKeyB = getDateSortKey(b);
            return dateSortKeyA - dateSortKeyB;
        });

        // Create a new object with sorted keys
        const sortedData: any = {};
        sortedKeys.forEach(key => {
            sortedData[key] = data[key];
        });

        return sortedData;
    }
    function getCurrentMonthYear() {
        const today = new Date();
        return {
            currentMonth: today.getMonth() + 1, // JavaScript months are 0-based, so +1
            currentYear: today.getFullYear().toString().slice(-2) // Get last 2 digits of the year
        };
    }
    function generateQuarterMappings(years: any) {
        let mappings = {};
        years.forEach((year: any) => {
            Object.assign(mappings, getQuarterMonths(year));
        });
        return mappings;
    }

    function getQuarterMonths(year: any) {

        return {
            [`Q1 ${year}`]: [`Jan ${year}`, `Feb ${year}`, `Mar ${year}`],
            [`Q2 ${year}`]: [`Apr ${year}`, `May ${year}`, `Jun ${year}`],
            [`Q3 ${year}`]: [`Jul ${year}`, `Aug ${year}`, `Sep ${year}`],
            [`Q4 ${year}`]: [`Oct ${year}`, `Nov ${year}`, `Dec ${year}`]
        };
    }
    function isFutureMonth(month: any, year: any, currentMonth: any, currentYear: any) {
        const monthMapping: any = {
            "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
            "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12
        };
        const [monthName, yearPart] = month.split(' ');
        const monthNumber = monthMapping[monthName];
        return year > currentYear || (year === currentYear && monthNumber > currentMonth);
    }
    function filterQuarters(finalRecords: any) {
        Object.keys(finalRecords).forEach((key) => {
            let reorderedData = finalRecords[key];
            const { currentMonth, currentYear }: any = getCurrentMonthYear();
            const keysToProcess = [
                "Days", "Daily Change", "Days Daily Change", "MTM", "Quantity",
                "Quantity Daily Change", "Physical Days Count",
                "Derivative Days Count", "Voyage Days Count"
            ];

            // Generate the next six months' labels
            let nextSixMonths: any = [];
            for (let i = 0; i < 6; i++) {
                let date = new Date(currentYear, currentMonth - 1 + i);
                let month = date.toLocaleString('default', { month: 'short' });
                let year = date.getFullYear().toString().slice(-2); // last 2 digits
                nextSixMonths.push(`${month} ${year}`);
            }

            // Extract the unique years from the next six months
            const years: string[] = nextSixMonths.map((date: any) => date.split(' ')[1]);
            const uniqueYears: string[] = Array.from(new Set(years));
            const numericYears: number[] = uniqueYears.map(year => parseInt(year, 10));
            const quarterMonths: any = generateQuarterMappings(numericYears);

            let filteredData: any = {};


            keysToProcess.forEach(key => {
                if (reorderedData[key]) {
                    let data = reorderedData[key];
                    let newData = { ...data };
                    let quartersToRemove: any = [];
                    let quartersToAdd: any = {};

                    Object.keys(quarterMonths).forEach(quarter => {
                        let monthsInQuarter = quarterMonths[quarter];

                        // Filter realized and future months within the nextSixMonths
                        let realizedMonths = monthsInQuarter.filter((month: any) =>
                            nextSixMonths.includes(month) &&
                            !isFutureMonth(month, month.split(' ')[1], currentMonth, currentYear)
                        );

                        let futureMonths = monthsInQuarter.filter((month: any) =>
                            nextSixMonths.includes(month) &&
                            isFutureMonth(month, month.split(' ')[1], currentMonth, currentYear)
                        );

                        let hasAllFutureMonths = nextSixMonths.length === monthsInQuarter.length;
                        // let allMonthsPresent = monthsInQuarter.every((month: any) => data[month] !== undefined);
                        let allMonthsPresent = monthsInQuarter.every((month: any) =>
                            // data[month] !== undefined && 
                            nextSixMonths.includes(month)
                        );
                        if (allMonthsPresent) {
                            quartersToRemove.push(quarter);
                        } else if (realizedMonths.length > 0 && monthsInQuarter.some((month: any) =>
                            // data[month] !== undefined
                            nextSixMonths.includes(month)
                        )) {
                            quartersToRemove.push(quarter);
                        }
                        // else {
                        //   let quarterValue = monthsInQuarter.reduce((total: any, month: any) => {
                        //     // console.log(month)
                        //     if (nextSixMonths.includes(month)) {
                        //       return total + (data[month] || 0);
                        //     }
                        //     return total;
                        //   }, 0);
                        //   if (quarterValue > 0) {
                        //     newData[quarter] = quarterValue;
                        //     console.log(data, "dataaaaaaaaaaaa")
                        //   }
                        // }


                        // Handle incomplete future quarters
                        if (hasAllFutureMonths && nextSixMonths.length !== monthsInQuarter.length) {
                            let incompleteQuarterValue = futureMonths.reduce((total: any, month: any) => {
                                // return total + (data[month] || 0);
                                if (nextSixMonths.includes(month)) {
                                    return total + (data[month] || 0);
                                }

                                return total;
                            }, 0);
                            if (incompleteQuarterValue > 0) {
                                quartersToAdd[quarter] = incompleteQuarterValue;
                            }
                        }
                    });

                    // Remove the identified quarters
                    quartersToRemove.forEach((quarter: any) => {
                        delete newData[quarter];
                    });

                    // Add incomplete future quarters
                    Object.keys(quartersToAdd).forEach((quarter: any) => {
                        newData[quarter] = quartersToAdd[quarter];
                    });

                    // Set months within the retained quarters to 0
                    Object.keys(quarterMonths).forEach(quarter => {
                        if (newData[quarter] !== undefined) {
                            quarterMonths[quarter].forEach((month: any) => {
                                if (newData[month] !== undefined) {
                                    newData[month] = 0;
                                }
                            });
                        }
                    });

                    filteredData[key] = newData;
                }
            });


            // Copy non-processed keys directly
            Object.keys(reorderedData).forEach(key => {
                if (!keysToProcess.includes(key)) {
                    filteredData[key] = reorderedData[key];
                }
            });

            // Update finalRecords with the filtered data for this object
            finalRecords[key] = filteredData;
        });

        return finalRecords;
    }

    function filterRiskDaysQuarters(finalRecords: any) {
        Object.keys(finalRecords).forEach((key) => {
            let reorderedData = finalRecords[key];
            const { currentMonth, currentYear }: any = getCurrentMonthYear();
            const keysToProcess = [
                "Risk Days Count"
                
            ];

            // Generate the next six months' labels
            let nextSixMonths: any = [];
            for (let i = 0; i < 6; i++) {
                let date = new Date(currentYear, currentMonth - 1 + i);
                let month = date.toLocaleString('default', { month: 'short' });
                let year = date.getFullYear().toString().slice(-2); // last 2 digits
                nextSixMonths.push(`${month} ${year}`);
            }

            // Extract the unique years from the next six months
            const years: string[] = nextSixMonths.map((date: any) => date.split(' ')[1]);
            const uniqueYears: string[] = Array.from(new Set(years));
            const numericYears: number[] = uniqueYears.map(year => parseInt(year, 10));
            const quarterMonths: any = generateQuarterMappings(numericYears);

            let filteredData: any = {};


            keysToProcess.forEach(key => {
                if (reorderedData[key]) {
                    let data = reorderedData[key];
                    let newData = { ...data };
                    let quartersToRemove: any = [];
                    let quartersToAdd: any = {};

                    Object.keys(quarterMonths).forEach(quarter => {
                        let monthsInQuarter = quarterMonths[quarter];

                        // Filter realized and future months within the nextSixMonths
                        let realizedMonths = monthsInQuarter.filter((month: any) =>
                            nextSixMonths.includes(month) &&
                            !isFutureMonth(month, month.split(' ')[1], currentMonth, currentYear)
                        );

                        let futureMonths = monthsInQuarter.filter((month: any) =>
                            nextSixMonths.includes(month) &&
                            isFutureMonth(month, month.split(' ')[1], currentMonth, currentYear)
                        );

                        let hasAllFutureMonths = nextSixMonths.length === monthsInQuarter.length;
                        // let allMonthsPresent = monthsInQuarter.every((month: any) => data[month] !== undefined);
                        let allMonthsPresent = monthsInQuarter.every((month: any) =>
                            // data[month] !== undefined && 
                            nextSixMonths.includes(month)
                        );
                        if (allMonthsPresent) {
                            quartersToRemove.push(quarter);
                        } else if (realizedMonths.length > 0 && monthsInQuarter.some((month: any) =>
                            // data[month] !== undefined
                            nextSixMonths.includes(month)
                        )) {
                            quartersToRemove.push(quarter);
                        }
                        // else {
                        //   let quarterValue = monthsInQuarter.reduce((total: any, month: any) => {
                        //     // console.log(month)
                        //     if (nextSixMonths.includes(month)) {
                        //       return total + (data[month] || 0);
                        //     }
                        //     return total;
                        //   }, 0);
                        //   if (quarterValue > 0) {
                        //     newData[quarter] = quarterValue;
                        //     console.log(data, "dataaaaaaaaaaaa")
                        //   }
                        // }


                        // Handle incomplete future quarters
                        if (hasAllFutureMonths && nextSixMonths.length !== monthsInQuarter.length) {
                            let incompleteQuarterValue = futureMonths.reduce((total: any, month: any) => {
                                // return total + (data[month] || 0);
                                if (nextSixMonths.includes(month)) {
                                    return total + (data[month] || 0);
                                }

                                return total;
                            }, 0);
                            if (incompleteQuarterValue > 0) {
                                quartersToAdd[quarter] = incompleteQuarterValue;
                            }
                        }
                    });

                    // Remove the identified quarters
                    quartersToRemove.forEach((quarter: any) => {
                        delete newData[quarter];
                    });

                    // Add incomplete future quarters
                    Object.keys(quartersToAdd).forEach((quarter: any) => {
                        newData[quarter] = quartersToAdd[quarter];
                    });

                    // Set months within the retained quarters to 0
                    Object.keys(quarterMonths).forEach(quarter => {
                        if (newData[quarter] !== undefined) {
                            quarterMonths[quarter].forEach((month: any) => {
                                if (newData[month] !== undefined) {
                                    newData[month] = 0;
                                }
                            });
                        }
                    });

                    filteredData[key] = newData;
                }
            });


            // Copy non-processed keys directly
            Object.keys(reorderedData).forEach(key => {
                if (!keysToProcess.includes(key)) {
                    filteredData[key] = reorderedData[key];
                }
            });

            // Update finalRecords with the filtered data for this object
            finalRecords[key] = filteredData;
        });

        return finalRecords;
    }

    const isExpired = (input: any) => {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last two digits of year
        const currentMonth = currentDate.getMonth() + 1; // Months are 0-based

        // Updated regex to support full-year format (YYYY) and case insensitivity
        const match = input.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Q[1-4]|Cal)\s+(\d{2,4})/i);
        if (!match) return "Invalid Input";

        const [, period, year] = match;
        let inputYear = parseInt(year, 10);

        // Convert four-digit year to two-digit format for comparison
        if (inputYear >= 2000) inputYear %= 100;

        if (inputYear < currentYear) return "Expired";
        if (inputYear > currentYear) return "Not Expired";

        if (period.startsWith("Q")) {
            const quarterMonthMap: any = { Q1: 3, Q2: 6, Q3: 9, Q4: 12 };
            return currentMonth > quarterMonthMap[period.toUpperCase()] ? "Expired" : "Not Expired";
        }

        if (period.toLowerCase() === "cal") return currentMonth > 12 ? "Expired" : "Not Expired";

        const monthMap: any = {
            jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
            jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
        };

        return currentMonth > monthMap[period.toLowerCase()] ? "Expired" : "Not Expired";
    };
    async function allDatasForPrint() {
        setIsLoading(true)
        let summarizedMtmData: any = {
            "Days": {},
            "Daily Change": {},
            "MTM": {},
            "Physical Days Daily Change": {}
        }
        let riskDaysSummarizedMtmData: any = {
            "Days": {}
        }
        if (categorySelected.includes("P&L")) {
            let totalRealised: number = 0
            let totalRealisedDailyChange: number = 0
            let totalMTM: number = 0

            // getting the realised Data
            let physicalRealised: number = 0
            try {
                const response = await axiosPrivate.post(`trendAnalytics/get/all-tc-realised/datas`, { filteredYear: financialYear });
                let finalValueObject = response.data.finalValue;
                // setRealisedSummaryData(finalValueArray)

                if (response.status == 200) {
                    if (selected.includes("Capesize")) {
                        // console.log(finalValueObject.Capesize.actual)
                        physicalRealised += (finalValueObject.Capesize.actual || 0)
                    } if (selected.includes("Supramax")) {

                        physicalRealised += (finalValueObject.Supramax.actual || 0)
                    } if (selected.includes("Handysize")) {

                        physicalRealised += (finalValueObject.Handysize.actual || 0)

                    } if (selected.includes("Panamax")) {

                        physicalRealised += (finalValueObject.Panamax.actual || 0)

                    }


                    setPAndL((prevState: any) => ({
                        ...prevState,
                        physicalRealised: physicalRealised,

                    }));


                    totalRealised += physicalRealised
                    // setPAndL((prevState: any) => ({
                    //     ...prevState,
                    //     totalRealised: (prevState.totalRealised || 0) + (prevState.physicalRealised || 0),
                    // }));
                }
            } catch (error) {
                console.log('Error create for get realised data:', error)
                // setLoadingModal(false)
            }

            try {
                let physicalRealisedDailyChange: number = 0
                const response = await axiosPrivate.post(`trendAnalytics/get/previous/all-tc-realised/datas`, { filteredYear: financialYear });
                let finalValueObject = response.data.finalValue;
                console.log(response.data.finalValue, "previous Dataaaaaaaaaaaaaa")
                // setRealisedSummaryData(finalValueArray)

                if (response.status == 200) {
                    if (selected.includes("Capesize")) {
                        // console.log(finalValueObject.Capesize.actual)
                        physicalRealisedDailyChange += (finalValueObject.Capesize.actual || 0)
                    } if (selected.includes("Supramax")) {

                        physicalRealisedDailyChange += (finalValueObject.Supramax.actual || 0)
                    } if (selected.includes("Handysize")) {

                        physicalRealisedDailyChange += (finalValueObject.Handysize.actual || 0)

                    } if (selected.includes("Panamax")) {

                        physicalRealisedDailyChange += (finalValueObject.Panamax.actual || 0)

                    }


                    setPAndL((prevState: any) => ({
                        ...prevState,
                        physicalRealisedDailyChange: (physicalRealised - physicalRealisedDailyChange),

                    }));

                    totalRealisedDailyChange += (physicalRealised - physicalRealisedDailyChange)
                    // setPAndL((prevState: any) => ({
                    //     ...prevState,
                    //     totalRealised: (prevState.totalRealised || 0) + (prevState.physicalRealised || 0),
                    // }));
                }
            } catch (error) {
                console.log('Error create for get realised data:', error)
                // setLoadingModal(false)
            }

            // gettin MTM data
            try {
                let physicalMtm: number = 0

                const response = await axiosPrivate.post(`trendAnalytics/overallPosition/route-filter/voyage-component/get`, { status: selected });
                const finalRecords = response.data.finalRecords;
                const overallDetails = finalRecords.overAllDetails;
                if (Object.keys(finalRecords).length > 0) {

                    let reorderedData: any = {};
                    Object.keys(overallDetails).map((e) => {
                        const sortedData = sortDataByDate(overallDetails[e]);
                        reorderedData = {
                            ...reorderedData,
                            [e]: sortedData
                        }
                    })
                    const filteredData: any = filterQuarters(finalRecords);
                    // console.log(reorderedData)

                    for (let route in filteredData) {
                        // console.log(route,"route")
                        if (route != "overAllDetails") {

                            for (let item in filteredData[route].MTM) {
                                console.log(item, "item")
                                if (item != "Summary" && isExpired(item) != "Expired") {
                                    physicalMtm += filteredData[route].MTM[item]
                                    // summarizedMtmData['Days']=0
                                    summarizedMtmData['Days'][item] = parseFloat(summarizedMtmData['Days']?.[item] || 0) + parseFloat(filteredData[route]["Physical Days Count"]?.[item])
                                    summarizedMtmData['Physical Days Daily Change'][item] = parseFloat(summarizedMtmData['Physical Days Daily Change']?.[item] || 0) + parseFloat(filteredData[route]["Physical Days Daily Change"]?.[item])
                                    summarizedMtmData['MTM'][item] = parseFloat(summarizedMtmData['MTM']?.[item] || 0) + parseFloat(filteredData[route]["MTM"]?.[item])
                                    summarizedMtmData['Daily Change'][item] = parseFloat(summarizedMtmData['Daily Change']?.[item] || 0) + parseFloat(filteredData[route]["Daily Change"]?.[item])

                                    summarizedMtmData['Days']["Total"] = (parseFloat(summarizedMtmData['Days']?.["Total"] || 0) + parseFloat(filteredData[route]["Physical Days Count"]?.[item])) || 0

                                    summarizedMtmData['Physical Days Daily Change']["Total"] = (parseFloat(summarizedMtmData['Physical Days Daily Change']?.["Total"] || 0) + parseFloat(filteredData[route]["Physical Days Daily Change"]?.[item])) || 0
                                    summarizedMtmData['MTM']["Total"] = (parseFloat(summarizedMtmData['MTM']?.["Total"] || 0) + parseFloat(filteredData[route]["MTM"]?.[item])) || 0
                                    summarizedMtmData['Daily Change']["Total"] = (parseFloat(summarizedMtmData['Daily Change']?.["Total"] || 0) + parseFloat(filteredData[route]["Daily Change"]?.[item])) || 0

                                }
                            }
                        }
                    }
                    setPhysicalMtmData(summarizedMtmData)
                    setPAndL((prevState: any) => ({
                        ...prevState,
                        physicalMtm: physicalMtm,

                    }));

                    totalMTM += physicalMtm
                }
            } catch (error) {
                console.log('Errro for get records overall position:', error)
            }

            // derivative realised
            let derivativeRealisedDetails = []
            let derivativeRealisedDetailsDailyChange = []
            try {
                const response = await axiosPrivate.post(`trendAnalytics/realisedPosition/overalldata/derivative/get`, { filteredYear: financialYear });
                derivativeRealisedDetails = response.data.overallDerivativeDetails
            } catch (error) {
                console.log('Error create for get realised data:', error)
            }

            try {
                const response = await axiosPrivate.post(`trendAnalytics/realisedPosition/overalldata/voyage/get`, { filteredYear: financialYear });
                derivativeRealisedDetails = [...derivativeRealisedDetails, ...response.data.overallDerivativeDetails]
            } catch (error) {
                console.log('Error create for get realised data:', error)
            }


            let derivativeRealised = 0
            if (selected.includes("Capesize")) {
                for (const data of derivativeRealisedDetails) {
                    if (data.product.startsWith("c") || data.product.startsWith("C")) {
                        derivativeRealised += isNaN(data.value) ? 0 : parseFloat(data.value)
                    }
                }
            } if (selected.includes("Supramax")) {
                for (const data of derivativeRealisedDetails) {
                    if (data.product.startsWith("s") || data.product.startsWith("S")) {
                        derivativeRealised += isNaN(data.value) ? 0 : parseFloat(data.value)
                    }
                }
            } if (selected.includes("Handysize")) {
                for (const data of derivativeRealisedDetails) {
                    if (data.product.startsWith("h") || data.product.startsWith("H")) {
                        derivativeRealised += isNaN(data.value) ? 0 : parseFloat(data.value)
                    }
                }
            } if (selected.includes("Panamax")) {
                for (const data of derivativeRealisedDetails) {
                    if (data.product.startsWith("p") || data.product.startsWith("P")) {
                        derivativeRealised += isNaN(data.value) ? 0 : parseFloat(data.value)
                    }
                }
            }
            setPAndL((prevState: any) => ({
                ...prevState,
                derivativeRealised: derivativeRealised,

            }));
            totalRealised += derivativeRealised


            // previous Datas
            try {
                const response = await axiosPrivate.post(`trendAnalytics/realisedPosition/previous/overalldata/derivative/get`, { filteredYear: financialYear });
                derivativeRealisedDetailsDailyChange = response.data.overallDerivativeDetails
            } catch (error) {
                console.log('Error create for get realised data:', error)
            }

            try {
                const response = await axiosPrivate.post(`trendAnalytics/realisedPosition/previous/overalldata/voyage/get`, { filteredYear: financialYear });
                derivativeRealisedDetailsDailyChange = [...derivativeRealisedDetailsDailyChange, ...response.data.overallDerivativeDetails]
            } catch (error) {
                console.log('Error create for get realised data:', error)
            }

            let derivativeRealisedDailyChange = 0
            if (selected.includes("Capesize")) {
                for (const data of derivativeRealisedDetailsDailyChange) {
                    if (data.product.startsWith("c") || data.product.startsWith("C")) {
                        derivativeRealisedDailyChange += isNaN(data.value) ? 0 : parseFloat(data.value)
                    }
                }
            } if (selected.includes("Supramax")) {
                for (const data of derivativeRealisedDetailsDailyChange) {
                    if (data.product.startsWith("s") || data.product.startsWith("S")) {
                        derivativeRealisedDailyChange += isNaN(data.value) ? 0 : parseFloat(data.value)
                    }
                }
            } if (selected.includes("Handysize")) {
                for (const data of derivativeRealisedDetailsDailyChange) {
                    if (data.product.startsWith("h") || data.product.startsWith("H")) {
                        derivativeRealisedDailyChange += isNaN(data.value) ? 0 : parseFloat(data.value)
                    }
                }
            } if (selected.includes("Panamax")) {
                for (const data of derivativeRealisedDetailsDailyChange) {
                    if (data.product.startsWith("p") || data.product.startsWith("P")) {
                        derivativeRealisedDailyChange += isNaN(data.value) ? 0 : parseFloat(data.value)
                    }
                }
            }

            setPAndL((prevState: any) => ({
                ...prevState,
                derivativeRealisedDailyChange: (derivativeRealised - derivativeRealisedDailyChange),

            }));
            // console.log((derivativeRealised - derivativeRealisedDailyChange),derivativeRealisedDailyChange, "(derivativeRealised - derivativeRealisedDailyChange)")
            totalRealisedDailyChange += (derivativeRealised - derivativeRealisedDailyChange)
            // derivative MTM
            let derivativeMtmValue: any = {}
            let result: any = {};
            let derivativeMtm = 0
            try {
                const response = await axiosPrivate.post(`trendAnalytics/overallPosition/get/month-wise/filtered-details`, { selectedRoute: selected });

                let reorderedData: any = {};
                let overallDetails: any
                if (response.status === 200) {
                    const finalRecords = response.data.finalRecords;
                    overallDetails = finalRecords.overAllDetails;

                    if (Object.keys(finalRecords).length > 0) {

                        // Using forEach instead of map since no return value is needed

                    }
                }
                overallDetails && Object.keys(overallDetails).forEach((key) => {
                    const sortedData = sortDataByDate(overallDetails[key]);
                    reorderedData = {
                        ...reorderedData,
                        [key]: sortedData
                    };
                    derivativeMtmValue = {
                        ...derivativeMtmValue,
                        [key]: sortedData
                    };
                });

            } catch (error) {
                // Improved error handling with logging
                console.error('Error fetching month-wise derivative data:', error);
            }
            try {
                const response = await axiosPrivate.post(`trendAnalytics/overallPosition/get/month-wise/filtered-voyage-details`, { selectedRoute: selected });

                let reorderedData: any = {};
                if (response.status === 200) {
                    const finalRecords = response.data.finalRecords;
                    const overallDetails = finalRecords.overAllDetails;

                    if (Object.keys(finalRecords).length > 0) {

                        // Using forEach instead of map since no return value is needed
                        Object.keys(overallDetails).forEach((key) => {
                            const sortedData = sortDataByDate(overallDetails[key]);
                            reorderedData = {
                                ...reorderedData,
                                [key]: sortedData
                            };
                        });


                    }
                }
                const keyPairs = [
                    ["Daily Change", "Daily Change"],
                    ["MTM", "MTM"],
                    ["Voyage Days Count", "Days"],
                    ["Voyage Days Daily Change", "Days Daily Change"]
                ];

                // Initialize the result object

                // console.log(derivativeMtmValue, "derivativeMtmValuemmmmmmmmm")

                // Perform summation
                keyPairs.forEach(([key1, key2]) => {
                    result[key1] = {};
                    const months = new Set([
                        ...Object.keys(reorderedData[key1] || {}),
                        ...Object.keys(derivativeMtmValue[key2] || {})
                    ]);

                    months.forEach(month => {
                        const value1 = reorderedData[key1]?.[month] || 0;
                        const value2 = derivativeMtmValue[key2]?.[month] || 0;
                        result[key1][month] = value1 + value2;
                    });
                });

            } catch (error) {
                // Improved error handling with logging
                console.error('Error fetching month-wise derivative data:', error);
            }
            for (let item in result.MTM) {
                if (isExpired(item) != "Expired") {
                    derivativeMtm += result.MTM[item]

                }

            }
            for (let item in result) {
                for (let value in result[item]) {
                    if (isExpired(value) != "Expired") {
                        result[item]["Total"] = ((result[item]["Total"] || 0) + parseFloat(result[item][value])) || 0
                    }
                }
            }
            setDerivativeMtmData(result)
            setPAndL((prevState: any) => ({
                ...prevState,
                derivativeMtm: derivativeMtm,

            }));
            totalMTM += derivativeMtm

            let realisedBunkerDerivativeDailyChange = 0
            // bunker derivative realised
            try {
                const response = await axiosPrivate.post(`trendAnalytics/realisedPosition/previous/bunker/overalldata/voyage/get`, { filteredYear: financialYear });


                // setRealisedSummaryData(response.data.finalValue)
                // setOverAllDerivativeValues(response.data.overallDerivativeDetails)
                let overallValue = response.data.overallDerivativeDetails.reduce((total: any, value: any) => {
                    const numericValue = parseFloat(value.value);
                    return total + (isNaN(numericValue) ? 0 : numericValue);
                }, 0);
                // setOverallBunkerDatas(parseFloat(overallValue).toFixed(2))
                realisedBunkerDerivativeDailyChange = parseFloat(overallValue)
            } catch (error) {
                console.log('Error create for get realised data:', error)
            }
            setPAndL((prevState: any) => ({
                ...prevState,
                bunkerRealised: parseFloat(realisedBunkerDerivativeOverallValue),
                bunkerRealisedDailyChange: (realisedBunkerDerivativeOverallValue - realisedBunkerDerivativeDailyChange)

            }));
            totalRealised += parseFloat(realisedBunkerDerivativeOverallValue)
            totalRealisedDailyChange += (realisedBunkerDerivativeOverallValue - realisedBunkerDerivativeDailyChange)
            //Physical and Derivative Bunker Mtm

            let bunkerMtmValue: any = {}
            let bunkerResult: any = {};
            let bunkerMtm = 0
            try {
                const response = await axiosPrivate.post(`trendAnalytics/overallPosition/bunker/filtered-value/get`, { type: ["VLSFO", "HSFO"] });
                const finalRecords = response.data.finalRecords;
                const overallDetails = finalRecords.overAllDetails;
                if (Object.keys(finalRecords).length > 0) {

                    let reorderedData: any = {};
                    Object.keys(overallDetails).map((e) => {
                        const sortedData = sortDataByDate(overallDetails[e]);
                        reorderedData = {
                            ...reorderedData,
                            [e]: sortedData
                        }
                        bunkerMtmValue = {
                            ...bunkerMtmValue,
                            [e]: sortedData
                        };
                    })
                    for (let item in reorderedData) {
                        for (let value in reorderedData[item]) {

                            reorderedData[item]["Total"] = ((reorderedData[item]["Total"] || 0) + parseFloat(reorderedData[item][value])) || 0
                        }
                    }
                    setPhysicalBunkerData(reorderedData)


                }
            } catch (error) {
                console.log('Errro for get records overall position:', error)
            }

            try {
                const response = await axiosPrivate.post(`trendAnalytics/overallPosition/get/month-wise/bunker/filtered-details`, { selectedRoute: ["VLSFO", "HSFO"] });

                // if (response.status === 200) {
                const finalRecords = response?.data?.finalRecords;
                const overallDetails = finalRecords?.overAllDetails;

                let reorderedData: any = {};
                if (Object.keys(finalRecords).length > 0) {

                    // Using forEach instead of map since no return value is needed
                    Object.keys(overallDetails).forEach((key) => {
                        const sortedData = sortDataByDate(overallDetails[key]);
                        reorderedData = {
                            ...reorderedData,
                            [key]: sortedData
                        };
                    });
                    for (let item in reorderedData) {
                        for (let value in reorderedData[item]) {

                            reorderedData[item]["Total"] = ((reorderedData[item]["Total"] || 0) + parseFloat(reorderedData[item][value])) || 0
                        }
                    }
                    setDerivativeBunkerData(reorderedData)


                } else {
                }
                const keyPairs = [
                    ["Daily Change", "Daily Change"],
                    ["MTM", "MTM"],
                    ["Days", "Quantity"],
                    ["Days Daily Change", "Quantity Daily Change"]
                ];

                keyPairs.forEach(([key1, key2]) => {
                    bunkerResult[key1] = {};
                    const months = new Set([
                        ...Object.keys(reorderedData[key1] || {}),
                        ...Object.keys(bunkerMtmValue[key2] || {})
                    ]);

                    months.forEach(month => {
                        const value1 = reorderedData[key1]?.[month] || 0;
                        const value2 = bunkerMtmValue[key2]?.[month] || 0;
                        bunkerResult[key1][month] = value1 + value2;
                    });
                });
                // }

            } catch (error) {
                // Improved error handling with logging
                console.error('Error fetching month-wise derivative data:', error);
            }

            for (let item in bunkerResult.MTM) {
                if (item != "Summary") {
                    bunkerMtm += bunkerResult.MTM[item]
                }
            }
            setPAndL((prevState: any) => ({
                ...prevState,
                bunkerMtm: bunkerMtm,

            }));
            totalMTM += bunkerMtm

            setPAndL((prevState: any) => ({
                ...prevState,
                totalRealised: totalRealised,
                totalMtm: totalMTM

            }));
        }


        if (categorySelected.includes("Physical MTM")) {
            let filteredPhysicalMtmData: any
            let filteredRiskDaysPhysicalMtmData: any
            if (!categorySelected.includes("P&L")) {

                try {
                    let physicalMtm: number = 0

                    const response = await axiosPrivate.post(`trendAnalytics/overallPosition/route-filter/voyage-component/get`, { status: selected });
                    const finalRecords = response.data.finalRecords;
                    const overallDetails = finalRecords.overAllDetails;
                    if (Object.keys(finalRecords).length > 0) {

                        let reorderedData: any = {};
                        Object.keys(overallDetails).map((e) => {
                            const sortedData = sortDataByDate(overallDetails[e]);
                            reorderedData = {
                                ...reorderedData,
                                [e]: sortedData
                            }
                        })
                        filteredPhysicalMtmData = filterQuarters(finalRecords);
                        // const filteredData: any = filterQuarters(finalRecords);
                        // console.log(reorderedData)

                        for (let route in filteredPhysicalMtmData) {
                            // console.log(route,"route")
                            if (route != "overAllDetails") {

                                for (let item in filteredPhysicalMtmData[route].MTM) {
                                    if (item != "Summary" && isExpired(item) != "Expired") {
                                        physicalMtm += filteredPhysicalMtmData[route].MTM[item]
                                        // summarizedMtmData['Days']=0
                                        summarizedMtmData['Days'][item] = parseFloat(summarizedMtmData['Days']?.[item] || 0) + parseFloat(filteredPhysicalMtmData[route]["Physical Days Count"]?.[item])
                                        summarizedMtmData['Physical Days Daily Change'][item] = parseFloat(summarizedMtmData['Physical Days Daily Change']?.[item] || 0) + parseFloat(filteredPhysicalMtmData[route]["Physical Days Daily Change"]?.[item])
                                        summarizedMtmData['MTM'][item] = parseFloat(summarizedMtmData['MTM']?.[item] || 0) + parseFloat(filteredPhysicalMtmData[route]["MTM"]?.[item])
                                        summarizedMtmData['Daily Change'][item] = parseFloat(summarizedMtmData['Daily Change']?.[item] || 0) + parseFloat(filteredPhysicalMtmData[route]["Daily Change"]?.[item])


                                        summarizedMtmData['Days']["Total"] = (parseFloat(summarizedMtmData['Days']?.["Total"] || 0) + parseFloat(filteredPhysicalMtmData[route]["Physical Days Count"]?.[item])) || 0

                                        summarizedMtmData['Physical Days Daily Change']["Total"] = (parseFloat(summarizedMtmData['Physical Days Daily Change']?.["Total"] || 0) + parseFloat(filteredPhysicalMtmData[route]["Physical Days Daily Change"]?.[item])) || 0
                                        summarizedMtmData['MTM']["Total"] = (parseFloat(summarizedMtmData['MTM']?.["Total"] || 0) + parseFloat(filteredPhysicalMtmData[route]["MTM"]?.[item])) || 0
                                        summarizedMtmData['Daily Change']["Total"] = (parseFloat(summarizedMtmData['Daily Change']?.["Total"] || 0) + parseFloat(filteredPhysicalMtmData[route]["Daily Change"]?.[item])) || 0
                                    }
                                }
                            }
                        }
                        setPhysicalMtmData(summarizedMtmData)
                        // setPhysicalMtmData(filteredPhysicalMtmData)
                    }
                } catch (error) {
                    console.log('Errro for get records overall position:', error)
                }
            }
            /// risk days
            try {
                let physicalMtm: number = 0

                const response = await axiosPrivate.post(`trendAnalytics/overallPosition/get/risk-days/report`, { status: selected });
                const finalRecords = response.data.finalRecords;
                const overallDetails = finalRecords.overAllDetails;
                if (Object.keys(finalRecords).length > 0) {

                    // let reorderedData: any = {};
                    // Object.keys(overallDetails).map((e) => {
                    //     const sortedData = sortDataByDate(overallDetails[e]);
                    //     reorderedData = {
                    //         ...reorderedData,
                    //         [e]: sortedData
                    //     }
                    // })
                    filteredRiskDaysPhysicalMtmData = filterRiskDaysQuarters(finalRecords);
                    // const filteredData: any = filterQuarters(finalRecords);
                    // console.log(reorderedData)
                    // console.log(filteredRiskDaysPhysicalMtmData, "filteredRiskDaysPhysicalMtmData")
                    for (let route in filteredRiskDaysPhysicalMtmData) {
                        // console.log(route,"route")
                        // if (route != "overAllDetails") {

                        for (let item in filteredRiskDaysPhysicalMtmData[route]["Risk Days Count"]) {
                            // console.log(item,"1")
                            if (isExpired(item) != "Expired") {
                                console.log(item, isExpired(item), "isExpired(item)")
                                // physicalMtm += filteredRiskDaysPhysicalMtmData[route].MTM[item]
                                // summarizedMtmData['Days']=0
                                riskDaysSummarizedMtmData['Days'][item] = parseFloat(riskDaysSummarizedMtmData['Days']?.[item] || 0) + parseFloat(filteredRiskDaysPhysicalMtmData[route]["Risk Days Count"]?.[item])

                                riskDaysSummarizedMtmData['Days']["Total"] = (parseFloat(riskDaysSummarizedMtmData['Days']?.["Total"] || 0) + parseFloat(filteredRiskDaysPhysicalMtmData[route]["Risk Days Count"]?.[item])) || 0

                            }
                        }
                        // }
                    }
                    setRiskDaysData(riskDaysSummarizedMtmData)
                    // setPhysicalMtmData(filteredPhysicalMtmData)
                }
            } catch (error) {
                console.log('Errro for get records overall position:', error)
            }
        }
        if (categorySelected.includes("Derivative MTM")) {
            if (!categorySelected.includes("P&L")) {
                // derivative MTM
                let derivativeMtmValue: any = {}
                let result: any = {};
                let derivativeMtm = 0
                try {
                    const response = await axiosPrivate.post(`trendAnalytics/overallPosition/get/month-wise/filtered-details`, { selectedRoute: selected });

                    if (response.status === 200) {
                        const finalRecords = response.data.finalRecords;
                        const overallDetails = finalRecords.overAllDetails;

                        if (Object.keys(finalRecords).length > 0) {
                            let reorderedData: any = {};

                            // Using forEach instead of map since no return value is needed
                            Object.keys(overallDetails).forEach((key) => {
                                const sortedData = sortDataByDate(overallDetails[key]);
                                reorderedData = {
                                    ...reorderedData,
                                    [key]: sortedData
                                };
                                derivativeMtmValue = {
                                    ...derivativeMtmValue,
                                    [key]: sortedData
                                };
                            });

                        } else {
                        }
                    }

                } catch (error) {
                    // Improved error handling with logging
                    console.error('Error fetching month-wise derivative data:', error);
                }
                try {
                    const response = await axiosPrivate.post(`trendAnalytics/overallPosition/get/month-wise/filtered-voyage-details`, { selectedRoute: selected });

                    let reorderedData: any = {};
                    if (response.status === 200) {
                        const finalRecords = response.data.finalRecords;
                        const overallDetails = finalRecords.overAllDetails;

                        if (Object.keys(finalRecords).length > 0) {

                            // Using forEach instead of map since no return value is needed
                            Object.keys(overallDetails).forEach((key) => {
                                const sortedData = sortDataByDate(overallDetails[key]);
                                reorderedData = {
                                    ...reorderedData,
                                    [key]: sortedData
                                };
                            });
                            // console.log(reorderedData,"reorderedData")


                        }
                    }
                    const keyPairs = [
                        ["Daily Change", "Daily Change"],
                        ["MTM", "MTM"],
                        ["Voyage Days Count", "Days"],
                        ["Voyage Days Daily Change", "Days Daily Change"]
                    ];

                    // Initialize the result object

                    // console.log(derivativeMtmValue, "derivativeMtmValuemmmmmmmmm")

                    // Perform summation
                    keyPairs.forEach(([key1, key2]) => {
                        result[key1] = {};
                        const months = new Set([
                            ...Object.keys(reorderedData[key1] || {}),
                            ...Object.keys(derivativeMtmValue[key2] || {})
                        ]);

                        months.forEach(month => {
                            const value1 = reorderedData[key1]?.[month] || 0;
                            const value2 = derivativeMtmValue[key2]?.[month] || 0;
                            result[key1][month] = value1 + value2;
                        });
                    });

                } catch (error) {
                    // Improved error handling with logging
                    console.error('Error fetching month-wise derivative data:', error);
                }

                for (let item in result.MTM) {
                    if (isExpired(item) != "Expired") {
                        derivativeMtm += result.MTM[item]

                    }

                }
                for (let item in result) {
                    for (let value in result[item]) {
                        if (isExpired(value) != "Expired") {
                            result[item]["Total"] = ((result[item]["Total"] || 0) + parseFloat(result[item][value])) || 0
                        }
                    }
                }

                setDerivativeMtmData(result)
            }
        }
        if (categorySelected.includes("Physical Bunker MTM")) {
            if (!categorySelected.includes("P&L")) {
                try {
                    const response = await axiosPrivate.post(`trendAnalytics/overallPosition/bunker/filtered-value/get`, { type: ["VLSFO", "HSFO"] });
                    const finalRecords = response.data.finalRecords;
                    const overallDetails = finalRecords.overAllDetails;
                    if (Object.keys(finalRecords).length > 0) {

                        let reorderedData: any = {};
                        Object.keys(overallDetails).map((e) => {
                            const sortedData = sortDataByDate(overallDetails[e]);
                            reorderedData = {
                                ...reorderedData,
                                [e]: sortedData
                            }

                        })
                        for (let item in reorderedData) {
                            for (let value in reorderedData[item]) {

                                reorderedData[item]["Total"] = ((reorderedData[item]["Total"] || 0) + parseFloat(reorderedData[item][value])) || 0
                            }
                        }
                        setPhysicalBunkerData(reorderedData)


                    }
                } catch (error) {
                    console.log('Errro for get records overall position:', error)
                }
            }
        }
        if (categorySelected.includes("Derivative Bunker MTM")) {
            if (!categorySelected.includes("P&L")) {
                try {
                    const response = await axiosPrivate.post(`trendAnalytics/overallPosition/get/month-wise/bunker/filtered-details`, { selectedRoute: ["VLSFO", "HSFO"] });

                    if (response.status === 200) {
                        const finalRecords = response.data.finalRecords;
                        const overallDetails = finalRecords.overAllDetails;

                        if (Object.keys(finalRecords).length > 0) {
                            let reorderedData: any = {};

                            // Using forEach instead of map since no return value is needed
                            Object.keys(overallDetails).forEach((key) => {
                                const sortedData = sortDataByDate(overallDetails[key]);
                                reorderedData = {
                                    ...reorderedData,
                                    [key]: sortedData
                                };
                            });
                            for (let item in reorderedData) {
                                for (let value in reorderedData[item]) {

                                    reorderedData[item]["Total"] = ((reorderedData[item]["Total"] || 0) + parseFloat(reorderedData[item][value])) || 0
                                }
                            }
                            setDerivativeBunkerData(reorderedData)


                        } else {
                        }
                    }

                } catch (error) {
                    // Improved error handling with logging
                    console.error('Error fetching month-wise derivative data:', error);
                }
            }
        }
        if (categorySelected.includes("Baltic Index Data")) {
            let filteredData: any
            try {
                const response: any = await axiosPrivate.post("/get/capesize/data", { "category": [selected.map((val) => val.toLowerCase())] })
                if (response.status === 200) {
                    filteredData = response.data.getFinaldata.filter((e: any) => e.oneMonthChange != "-")


                    setBalticData(filteredData)
                }
            } catch (error) {
                console.log(error, "error")
            }

            try {
                const response: any = await axiosPrivate.get("get/capsize/value/grid/C5TC",)
                if (response.status === 200) {

                    const maxYear = (new Date().getFullYear() + 2) % 100;

                    let filteredBalticIndexMonths = response?.data?.finalData.filter((key: string) => {
                        if (key.startsWith("Cal")) {
                            const match = key.match(/\d+/); // Extract the year part
                            return match && parseInt(match[0], 10) <= maxYear; // Keep only if year is within 3 years
                        }
                        return true; // Keep non-"Cal" entries
                    });
                    let balticMonths: any = { overAllDetails: { Days: {} } }
                    filteredData.map((data: any) => {
                        if (data.routeName == "C5TC" || data.routeName == "S10TC" || data.routeName == "P5TC" || data.routeName == "HS7TC") {
                            // console.log("1")
                            Object.keys(data).map((keys) => {
                                if (filteredBalticIndexMonths.includes(keys)) {
                                    // console.log("2")
                                    balticMonths.overAllDetails.Days[keys] = 0
                                }
                            })
                        }
                    })
                    let filteredQuarters = filterQuarters(balticMonths)

                    filteredBalticIndexMonths = Object.keys(filteredQuarters.overAllDetails.Days)
                    // let filteredQuarters = filterQuartersArray(filteredBalticIndexMonths)
                    // console.log(filteredQuarters, "filteredQuarters")
                    // console.log(response?.data?.finalData,filteredBalticIndexMonths,"response?.data?.finalDataresponse?.data?.finalData")
                    setBalticIndexMonths(filteredBalticIndexMonths)
                }

            } catch (error) {
                console.log(error, "error")
            }

        }
        if (categorySelected.includes("Fuel Index Data")) {
            let filteredFuelData: any
            try {
                const response: any = await axiosPrivate.get(`/fuel-index/get/values/${"VLSFO"}`,)
                filteredFuelData = response?.data?.getFinaldata.filter((e: any) => e.port == "Singapore")
                setFuelIndexData(filteredFuelData)

                // const headerResponse: any = await axiosPrivate.get(`fuel-index/heading/get/${"VLSFO"}`)
                // let filteredFuelIndexData = headerResponse?.data?.finalData.filter((e: any) => e !== "")
                // setFuelIndexMonths(filteredFuelIndexData)

                try {
                    const headerResponse: any = await axiosPrivate.get("get/capsize/value/grid/C5TC",)
                    if (headerResponse.status === 200) {
                        const maxYear = (new Date().getFullYear() + 2) % 100;

                        let filteredFuelIndexMonths = headerResponse?.data?.finalData.filter((key: string) => {
                            if (key.startsWith("Cal")) {
                                const match = key.match(/\d+/); // Extract the year part
                                return match && parseInt(match[0], 10) <= maxYear; // Keep only if year is within 3 years
                            }
                            return true; // Keep non-"Cal" entries
                        });

                        let balticMonths: any = { overAllDetails: { Days: {} } }
                        filteredFuelData.map((data: any) => {
                            // if (data.routeName == "C5TC" || data.routeName == "S10TC" || data.routeName == "P5TC" || data.routeName == "HS7TC") {
                            // console.log("1")
                            Object.keys(data).map((keys) => {
                                keys = keys.charAt(0).toUpperCase() + keys.slice(1).toLowerCase()
                                if (filteredFuelIndexMonths.includes(keys)) {
                                    balticMonths.overAllDetails.Days[keys] = 0
                                }
                            })
                            // }
                        })
                        let filteredQuarters = filterQuarters(balticMonths)

                        filteredFuelIndexMonths = Object.keys(filteredQuarters.overAllDetails.Days)
                        let filteredResponse = filteredFuelIndexMonths.map((e: any) => e.startsWith("C") ? e : e.toUpperCase())
                        setFuelIndexMonths(filteredResponse)
                    }

                } catch (error) {
                    console.log(error, "error")
                }

                // updateTime();
            } catch (error) {
                console.log(error, "error")
            }
        }
        if (categorySelected.includes("Operations Data")) {
            try {
                const response: any = await axiosPrivate.post(`get/operation/fixture-data`, { filteredYear: financialYear })

                setOperationFixtureDatas(response.data.finalData)
                // updateTime();
            } catch (error) {
                console.log(error, "error")
            }
        }
        setIsLoading(false)
        setPreviewModel(true)

    }
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            backgroundColor: 'white',
            borderRadius: "20px"
        },
        spinner: {
            width: '50px',
            height: '50px',
            border: '5px solid #e0e0e0',
            borderTop: '5px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
        },
        text: {
            marginTop: '16px',
            fontSize: '18px',
            fontWeight: '500',
            color: '#555',
        },
        // Keyframe animation style
        keyframes: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `,
    };
    return (
        <div className='mtm-overall-derivative-modal'>
            <div className='mtm-overall-derivative-container' style={{ width: "800px", height: "565px", padding: "0px" }}>
                {isLoading &&

                    <div>
                        {/* Inject keyframes into the document */}
                        <style>{styles.keyframes}</style>
                        <div style={styles.container}>
                            <div style={styles.spinner}></div>
                            <p style={styles.text}>{isDownloading ? "Downloading..." : "Generating the report..."}</p>
                        </div>
                    </div>
                }
                {!isLoading &&
                    <>                <div>
                        <div className={"close-icon"} style={{ right: "10px" }}>
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

                        <div style={{ height: "80px", width: "88%", display: "flex", justifyContent: "flex-end", backgroundColor: "#555151", color: "white", paddingLeft: "20px", marginLeft: "28px", borderRadius: "0px 0px 36px 30px" }}>
                            <div>
                                <div style={{ display: "flex", gap: "10px", justifyContent: "center", paddingTop: "5px" }}>
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        <div>Date: </div>
                                        <div style={{ fontWeight: "600" }}>{new Date().toLocaleDateString('en-GB').replace(/\//g, '/')}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        <div>Day: </div>
                                        <div style={{ fontWeight: "600" }}>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "5px", width: "665px" }}>
                                    <div style={{ fontWeight: "600" }}>Indices are closed on Saturdays and Sundays. Therefore, MTMs values on this report may not be correct.</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", paddingLeft: "58px", paddingTop: "15px" }}>
                            <div
                                style={{
                                    margin: '20px',
                                    padding: '20px',
                                    maxWidth: '320px',
                                    minWidth: "300px",
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    backgroundColor: '#f9f9f9',
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: '18px',
                                        marginBottom: '16px',
                                        textAlign: 'center',
                                        color: '#333',
                                    }}
                                >
                                    {"Select Component"}
                                </h2>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        id="all"
                                        checked={isAllSelected}
                                        onChange={() => handleCheckboxChange("All")}
                                        style={{ marginRight: '10px', cursor: 'pointer' }}
                                    />
                                    <label
                                        htmlFor="all"
                                        style={{
                                            fontSize: '16px',
                                            color: '#555',
                                            cursor: 'pointer',
                                            fontWeight: isAllSelected ? 'bold' : 'normal',
                                        }}
                                    >
                                        All
                                    </label>
                                </div>
                                {options.map((option) => (
                                    <div
                                        key={option}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            id={option}
                                            checked={selected.includes(option)}
                                            onChange={() => handleCheckboxChange(option)}
                                            style={{ marginRight: '10px', cursor: 'pointer' }}
                                        />
                                        <label
                                            htmlFor={option}
                                            style={{
                                                fontSize: '16px',
                                                color: selected.includes(option) ? '#000' : '#555',
                                                fontWeight: selected.includes(option) ? '600' : 'normal',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>



                            <div
                                style={{
                                    margin: '20px',
                                    padding: '20px',
                                    maxWidth: '320px',
                                    minWidth: "300px",
                                    border: '1px solid #ccc',
                                    borderRadius: '8px',
                                    backgroundColor: '#f9f9f9',
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: '18px',
                                        marginBottom: '16px',
                                        textAlign: 'center',
                                        color: '#333',
                                    }}
                                >
                                    {"Select Category"}
                                </h2>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '8px',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        id="allcategory"
                                        checked={isAllCategorySelected}
                                        onChange={() => handleCategoryCheckboxChange("All")}
                                        style={{ marginRight: '10px', cursor: 'pointer' }}
                                    />
                                    <label
                                        htmlFor="allcategory"
                                        style={{
                                            fontSize: '16px',
                                            color: '#555',
                                            cursor: 'pointer',
                                            fontWeight: isAllCategorySelected ? 'bold' : 'normal',
                                        }}
                                    >
                                        All
                                    </label>
                                </div>
                                {categoryOptions.map((option) => (
                                    <div
                                        key={option}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            id={option}
                                            checked={categorySelected.includes(option)}
                                            onChange={() => handleCategoryCheckboxChange(option)}
                                            style={{ marginRight: '10px', cursor: 'pointer' }}
                                        />
                                        <label
                                            htmlFor={option}
                                            style={{
                                                fontSize: '16px',
                                                color: categorySelected.includes(option) ? '#000' : '#555',
                                                fontWeight: categorySelected.includes(option) ? '600' : 'normal',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {option}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ paddingLeft: "40%" }}>
                            <ButtonComponent
                                title={"Preview"}
                                height='45px'
                                width='150px'
                                backgroundColor='#295285'
                                border='1px solid #295285'
                                color='white'
                                className={categorySelected.length > 0 && selected.length > 0 ? "button-component common-btn" : "button-component disabled"}
                                disabled={categorySelected.length > 0 && selected.length > 0 ? false : true}
                                handleClick={async () => {
                                    allDatasForPrint()
                                    setIsDownloading(false)
                                    // setPreviewModel(true)
                                }}
                            />
                        </div>
                    </>

                }
            </div>
            {
                previewModel &&
                <PreviewModel
                    hideModal={(val: boolean) => {
                        setPreviewModel(val)
                    }}
                    pAndLPrintPreview={pAndL}
                    physicalMtmData={physicalMtmData}
                    riskDaysData={riskDaysData}
                    DerivativeMtmData={DerivativeMtmData}
                    physicalBunkerData={physicalBunkerData}
                    derivativeBunkerData={derivativeBunkerData}
                    categorySelected={categorySelected}
                    balticIndexMonths={balticIndexMonths}
                    balticData={balticData}
                    fuelIndexMonths={fuelIndexMonths}
                    operationFixtureDatas={operationFixtureDatas}
                    fuelIndexData={fuelIndexData}
                    setIsLoading={(val: boolean) => {
                        setIsLoading(val)
                    }}
                    setIsDownloading={(val: boolean) => {
                        setIsDownloading(val)
                    }}
                />
            }
        </div>
    )
}