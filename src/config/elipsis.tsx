import React from "react";

const CustomEllipsisRenderer: React.FC<any> = (params: any) => {
    const value = params.value || "";
    const maxLength = 30; // Maximum characters allowed before truncation

    let displayValue = value;
    if (value.length > maxLength) {
        displayValue = value.substring(0, maxLength) + "...";
    }

    const cellStyle: React.CSSProperties = {
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        paddingRight: "3px",
    };

    return <div style={cellStyle}>{displayValue}</div>;
};

export default CustomEllipsisRenderer;