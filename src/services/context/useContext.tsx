import { createContext, useContext } from 'react'
// Create the context with the default value as undefined
export const CommonData = createContext<any>(undefined);
 
// Custom hook to use the CommonData context
export const useCommonData = (): any => {
    const context = useContext(CommonData);
    if (!context) {
        throw new Error('useCommonData must be used within a CommonData.Provider');
    }
    return context;
};