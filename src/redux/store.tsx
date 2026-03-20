import { createStore } from "redux";

// Initial state
const initialState = {
    isFormModified: false,
    anVesselDetails: null,
    noonReportsDetails: null,
    finalPandL: null,
    finalPandLRealised: null,
    Permission: {
        accessType: "Read Only"
    },
};

// Reducer
const formReducer = (state = initialState, action: { type: any; payload: any; }) => {
    switch (action.type) {
        case "RESET_FORM_MODIFIED":
            return {
                ...state,
                isFormModified: action.payload,
            };
        case "VESSEL_DETAILS_MODIFIED":
            return {
                ...state,
                anVesselDetails: action.payload,
            };
        case "NOON_REPORTS_DETAILS":
            return {
                ...state,
                noonReportsDetails: action.payload,
            };
        case "PERMISSION_DATA":
            return {
                ...state,
                Permission: action.payload,
            };
        case "FINAL_PANDL":
            return {
                ...state,
                finalPandL: action.payload,
            };
        case "FINAL_PANDL_REALISED":
            return {
                ...state,
                finalPandLRealised: action.payload,
            };
        default:
            return {
                ...state,
                // Preserve Permission data for all other actions
                Permission: state.Permission,
            };
    }
};

// Create the store
const store = createStore(formReducer);

export default store;