
import { RxCross1 } from 'react-icons/rx';
import '../../../styles/modal/overall-position-mtm.scss';
import { Table } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { axiosPrivate } from '../../../middleware/axios-api';
import ButtonComponent from '../form-elements/button-component';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
interface Props {
    // headerName: any;
    // physicalModalData: any;
    // dummyData?: any;
    // setPhysicalRowData: any;
    hideModal: (boolean: any) => void
    setIsLoading: (boolean: any) => void
    setIsDownloading: (boolean: any) => void
    pAndLPrintPreview: any
    categorySelected: any
    physicalMtmData: any
    riskDaysData: any
    DerivativeMtmData: any
    physicalBunkerData: any
    derivativeBunkerData: any
    balticData: any
    balticIndexMonths: any
    fuelIndexMonths: any
    fuelIndexData: any
    operationFixtureDatas: any
}

export default function PreviewModel({ hideModal, pAndLPrintPreview, setIsLoading, riskDaysData, categorySelected, physicalMtmData, DerivativeMtmData, physicalBunkerData, derivativeBunkerData, balticData, balticIndexMonths, fuelIndexMonths, fuelIndexData, operationFixtureDatas, setIsDownloading }: Props) {
    // const [adjustedVoyageComponent, setAdjustedVoyageComponent] = useState<any>({})
    const containerRef = useRef(null);
    const [printEnable, setPrintEnable] = useState<boolean>(false)
    // const [isLoading, setIsLoading] = useState(false);

    const [containerWidth, setContainerWidth] = useState<any>({

    })
    console.log(riskDaysData, "riskDaysDataaaaaaaaaaaaaaaaaaa")
    const conponentPDFMaster: any = useRef()
    // const conponentPDFMasterfunction = useReactToPrint({
    //     content: () => containerRef.current,
    //     documentTitle: "MasterData",
    //     pageStyle: `
    //                 @page {
    //                   size: Landscape;
    //                   margin: 0.5in; // Adjust margins as needed
    //                 }
    //               `,
    //     onAfterPrint: () => {
    //         setPrintEnable(false);
    //     },
    // });

    // useEffect(() => {
    //     if (printEnable) {
    //         conponentPDFMasterfunction()
    //     }
    // }, [printEnable, conponentPDFMasterfunction]);
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


    const handleDownloadPDF1 = async () => {
        const container: any = containerRef.current;
        if (!container) return;

        try {
            setIsLoading(true);

            // Get full height and width of container
            const originalHeight = container.scrollHeight;
            const originalWidth = container.offsetWidth;

            // Use html2canvas to capture the entire container at 2x scale
            const canvas = await html2canvas(container, {
                scale: 1, // Increased scale for better quality (200% zoom)
                useCORS: true, // Handle cross-origin content
                height: originalHeight * 2, // Increase height to capture more details
                windowHeight: originalHeight * 2, // Ensure full capture
                windowWidth: originalWidth * 2.4, // Capture full width
            });

            const imgData = canvas.toDataURL("image/png");

            // Create a new PDF
            const pdf = new jsPDF("p", "mm", "a3");

            // PDF page size
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Define margins
            const margin = 10;
            const usableWidth = (pdfWidth - margin * 2) * 3; // 200% zoom
            const usableHeight = (pdfHeight - margin * 2) * 2; // 200% zoom

            // Get canvas dimensions
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Scale factor for 200% zoom
            const scaleFactor = Math.min(usableWidth / canvasWidth, usableHeight / canvasHeight);

            // Scale the canvas content to fit within the usable area
            const scaledWidth = canvasWidth * scaleFactor;
            const scaledHeight = canvasHeight * scaleFactor;

            // Add the image to the PDF
            pdf.addImage(
                imgData,
                "PNG",
                margin, // X position
                margin, // Y position
                scaledWidth, // Width scaled for 200% zoom
                scaledHeight, // Height scaled for 200% zoom
                "FAST"
            );

            // Save the PDF
            pdf.save("Overall-report.pdf");
            setPrintEnable(false);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }

        setIsLoading(false);
    };
    const handleDownloadPDF = async () => {
        const container: any = containerRef.current;
        if (!container) return;

        try {
            setIsLoading(true);

            // Get full height and width of container
            const originalHeight = container.scrollHeight;
            const originalWidth = container.offsetWidth;

            // Use html2canvas to capture the entire container at 2x scale
            const canvas = await html2canvas(container, {
                scale: 2, // Increased scale for better quality (200% zoom)
                useCORS: true, // Handle cross-origin content
                height: originalHeight * 2, // Increase height to capture more details
                windowHeight: originalHeight * 2.2, // Ensure full capture
                windowWidth: originalWidth * 2.8, // Capture full width
            });

            const imgData = canvas.toDataURL("image/png");

            // Create a new PDF
            const pdf = new jsPDF("p", "mm", "a3", true); // `true` enables compression

            // PDF page size
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Define margins
            const margin = 10;
            const usableWidth = (pdfWidth - margin * 2) * 2.8; // 200% zoom
            const usableHeight = (pdfHeight - margin * 2) * 2; // 200% zoom

            // Get canvas dimensions
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Scale factor for 200% zoom
            const scaleFactor = Math.min(usableWidth / canvasWidth, usableHeight / canvasHeight);

            // Scale the canvas content to fit within the usable area
            const scaledWidth = canvasWidth * scaleFactor;
            const scaledHeight = canvasHeight * scaleFactor;

            // Add the image to the PDF
            pdf.addImage(
                imgData,
                "PNG",
                margin, // X position
                margin, // Y position
                scaledWidth, // Width scaled for 200% zoom
                scaledHeight, // Height scaled for 200% zoom,
                "FAST"
            );

            // Convert PDF to Blob
            const pdfBlob = pdf.output("blob");

            // Compress the PDF using pdf-lib
            const compressedPDF = await compressPDF(pdfBlob);

            // Send the compressed PDF
            // await sendPDFToServer(compressedPDF);

            // Save the compressed PDF locally
            const compressedBlobURL = URL.createObjectURL(compressedPDF);
            const a = document.createElement("a");
            a.href = compressedBlobURL;
            a.download = "Overall-report.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setPrintEnable(false);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }

        setIsLoading(false);
        setIsDownloading(false)
    };

    // Function to compress PDF using pdf-lib
    const compressPDF = async (pdfBlob: Blob) => {
        const { PDFDocument } = await import("pdf-lib");

        // Load the existing PDF
        const pdfDoc = await PDFDocument.load(await pdfBlob.arrayBuffer());

        // Reduce PDF size by removing unused objects
        pdfDoc.setCreator(""); // Remove metadata
        pdfDoc.setTitle("");
        pdfDoc.setSubject("");

        // Serialize the compressed PDF
        const compressedPdfBytes = await pdfDoc.save({ useObjectStreams: true });

        return new Blob([compressedPdfBytes], { type: "application/pdf" });
    };

    // Function to send PDF to a server
    // const sendPDFToServer = async (pdfBlob: Blob) => {
    //     const formData = new FormData();
    //     formData.append("file", pdfBlob, "Overall-report.pdf");

    //     try {
    //         const response = await axiosPrivate.post(`get/compress/pdf`, { formData });
    //         // const response = await fetch("get/compress/pdf", {
    //         //     method: "POST",
    //         //     body: formData,
    //         // });
    //         console.log(response.data)

    //         // if (!response.ok) throw new Error("Failed to upload PDF");

    //         console.log("PDF successfully uploaded");
    //     } catch (error) {
    //         console.error("Error uploading PDF:", error);
    //     }
    // };


    const handleContainer = async () => {
        // physical mtm
        console.log(physicalMtmData, "physicalMtmData")
        let containerWidthForPhysicalMtm: any
        if (categorySelected.includes("Physical MTM")) {
            containerWidthForPhysicalMtm = physicalMtmData?.Days && Object.keys(physicalMtmData?.Days)?.length * 140 || 200
            if (containerWidthForPhysicalMtm > 1300) {
                containerWidthForPhysicalMtm = "1500px"
            } else {
                containerWidthForPhysicalMtm = `${containerWidthForPhysicalMtm}px`
            }
        }

        //Derivative Mtm
        let containerWidthForDerivativeMtm: any
        if (categorySelected.includes("Derivative MTM")) {
            containerWidthForDerivativeMtm = DerivativeMtmData?.["Voyage Days Count"] && Object.keys(DerivativeMtmData?.["Voyage Days Count"])?.length * 140 || 200
            if (containerWidthForDerivativeMtm > 1300) {
                containerWidthForDerivativeMtm = "1500px"
            } else {
                containerWidthForDerivativeMtm = `${containerWidthForDerivativeMtm}px`
            }
        }

        let containerWidthForPhysicalBunkerMtm: any
        if (categorySelected.includes("Physical Bunker MTM")) {
            containerWidthForPhysicalBunkerMtm = physicalBunkerData?.Quantity && Object.keys(physicalBunkerData?.Quantity)?.length * 140 || 200
            if (containerWidthForPhysicalBunkerMtm > 1300) {
                containerWidthForPhysicalBunkerMtm = "1500px"
            } else {
                containerWidthForPhysicalBunkerMtm = `${containerWidthForPhysicalBunkerMtm}px`
            }
        }

        let containerWidthForDerivativeBunkerMtm: any
        if (categorySelected.includes("Derivative Bunker MTM")) {
            containerWidthForDerivativeBunkerMtm = derivativeBunkerData?.Days && Object.keys(derivativeBunkerData?.Days)?.length * 140 || 200
            if (containerWidthForDerivativeBunkerMtm > 1300) {
                containerWidthForDerivativeBunkerMtm = "1500px"
            } else {
                containerWidthForDerivativeBunkerMtm = `${containerWidthForDerivativeBunkerMtm}px`
            }
        }
        setContainerWidth({
            containerWidthForPhysicalMtm: containerWidthForPhysicalMtm,
            containerWidthForDerivativeMtm: containerWidthForDerivativeMtm,
            containerWidthForPhysicalBunkerMtm: containerWidthForPhysicalBunkerMtm,
            containerWidthForDerivativeBunkerMtm: containerWidthForDerivativeBunkerMtm,
        })
    }
    useEffect(() => {
        handleContainer()
    }, []);
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            height: '70vh',
            backgroundColor: 'white',
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
    console.log(DerivativeMtmData, " Object.keys(DerivativeMtmData).length > 0")
    return (
        <div className='mtm-overall-derivative-modal'>
            <div className='mtm-overall-derivative-container' style={printEnable ? { height: "260%", width: "150%" } : { height: "95vh" }}>

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
                <div ref={containerRef} style={printEnable ? { height: "100%", width: "100%" } : { maxHeight: "85vh", overflow: "auto", maxWidth: "96%" }}>
                    {categorySelected.includes("P&L") &&

                        <div style={{ minWidth: "500px", maxWidth: "600px" }}>

                            <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>{"Overall P&L"}</div>
                            <Table bordered responsive style={{ border: "3px solid black" }}>
                                <tbody>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", color: "white", backgroundColor: "black" }} className={"table-row-header"} > </td>
                                        <td style={{ textAlign: "center", paddingRight: "10px", color: "white", backgroundColor: "black" }} className={"table-row-header"} > {"Realised"} </td>
                                        <td style={{ textAlign: "center", paddingRight: "10px", color: "white", backgroundColor: "black" }} className={"table-row-header"} > {"MTM"} </td>
                                        <td style={{ textAlign: "center", paddingRight: "10px", color: "white", backgroundColor: "black" }} className={"table-row-header"} > {"Realised Daily Change"} </td>
                                        <td style={{ textAlign: "center", paddingRight: "10px", color: "white", backgroundColor: "black" }} className={"table-row-header"} > {"MTM Daily Change"} </td>

                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", color: "white", backgroundColor: "#295285", border: "1px solid black" }} className={"table-row-header"} > Physical </td>
                                        <td style={pAndLPrintPreview?.physicalRealised?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(pAndLPrintPreview.physicalRealised).toFixed(2))} </td>

                                        <td style={pAndLPrintPreview?.physicalMtm?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(pAndLPrintPreview.physicalMtm).toFixed(2))} </td>
                                        <td style={pAndLPrintPreview?.physicalRealisedDailyChange?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"}>{formatAmount(parseFloat(pAndLPrintPreview.physicalRealisedDailyChange).toFixed(2))} </td>


                                        <td style={physicalMtmData['Daily Change']?.["Total"]?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(physicalMtmData['Daily Change']?.["Total"] || 0).toFixed(2))} </td>
                                    </tr>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", color: "white", backgroundColor: "#295285", border: "1px solid black" }} className={"table-row-header"} > FFA </td>
                                        <td style={pAndLPrintPreview?.derivativeRealised?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(pAndLPrintPreview.derivativeRealised).toFixed(2))} </td>

                                        <td style={pAndLPrintPreview?.derivativeMtm?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(pAndLPrintPreview.derivativeMtm).toFixed(2))} </td>
                                        <td style={pAndLPrintPreview?.derivativeRealisedDailyChange?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(pAndLPrintPreview.derivativeRealisedDailyChange).toFixed(2))} </td>

                                        <td style={DerivativeMtmData['Daily Change']?.["Total"]?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(DerivativeMtmData['Daily Change']?.["Total"] || 0).toFixed(2))} </td>
                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", color: "white", backgroundColor: "#295285", border: "1px solid black" }} className={"table-row-header"} > Bunker </td>
                                        <td style={pAndLPrintPreview?.bunkerRealised?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(pAndLPrintPreview.bunkerRealised).toFixed(2))} </td>

                                        <td style={pAndLPrintPreview?.bunkerMtm?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(pAndLPrintPreview.bunkerMtm).toFixed(2))} </td>
                                        <td style={pAndLPrintPreview?.bunkerRealisedDailyChange?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(pAndLPrintPreview.bunkerRealisedDailyChange).toFixed(2))} </td>

                                        <td style={parseFloat(physicalBunkerData['Daily Change']?.["Total"] || 0 + parseFloat(derivativeBunkerData['Daily Change']?.["Total"] || 0)).toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(physicalBunkerData['Daily Change']?.["Total"] || 0 + parseFloat(derivativeBunkerData['Daily Change']?.["Total"] || 0)).toFixed(2))} </td>
                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", color: "white", backgroundColor: "#295285", border: "1px solid black" }} className={"table-row-header"} > Total </td>
                                        <td style={pAndLPrintPreview?.totalRealised?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "green", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(pAndLPrintPreview.totalRealised).toFixed(2))} </td>

                                        <td style={pAndLPrintPreview?.totalMtm?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "green", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} > {formatAmount(parseFloat(pAndLPrintPreview.totalMtm).toFixed(2))} </td>

                                        <td style={(parseFloat(pAndLPrintPreview?.physicalRealisedDailyChange) + parseFloat(pAndLPrintPreview.derivativeRealisedDailyChange) + parseFloat(pAndLPrintPreview?.bunkerRealisedDailyChange) || 0)?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "green", backgroundColor: "#d9d9d9", border: "1px solid black" }}>{formatAmount((parseFloat(pAndLPrintPreview.physicalRealisedDailyChange) + parseFloat(pAndLPrintPreview.derivativeRealisedDailyChange) + parseFloat(pAndLPrintPreview.bunkerRealisedDailyChange) || 0).toFixed(2))}</td>


                                        <td style={(parseFloat(physicalMtmData['Daily Change']?.["Total"] || 0) + parseFloat(DerivativeMtmData['Daily Change']?.["Total"] || 0) + parseFloat(physicalBunkerData['Daily Change']?.["Total"] || 0 + parseFloat(derivativeBunkerData['Daily Change']?.["Total"] || 0)))?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "green", backgroundColor: "#d9d9d9", border: "1px solid black" }} className={"table-row-header"} >
                                            {formatAmount((parseFloat(physicalMtmData['Daily Change']?.["Total"] || 0) + parseFloat(DerivativeMtmData['Daily Change']?.["Total"] || 0) + parseFloat(physicalBunkerData['Daily Change']?.["Total"] || 0 + parseFloat(derivativeBunkerData['Daily Change']?.["Total"] || 0))).toFixed(2))
                                            } </td>
                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", color: "white", backgroundColor: "#295285", border: "1px solid black" }}></td>
                                        <td style={(parseFloat(pAndLPrintPreview.totalRealised) + parseFloat(pAndLPrintPreview.totalMtm))?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "green", backgroundColor: "#d9d9d9", border: "1px solid black" }} colSpan={2}>{formatAmount((parseFloat(pAndLPrintPreview.totalRealised) + parseFloat(pAndLPrintPreview.totalMtm)).toFixed(2))}</td>

                                        <td style={((parseFloat(pAndLPrintPreview.physicalRealisedDailyChange) + parseFloat(pAndLPrintPreview.derivativeRealisedDailyChange) + parseFloat(pAndLPrintPreview.bunkerRealisedDailyChange) || 0) + (parseFloat(physicalMtmData['Daily Change']?.["Total"] || 0) + parseFloat(DerivativeMtmData['Daily Change']?.["Total"] || 0) + parseFloat(physicalBunkerData['Daily Change']?.["Total"] + parseFloat(derivativeBunkerData['Daily Change']?.["Total"] || 0))))?.toString().startsWith("-") ? { textAlign: "center", paddingRight: "10px", color: "red", backgroundColor: "#d9d9d9", border: "1px solid black" } : { textAlign: "center", paddingRight: "10px", color: "green", backgroundColor: "#d9d9d9", border: "1px solid black" }} colSpan={2}>
                                            {formatAmount(((parseFloat(pAndLPrintPreview.physicalRealisedDailyChange) || 0 + parseFloat(pAndLPrintPreview.derivativeRealisedDailyChange) || 0 + parseFloat(pAndLPrintPreview.bunkerRealisedDailyChange) || 0) + (parseFloat(physicalMtmData['Daily Change']?.["Total"]) || 0 + parseFloat(DerivativeMtmData['Daily Change']?.["Total"]) || 0 + parseFloat(physicalBunkerData['Daily Change']?.["Total"] || 0 + derivativeBunkerData['Daily Change']?.["Total"] || 0))).toFixed(2))}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    }
                    {categorySelected.includes("Physical MTM") &&

                        <div style={{ minWidth: "500px", maxWidth: containerWidth.containerWidthForPhysicalMtm, overflow: "auto" }}>

                            <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>{"Physical MTM"}</div>
                            <Table bordered responsive style={{ border: "3px solid black" }}>
                                <tbody>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "black", color: "white", width: "150px" }} className={"table-row-header"}>Position</td>
                                        {
                                            Object.keys(physicalMtmData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (physicalMtmData["Days"] && Object.keys(physicalMtmData["Days"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={{ backgroundColor: "black", color: "white", textAlign: "center" }} className={"table-row-header"} key={index}>{value}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "black" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Days</td>
                                        {
                                            Object.keys(physicalMtmData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (physicalMtmData["Days"] && Object.keys(physicalMtmData["Days"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {

                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={physicalMtmData?.['Days']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{physicalMtmData?.['Days']?.[value] ? formatAmount(Math.ceil(physicalMtmData?.['Days']?.[value])) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Risk Days</td>
                                        {
                                            Object.keys(physicalMtmData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (physicalMtmData["Days"] && Object.keys(physicalMtmData["Days"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {

                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={riskDaysData?.['Days']?.[value]?.toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{riskDaysData?.['Days']?.[value] ? formatAmount(Math.ceil(riskDaysData?.['Days']?.[value])) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Daily Change</td>
                                        {
                                            Object.keys(physicalMtmData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (physicalMtmData["Days"] && Object.keys(physicalMtmData["Days"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={physicalMtmData?.['Physical Days Daily Change']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "green", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{physicalMtmData?.['Physical Days Daily Change']?.[value] ? formatAmount(Math.ceil(physicalMtmData?.['Physical Days Daily Change']?.[value])) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>MTM</td>
                                        {
                                            Object.keys(physicalMtmData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (physicalMtmData["Days"] && Object.keys(physicalMtmData["Days"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={physicalMtmData?.['MTM']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{physicalMtmData?.['MTM']?.[value] ? formatAmount(parseFloat(physicalMtmData?.['MTM']?.[value]).toFixed(2)) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Daily Change</td>
                                        {
                                            Object.keys(physicalMtmData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (physicalMtmData["Days"] && Object.keys(physicalMtmData["Days"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items

                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={physicalMtmData?.['Daily Change']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "green", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{physicalMtmData?.['Daily Change']?.[value] ? formatAmount(parseFloat(physicalMtmData?.['Daily Change']?.[value]).toFixed(2)) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    }
                    {categorySelected.includes("Derivative MTM") &&

                        <div style={{ minWidth: "500px", maxWidth: containerWidth.containerWidthForDerivativeMtm, overflow: "auto" }}>

                            <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>{"Derivative MTM"}</div>
                            <Table bordered responsive style={{ border: "3px solid black" }}>
                                <tbody>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "black", color: "white", width: "150px" }} className={"table-row-header"}>Position</td>
                                        {
                                            Object.keys(DerivativeMtmData["Voyage Days Count"]).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (DerivativeMtmData["Voyage Days Count"] && Object.keys(DerivativeMtmData["Voyage Days Count"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {

                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={{ backgroundColor: "black", color: "white", textAlign: "center" }} className={"table-row-header"} key={index}>{value}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "black" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Days</td>
                                        {
                                            Object.keys(DerivativeMtmData["Voyage Days Count"]).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (DerivativeMtmData["Voyage Days Count"] && Object.keys(DerivativeMtmData["Voyage Days Count"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={DerivativeMtmData?.['Voyage Days Count']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{DerivativeMtmData?.['Voyage Days Count']?.[value] ? formatAmount(Math.ceil(DerivativeMtmData?.['Voyage Days Count']?.[value])) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Daily Change</td>
                                        {
                                            Object.keys(DerivativeMtmData["Voyage Days Count"]).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (DerivativeMtmData["Voyage Days Count"] && Object.keys(DerivativeMtmData["Voyage Days Count"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={DerivativeMtmData?.['Voyage Days Daily Change']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "green", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{DerivativeMtmData?.['Voyage Days Daily Change']?.[value] ? formatAmount(Math.ceil(DerivativeMtmData?.['Voyage Days Daily Change']?.[value])) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>MTM</td>
                                        {
                                            Object.keys(DerivativeMtmData["Voyage Days Count"]).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (DerivativeMtmData["Voyage Days Count"] && Object.keys(DerivativeMtmData["Voyage Days Count"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={DerivativeMtmData?.['MTM']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{DerivativeMtmData?.['MTM']?.[value] ? formatAmount(parseFloat(DerivativeMtmData?.['MTM']?.[value]).toFixed(2)) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Daily Change</td>
                                        {
                                            Object.keys(DerivativeMtmData["Voyage Days Count"]).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (DerivativeMtmData["Voyage Days Count"] && Object.keys(DerivativeMtmData["Voyage Days Count"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={DerivativeMtmData?.['Daily Change']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "green", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{DerivativeMtmData?.['Daily Change']?.[value] ? formatAmount(parseFloat(DerivativeMtmData?.['Daily Change']?.[value]).toFixed(2)) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    }

                    {categorySelected.includes("Physical Bunker MTM") &&

                        <div style={{ minWidth: "500px", maxWidth: containerWidth.containerWidthForPhysicalBunkerMtm, overflow: "auto" }}>

                            <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>{"Physical Bunker MTM"}</div>
                            <Table bordered responsive style={{ border: "3px solid black" }}>
                                <tbody>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "black", color: "white", width: "150px" }} className={"table-row-header"}>Position</td>
                                        {
                                            Object.keys(physicalBunkerData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (physicalBunkerData["Quantity"] && Object.keys(physicalBunkerData["Quantity"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={{ backgroundColor: "black", color: "white", textAlign: "center" }} className={"table-row-header"} key={index}>{value}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "black" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Days</td>
                                        {
                                            Object.keys(physicalBunkerData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (physicalBunkerData["Quantity"] && Object.keys(physicalBunkerData["Quantity"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={physicalBunkerData?.['Quantity']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{physicalBunkerData?.['Quantity']?.[value] ? formatAmount(Math.ceil(physicalBunkerData?.['Quantity']?.[value])) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Daily Change</td>
                                        {
                                            Object.keys(physicalBunkerData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (physicalBunkerData["Quantity"] && Object.keys(physicalBunkerData["Quantity"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={physicalBunkerData?.['Quantity Daily Change']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "green", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{physicalBunkerData?.['Quantity Daily Change']?.[value] ? formatAmount(Math.ceil(physicalBunkerData?.['Quantity Daily Change']?.[value])) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>MTM</td>
                                        {
                                            Object.keys(physicalBunkerData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (physicalBunkerData["Quantity"] && Object.keys(physicalBunkerData["Quantity"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={physicalBunkerData?.['MTM']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{physicalBunkerData?.['MTM']?.[value] ? formatAmount(parseFloat(physicalBunkerData?.['MTM']?.[value]).toFixed(2)) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Daily Change</td>
                                        {
                                            Object.keys(physicalBunkerData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (physicalBunkerData["Quantity"] && Object.keys(physicalBunkerData["Quantity"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={physicalBunkerData?.['Daily Change']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "green", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{physicalBunkerData?.['Daily Change']?.[value] ? formatAmount(parseFloat(physicalBunkerData?.['Daily Change']?.[value]).toFixed(2)) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    }
                    {categorySelected.includes("Derivative Bunker MTM") &&

                        <div style={{ minWidth: "500px", maxWidth: containerWidth.containerWidthForDerivativeBunkerMtm, overflow: "auto" }}>

                            <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>{"Derivative Bunker MTM"}</div>
                            <Table bordered responsive style={{ border: "3px solid black" }}>
                                <tbody>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "black", color: "white", width: "150px" }} className={"table-row-header"}>Position</td>
                                        {
                                            Object.keys(derivativeBunkerData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (derivativeBunkerData["Days"] && Object.keys(derivativeBunkerData["Days"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={{ backgroundColor: "black", color: "white", textAlign: "center" }} className={"table-row-header"} key={index}>{value}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "black" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Days</td>
                                        {
                                            Object.keys(derivativeBunkerData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (derivativeBunkerData["Days"] && Object.keys(derivativeBunkerData["Days"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={derivativeBunkerData?.['Days']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{derivativeBunkerData?.['Days']?.[value] ? formatAmount(Math.ceil(derivativeBunkerData?.['Days']?.[value])) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Daily Change</td>
                                        {
                                            Object.keys(derivativeBunkerData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (derivativeBunkerData["Days"] && Object.keys(derivativeBunkerData["Days"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={derivativeBunkerData?.['Days Daily Change']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "green", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{derivativeBunkerData?.['Days Daily Change']?.[value] ? formatAmount(Math.ceil(derivativeBunkerData?.['Days Daily Change']?.[value])) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>MTM</td>
                                        {
                                            Object.keys(derivativeBunkerData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (derivativeBunkerData["Days"] && Object.keys(derivativeBunkerData["Days"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={derivativeBunkerData?.['MTM']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{derivativeBunkerData?.['MTM']?.[value] ? formatAmount(parseFloat(derivativeBunkerData?.['MTM']?.[value]).toFixed(2)) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white", width: "150px" }} className={"table-row-header"}>Daily Change</td>
                                        {
                                            Object.keys(derivativeBunkerData).length > 0 ? (
                                                (() => {
                                                    const physicalKeys = (derivativeBunkerData["Days"] && Object.keys(derivativeBunkerData["Days"])) || [];

                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...physicalKeys]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Total" keys by placing them at the end
                                                        const isTotalA = a.startsWith('Total');
                                                        const isTotalB = b.startsWith('Total');

                                                        if (isTotalA && !isTotalB) return 1; // "Total" goes after all other items
                                                        if (!isTotalA && isTotalB) return -1; // "Total" goes after all other items
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        isExpired(value) === "Expired" ? null :
                                                            <td style={derivativeBunkerData?.['Daily Change']?.[value].toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9", } : { color: "green", textAlign: "center", backgroundColor: "#d9d9d9", }} className={"table-row-header"} key={index}>{derivativeBunkerData?.['Daily Change']?.[value] ? formatAmount(parseFloat(derivativeBunkerData?.['Daily Change']?.[value]).toFixed(2)) : '-'}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "#d9d9d9" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    }
                    {categorySelected.includes("Baltic Index Data") &&

                        <div style={{ minWidth: "500px", maxWidth: "1250px", overflow: "auto" }}>

                            <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>{"Baltic FFA Data"}</div>
                            <Table bordered responsive style={{ border: "3px solid black" }}>
                                <tbody>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#806000", color: "white", width: "120px" }} className={"table-row-header"}>Route Name</td>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#806000", color: "white" }} className={"table-row-header"}>Spot</td>
                                        {
                                            balticIndexMonths.length > 0 ? (
                                                (() => {


                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...balticIndexMonths]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        <td style={{ backgroundColor: "#806000", color: "white", textAlign: "center" }} className={"table-row-header"} key={index}>{value}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "black" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>

                                    {balticData.length > 0 && balticData.map((singleBalticData: any) => {
                                        return (
                                            <tr>
                                                <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white" }} className={"table-row-header"}>{singleBalticData.routeName}</td>
                                                <td style={{ textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{singleBalticData.spotValue}</td>
                                                {balticIndexMonths.map((data: any, index: number) => {
                                                    return (

                                                        <td style={{ color: "black", textAlign: "center", backgroundColor: "#d9d9d9" }} className={"table-row-header"} key={index}>{singleBalticData[data] || "-"}</td>
                                                    )
                                                })

                                                }
                                            </tr>
                                        )
                                    })

                                    }




                                </tbody>
                            </Table>
                        </div>
                    }
                    {categorySelected.includes("Fuel Index Data") &&

                        <div style={{ minWidth: "500px", maxWidth: "1500px", overflow: "auto" }}>

                            <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>{"Fuel Index Data"}</div>
                            <Table bordered responsive style={{ border: "3px solid black" }}>
                                <tbody>

                                    <tr>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#806000", color: "white" }} className={"table-row-header"}>Port Name</td>
                                        <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#806000", color: "white" }} className={"table-row-header"}>Spot</td>
                                        {
                                            fuelIndexMonths.length > 0 ? (
                                                (() => {


                                                    // Combine all keys into a set and convert to array
                                                    const uniqueKeys = Array.from(new Set([...fuelIndexMonths]));

                                                    // Define month order for sorting
                                                    const monthOrder: any = {
                                                        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                                                        'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
                                                    };

                                                    // Sort the keys by year and month
                                                    uniqueKeys.sort((a: string, b: string) => {
                                                        // Handle "Cal" keys separately by assigning a high priority
                                                        const isCalA = a.startsWith('Cal');
                                                        const isCalB = b.startsWith('Cal');

                                                        if (isCalA && isCalB) {
                                                            // Both are "Cal", sort by year
                                                            const yearA = parseInt(a.split(" ")[1]);
                                                            const yearB = parseInt(b.split(" ")[1]);
                                                            return yearA - yearB;
                                                        }
                                                        if (isCalA) return 1; // "Cal" goes after months and quarters
                                                        if (isCalB) return -1; // "Cal" goes after months and quarters

                                                        // Split keys into parts
                                                        const [partA, yearA] = a.split(" ");
                                                        const [partB, yearB] = b.split(" ");

                                                        // Parse years
                                                        const yearDiff = parseInt(yearA) - parseInt(yearB);
                                                        if (yearDiff !== 0) return yearDiff; // Sort by year if different

                                                        // Handle quarters
                                                        const isQuarterA = partA.startsWith('Q');
                                                        const isQuarterB = partB.startsWith('Q');
                                                        if (isQuarterA && isQuarterB) {
                                                            return parseInt(partA[1]) - parseInt(partB[1]); // Sort quarters numerically
                                                        }
                                                        if (isQuarterA) return 1; // Quarters go after months
                                                        if (isQuarterB) return -1; // Quarters go after months

                                                        // Sort months
                                                        return (monthOrder[partA] || 0) - (monthOrder[partB] || 0);
                                                    });

                                                    return uniqueKeys.map((value, index) => (
                                                        <td style={{ backgroundColor: "#806000", color: "white", textAlign: "center", minWidth: "100px" }} className={"table-row-header"} key={index}>{value}</td>
                                                    ));
                                                })()
                                            ) : (
                                                <td style={{ textAlign: "center", backgroundColor: "black" }}>No Records Found</td>
                                            )
                                        }


                                    </tr>

                                    {fuelIndexData.length > 0 && fuelIndexData.map((singleFuelIndexData: any) => {
                                        return (
                                            <tr>
                                                <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "#295285", color: "white" }} className={"table-row-header"}>{singleFuelIndexData.port}</td>
                                                <td style={{ textAlign: "center", paddingRight: "10px", color: "black", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{singleFuelIndexData.spotValue}</td>
                                                {fuelIndexMonths.map((data: any, index: number) => {
                                                    return (

                                                        <td style={{ color: "black", textAlign: "center", backgroundColor: "#d9d9d9" }} className={"table-row-header"} key={index}>{isNaN(singleFuelIndexData[data]) ? "-" : (parseFloat(singleFuelIndexData[data] + 20))}</td>
                                                    )
                                                })

                                                }
                                            </tr>
                                        )
                                    })

                                    }




                                </tbody>
                            </Table>
                        </div>
                    }
                    {categorySelected.includes("Operations Data") &&

                        <div style={{ minWidth: "500px", maxWidth: "1600px", overflow: "auto" }}>

                            <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "10px" }}>{"Operation Fixture"}</div>
                            <Table bordered responsive style={{ border: "3px solid black" }}>
                                <tbody>

                                    <tr>
                                        {["FIX IN", "TYPE", "ADJUSTER", "DELIVERY DATE", "MIN", "MAX", "Min-Bal", "Max-Bal", "In books", "FIX OUT", "VOYAGE NO", "CHTR", "MIN", "MAX", "IN BOOKS", "Redel", "Bal days"]
                                            .map((value: any) => {
                                                return (
                                                    <td style={{ textAlign: "left", paddingRight: "10px", backgroundColor: "black", color: "white" }} className={"table-row-header"}>{value.toUpperCase()}</td>

                                                )
                                            })

                                        }


                                    </tr>
                                    {operationFixtureDatas.length > 0 ? operationFixtureDatas.map((fixtureDatas: any) => {
                                        return (
                                            <tr>
                                                <td style={{ color: "white", textAlign: "left", backgroundColor: "#295285" }} className={"table-row-header"}>{fixtureDatas.vesselName || "-"}</td>
                                                <td style={{ color: "black", textAlign: "left", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{fixtureDatas.freightType || "-"}</td>
                                                <td style={{ color: "black", textAlign: "center", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{fixtureDatas.indexPercentage || "-"}</td>
                                                <td style={{ color: "black", textAlign: "left", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{formatDate(fixtureDatas.deliveryDate) || "-"}</td>
                                                <td style={{ color: "black", textAlign: "left", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{formatDate(fixtureDatas.redeliveryMinDate) || "-"}</td>
                                                <td style={{ color: "black", textAlign: "left", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{formatDate(fixtureDatas.redeliveryMaxDate) || "-"}</td>
                                                <td style={fixtureDatas.redeliveryMinNumber.toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9" } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{formatAmount(parseFloat(fixtureDatas.redeliveryMinNumber).toFixed(2)) || "-"}</td>
                                                <td style={fixtureDatas.redeliveryMaxNumber.toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9" } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{formatAmount(parseFloat(fixtureDatas.redeliveryMaxNumber).toFixed(2)) || "-"}</td>
                                                <td style={{ color: "black", textAlign: "left", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{formatDate(fixtureDatas.redeliveryDate) || "-"}</td>
                                                <td style={{ color: "white", textAlign: "left", backgroundColor: "#295285" }} className={"table-row-header"}>{fixtureDatas.vesselName || "-"}</td>
                                                <td style={{ color: "black", textAlign: "left", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{fixtureDatas.outVoyageNo || "-"}</td>
                                                <td style={{ color: "black", textAlign: "left", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{fixtureDatas.charterer || "-"}</td>
                                                <td style={{ color: "black", textAlign: "left", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{formatDate(fixtureDatas.outRedeliveryMinDate) || "-"}</td>
                                                <td style={{ color: "black", textAlign: "left", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{formatDate(fixtureDatas.outRedeliveryMaxDate) || "-"}</td>
                                                <td style={{ color: "black", textAlign: "left", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{formatDate(fixtureDatas.outRedeliveryDate) || "-"}</td>
                                                <td style={{ color: "black", textAlign: "left", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{fixtureDatas.redeliveryPort || "-"}</td>
                                                <td style={fixtureDatas.outRedeliveryMinNumber.toString().startsWith("-") ? { color: "red", textAlign: "center", backgroundColor: "#d9d9d9" } : { color: "black", textAlign: "center", backgroundColor: "#d9d9d9" }} className={"table-row-header"}>{formatAmount(parseFloat(fixtureDatas.outRedeliveryMinNumber).toFixed(2)) || "-"}</td>
                                            </tr>
                                        )
                                    })

                                        : (
                                            <tr>

                                                <td colSpan={17} style={{ textAlign: "center", border: "none", backgroundColor: "#d9d9d9" }}>No Records Found</td>

                                            </tr>
                                        )}




                                </tbody>
                            </Table>
                        </div>
                    }
                </div>
                <div style={{ paddingLeft: "45%", marginTop: "10px" }}>
                    <ButtonComponent
                        title={"Download"}
                        height='45px'
                        width='150px'
                        backgroundColor='#295285'
                        color='white'
                        className={"button-component common-btn"}
                        handleClick={() => {
                            // saveInvoice()
                            // printPDF()
                            // setIsLoading(true)
                            hideModal(false)
                            setIsDownloading(true)
                            setPrintEnable(true)
                            handleDownloadPDF()

                        }}
                    />
                </div>


            </div>
        </div>
    )
}