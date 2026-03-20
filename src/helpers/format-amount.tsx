// Function for shows a amount in formatted type
export const formatAmount = (amount: any) => {
    if (amount !== undefined && amount !== null) {
        // If the amount is just a dot, return it as is
        if (amount === ".") {
            return ".";
        }

        // Remove any non-numeric characters except for dots
        const onlyNumber: any = amount.toString().replace(/[^0-9.]/g, "");

        // Handle empty input after removing non-numeric characters
        if (onlyNumber === "") {
            return "";
        }

        // Split input into integer and decimal parts
        const parts = onlyNumber.split(".");
        const integerPart = parts[0];
        const decimalPart = parts[1] || "";

        // Format the integer part with commas
        const formattedInteger = integerPart ? parseFloat(integerPart).toLocaleString() : "";

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

// Function for shows a amount in comma seperator type
export const commaSeperator = (value: any) => {
    if (value === undefined || value === null) {
        return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatAmountNegative = (amount: any) => {
    if (amount !== undefined && amount !== null) {
        // If the amount is just a dot, return it as is
        if (amount === ".") {
            return ".";
        }

        // Remove any non-numeric characters except for dots and negative sign
        const onlyNumber: any = amount.toString().replace(/[^0-9.-]/g, "");

        // Handle empty input after removing non-numeric characters
        if (onlyNumber === "") {
            return "";
        }

        // Split input into integer and decimal parts
        const parts = onlyNumber.split(".");
        const integerPart = parts[0];
        const decimalPart = parts[1] || "";

        // Handle negative sign
        const isNegative = integerPart.startsWith("-");
        const unsignedIntegerPart = isNegative ? integerPart.slice(1) : integerPart;

        // Format the unsigned integer part with commas
        const formattedUnsignedInteger = unsignedIntegerPart ? parseFloat(unsignedIntegerPart).toLocaleString() : "";

        // Handle complete decimal input (e.g., "5000.50")
        if (decimalPart !== "") {
            return `${isNegative ? '-' : ''}${formattedUnsignedInteger}.${decimalPart}`;
        }

        // Handle incomplete decimal input (e.g., "5000.")
        if (amount.toString().endsWith(".")) {
            return `${isNegative ? '-' : ''}${formattedUnsignedInteger}.`;
        }

        // Return formatted amount with negative sign if applicable
        return `${isNegative ? '-' : ''}${formattedUnsignedInteger}`;
    }

    return "";
};
