import { createContext, useState } from "react";

interface ChangemodalContextType {
    showChangesModal: boolean;
    setShowChangesModal: React.Dispatch<React.SetStateAction<boolean>>;
    isFormDirty: boolean;
    setIsFormDirty: React.Dispatch<React.SetStateAction<boolean>>;
  }
  
  const ChangemodalContext = createContext<ChangemodalContextType>({
    showChangesModal: false,
    setShowChangesModal: () => {},
    isFormDirty: false,
    setIsFormDirty: () => {},
  });

interface Props {
    children?: React.ReactNode;
}

export const ChangemodalProvider = ({ children }:Props) => {
    const [showChangesModal, setShowChangesModal] = useState(false);
    const [isFormDirty, setIsFormDirty] = useState(false);

    return (
        <ChangemodalContext.Provider value={{ showChangesModal, setShowChangesModal, isFormDirty, setIsFormDirty }}>
            {children}
        </ChangemodalContext.Provider>
    )
}

export default ChangemodalContext;