export const resetFormModified = (data: boolean) => {
    return {
        type: "RESET_FORM_MODIFIED",
        payload: data,
    };
};

export const VesselDetailsUpdator = (data: any) => {
    return {
        type: "VESSEL_DETAILS_MODIFIED",
        payload: data,
    };
};

export const NoonReportsDetailsUpdator = (data: any) => {
    return {
        type: "NOON_REPORTS_DETAILS",
        payload: data,
    };
};

export const Permission = (data: any) => {
    return {
        type: "PERMISSION_DATA",
        payload: data,
    };
};

export const NavigateFinalPandL = (data: any) => {
    return {
        type: "FINAL_PANDL",
        payload: data,
    };
};
export const NavigateFinalPandLRealised = (data: any) => {
    return {
        type: "FINAL_PANDL_REALISED",
        payload: data,
    };
};