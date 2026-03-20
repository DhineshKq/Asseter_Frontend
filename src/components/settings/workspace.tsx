import { useEffect, useState } from "react";
import '../../styles/pages/settings/environments.scss'
import { axiosPrivate } from "../../middleware/axios-api";
import ButtonComponent from "../common-component/form-elements/button-component";
import Alertbox from "../common-component/modals/alertbox-modal";
import { useCommonData } from "../../services/context/useContext";

export default function UserDetails() {
    const [newWorkspace, setNewWorkspace] = useState("");
    const [workspace, setWorkspace] = useState<any>()
    const [defaultWorkspace, setDefaultWorkspace] = useState<any>()
    const [showAlertBox, setShowAlertBox] = useState(false)
    const [showMessage, setShowMessage] = useState<string>("")
    const [showType, setShowType] = useState("warning")
    const { setCurrentLoggedUserData } = useCommonData();
    

    const clearAleart = (status: any) => {
        const timer = setTimeout(() => {
            setShowAlertBox(false)
            setShowMessage("");
            clearTimeout(timer);
        }, 5000);
    }

    async function getWorkspaceData() {
        try {
            const response = await axiosPrivate.get("/getWorkSpaces");

            if (response.data.status) {
                const options = response.data.options;
                const dfltWorkspace = response.data.defaultWorkspace;
                setWorkspace(options);
                setCurrentLoggedUserData((prev: any) => ({
                    ...prev,
                    workspaceOptions: options
                }))
                setDefaultWorkspace(dfltWorkspace?.[0]);
            }
        } catch (error) {
            console.error("Error fetching workspaces:", error);
        }
    }

    async function createWorkspace() {
        try {
          const response = await axiosPrivate.post("/createWorkSpace", {
            workspaceName: newWorkspace.trim(),
          });
      
          if (response.data.status) {
            setShowType("success");
            setShowMessage("Environment created Successfully");
            setShowAlertBox(true);
            getWorkspaceData();
            setNewWorkspace("");
          } else {
            setShowType("warning");
            setShowMessage(response.data.message || "Failed to Create Environment");
            setShowAlertBox(true);
          }
          clearAleart(true);
        } catch (error: any) {
          setShowType("danger");
      
          const msg =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Something went wrong";
      
          setShowMessage(msg);
          setShowAlertBox(true);
          clearAleart(false);
        }
      }
      

    async function deleteWorkspace(id: any) {
        try {
            const response = await axiosPrivate.delete("/deleteWorkspace", {
                data: { workspaceId: id },
            });
            if (response.data.status) {
                setShowType("success");
                setShowMessage("Environment Deleted Successfully");
                setShowAlertBox(true);
                getWorkspaceData();
            } else {
                setShowType("warning");
                setShowMessage("Failed To Delete Environment");
                setShowAlertBox(true);
            }
            clearAleart(true);
        } catch (error) {
            setShowType("danger");
            const msg: any = error;
            setShowMessage(msg);
            setShowAlertBox(true);
            clearAleart(false);
        }
    }


    async function setAsDefault(workspaceId: number) {
        try {
            const response = await axiosPrivate.put("/setDefaultWorkspace", {
                workspaceId,
            });

            if (response.data.status) {
                setShowType("success");
                setShowMessage("Default Environment update successfully");
                setShowAlertBox(true);
                getWorkspaceData(); // Refresh workspaces
            } else {
                setShowType("warning");
                setShowMessage("Failed To Update Default Environment");
                setShowAlertBox(true);
            }
            clearAleart(true);
        } catch (error) {
            setShowType("danger");
            const msg: any = error;
            setShowMessage(msg);
            setShowAlertBox(true);
            clearAleart(false);
        }
    }

    useEffect(() => {
        getWorkspaceData()
    }, []);

    return (
        <div className="tab-content">
            <div className="workspace-creation">
                <div className="form-group">
                    <label htmlFor="environment" className="form-label fieldLabel">New Environment</label>
                    <input
                        id="environment"
                        type="text"
                        autoComplete="off"
                        className="form-control form-input"
                        placeholder="Enter Environment Name"
                        maxLength={50}
                        value={newWorkspace}
                        onChange={(e) => setNewWorkspace(e.target.value)}
                    />
                </div>
                <div className="buttons">
                    <ButtonComponent
                        title="Create"
                        height="40px"
                        width="105px"
                        backgroundColor="var(--btn-primary-bg)"
                        color="white"
                        margin="0px"
                        className="button-component-hover common-btn"
                        handleClick={createWorkspace}
                    // disabled={isPasswordFormInvalid}
                    />
                </div>
            </div>
            <div className="workspace-list-container">
                {workspace && workspace.length > 0 ? (
                    workspace.map((ws: any, index: number) => {

                        const isDefault = defaultWorkspace?.label === ws.label;

                        return (
                            <div className="workspace-card" key={ws.id}>
                                <div className="window-header">
                                    <span className="dot red"></span>
                                    <span className="dot yellow"></span>
                                    <span className="dot green"></span>
                                </div>
                                <div className="workspace-info">
                                    <h4>{ws.label}</h4>
                                </div>

                                <div className="card-actions-hover">
                                    {!isDefault && (
                                        <span className="card-action-text delete" onClick={() => deleteWorkspace(ws.id)}>
                                            Delete
                                        </span>
                                    )}
                                    <span
                                        className={`card-action-text default ${isDefault ? "active" : ""}`}
                                        onClick={() => !isDefault && setAsDefault(ws.id)}
                                    >
                                        {isDefault ? "Default" : "Set as Default"}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p style={{ marginTop: "1rem" }}>No workspaces found.</p>
                )}
                {
                    showAlertBox &&
                    <div className='alert-warp'>
                        <Alertbox type={showType} message={showMessage} />
                    </div>
                }
            </div>
        </div>

    );
};