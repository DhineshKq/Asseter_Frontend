import React, { createContext, useContext, useEffect, useState } from "react";

const WorkspaceContext = createContext<any>(null);

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
    const [workspaceId, setWorkspaceId] = useState(localStorage.getItem("workspaceId") || null);

    useEffect(() => {
        if (workspaceId) {
            localStorage.setItem("workspaceId", workspaceId);
        }
    }, [workspaceId]);

    return (
        <WorkspaceContext.Provider value={{ workspaceId, setWorkspaceId }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => useContext(WorkspaceContext);