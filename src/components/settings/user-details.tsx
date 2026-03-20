import React, { useEffect, useState } from 'react'
import ButtonComponent from '../../components/common-component/form-elements/button-component';
import '../../styles/pages/settings/user-detail.scss'
import { axiosPrivate } from '../../middleware/axios-api';
import Alertbox from '../../components/common-component/modals/alertbox-modal';
import { useCommonData } from '../../services/context/useContext';


export default function UserDetails() {
    const { currentLoggedUserData } = useCommonData();
    const userID = currentLoggedUserData.userID;

    const clearAleart = (status: any) => {
        const timer = setTimeout(() => {
            setShowAlertBox(false)
            setShowMessage("");
            clearTimeout(timer);
        }, 5000);
    }
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [showAlertBox, setShowAlertBox] = useState(false)
    const [showMessage, setShowMessage] = useState<string>("")
    const [showType, setShowType] = useState("warning")
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [mobileError, setMobileError] = useState('');
    const [subscriptionPlans, setSubscriptionPlans] = useState<string[]>([]); // array of plan names
    const [selectedPlan, setSelectedPlan] = useState({}); // currently selected plan
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { setCurrentLoggedUserData } = useCommonData();
    const [newPasswordError, setNewPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const isPasswordFormInvalid = !currentPassword || !!newPasswordError || !!confirmPasswordError;
    const isFormInvalid = !firstName || !lastName || !!usernameError || !!emailError || !!mobileError;


    const validateNewPassword = (val: string) => {
        setNewPasswordError(val.length < 6 ? "Password must be at least 6 characters." : "");
    };

    const validateConfirmPassword = (val: string) => {
        setConfirmPasswordError(val !== newPassword ? "Passwords do not match." : "");
    };

    const validateUsername = (val: string) => {
        const usernameRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!usernameRegex.test(val)) {
            setUsernameError(
                "Username must be at least 8 characters, include uppercase, lowercase, and a number."
            );
        } else {
            setUsernameError('');
        }
    };

    const validateEmail = (val: string) => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setEmailError(pattern.test(val) ? '' : 'Invalid email format');
    };

    const validateMobile = (val: string) => {
        setMobileError(val.length === 10 ? '' : 'Mobile number must be 10 digits');
    };

    useEffect(() => {
        getUserById();
        getAllPlans()
    }, []);

    async function getAllPlans() {
        try {
            const response = await axiosPrivate.get('/getAllPlans');

            if (response.data.status) {
                const plans = response.data.data.map((item: any) => item.plan); // Extract "plan" field
                setSubscriptionPlans(plans); // ✅ Save array of plan names
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
        }
    }

    async function getUserById() {
        try {
            const response = await axiosPrivate.get(`/getProfileData`);

            if (response.data.status) {
                const user = response.data.data;
                setFirstName(user.firstName || '');
                setLastName(user.lastName || '');
                setUsername(user.userName || '');
                setEmail(user.email || '');
                setMobile(user.mobileNumber || '');
                setSelectedPlan({ label: user.subscriptionPlan, value: user.subscriptionPlan })
                userData()
            } else {
                setShowAlertBox(true);
                setShowType("warning");
                setShowMessage("Failed to fetch user data.");
                clearAleart(false);
            }
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            setShowAlertBox(true);
            setShowType("danger");
            setShowMessage("Server error while fetching user.");
            clearAleart(false);
        }
    }

    async function userData() {
        try {
            const res = await axiosPrivate.get('/userData');
            if (res.status === 200) {
                const { userID, name, userName, isAdmin } = res.data.data;

                setCurrentLoggedUserData((prevData: any) => ({
                    ...prevData,
                    userID: userID || prevData.userID,
                    isAdmin: isAdmin ?? prevData.isAdmin,
                    userName: userName ?? prevData.userName,
                    name: name ?? prevData.name,
                }));
            }
        } catch (error: any) {
            console.error("Error fetching user data:", error);
        }
    }

    const handleUserSubmit = async () => {
        try {
            const response = await axiosPrivate.put(`/updateUsers/${userID}`, {
                firstName,
                lastName,
                userName: username,
                email,
                mobileNumber: mobile,
                subscriptionPlan: selectedPlan
            });

            if (response.data.status) {
                setShowType("success");
                setShowMessage("User updated successfully!");
                setShowAlertBox(true);
                // setOriginalRowData("");
            } else {
                setShowType("warning");
                setShowMessage("Failed to update user");
                setShowAlertBox(true);
            }

            clearAleart(true);
        } catch (error: any) {
            setShowType("danger");
            const msg = error?.response?.data?.message || "Something went wrong";
            setShowMessage(msg);
            setShowAlertBox(true);
            clearAleart(false);
        }
        getUserById()
    };

    const handlePasswordSubmit = async () => {
        try {
            const response = await axiosPrivate.put(`/updatePassword`, {
                newPassword: newPassword,
                confirmPassword: confirmPassword,
                currentPassword: currentPassword
            });

            if (response.data.status) {
                setShowType("success");
                setShowMessage("Password updated successfully!");
                setShowAlertBox(true);
                // setOriginalRowData("");
            } else {
                setShowType("warning");
                setShowMessage("Failed to update password");
                setShowAlertBox(true);
            }
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
            clearAleart(true);
        } catch (error: any) {
            setShowType("danger");
            const msg = error?.response?.data?.message || "Something went wrong";
            setShowMessage(msg);
            setShowAlertBox(true);
            clearAleart(false);
        }
        getUserById()
    };

    return (
        <div>
            {
                <div style={{ display: 'flex', flexDirection: 'row', gap: "20px" }}>

                    {/* User Details */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div className="subHeading">User Details</div>
                        <div className={"user-form-container"}>
                            <div className="form-layout">
                                {/* First Name */}
                                <div className="form-group">
                                    <label htmlFor="firstName" className="form-label fieldLabel">First Name</label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        autoFocus
                                        autoComplete="off"
                                        className="form-control form-input"
                                        placeholder="Enter first name"
                                        maxLength={50}
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="form-group">
                                    <label htmlFor="lastName" className="form-label fieldLabel">Last Name</label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        autoComplete="off"
                                        className="form-control form-input"
                                        placeholder="Enter last name"
                                        maxLength={50}
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>

                                {/* Username */}
                                <div className="form-group">
                                    <label htmlFor="username" className="form-label fieldLabel">Username</label>
                                    <input
                                        id="username"
                                        type="text"
                                        autoComplete="off"
                                        className={`form-control form-input ${usernameError ? 'is-invalid' : ''}`}
                                        placeholder="Enter username"
                                        maxLength={30}
                                        value={username}
                                        disabled={true}
                                        onChange={(e) => {
                                            const val = e.target.value.trim();
                                            setUsername(val);
                                            validateUsername(val);
                                        }}
                                        onKeyDown={(e) => [" ", ","].includes(e.key) && e.preventDefault()}
                                        aria-invalid={!!usernameError}
                                    />
                                    {usernameError && <div className="invalid-feedback">{usernameError}</div>}
                                </div>

                                {/* Email */}
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label fieldLabel">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="off"
                                        className={`form-control form-input ${emailError ? 'is-invalid' : ''}`}
                                        placeholder="Enter email"
                                        maxLength={100}
                                        value={email}
                                        disabled={true}
                                        onChange={(e) => {
                                            const val = e.target.value.trim();
                                            setEmail(val);
                                            validateEmail(val);
                                        }}
                                        aria-invalid={!!emailError}
                                    />
                                    {emailError && <div className="invalid-feedback">{emailError}</div>}
                                </div>

                                {/* Mobile */}
                                <div className="form-group">
                                    <label htmlFor="mobile" className="form-label fieldLabel">Mobile Number</label>
                                    <input
                                        id="mobile"
                                        type="tel"
                                        autoComplete="off"
                                        className={`form-control form-input ${mobileError ? 'is-invalid' : ''}`}
                                        placeholder="Enter mobile number"
                                        maxLength={10}
                                        value={mobile}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, ''); // remove non-digits
                                            setMobile(val);
                                            validateMobile(val);
                                        }}
                                        aria-invalid={!!mobileError}
                                    />
                                    {mobileError && <div className="invalid-feedback">{mobileError}</div>}
                                </div>
                            </div>
                            <div className={"buttons"}>
                                <ButtonComponent
                                    title={"Update Details"}
                                    height={"50px"}
                                    width={"160px"}
                                    backgroundColor={"var(--btn-primary-bg)"}
                                    color={"white"}
                                    margin={"0px"}
                                    className={"button-component-hover common-btn"}
                                    handleClick={handleUserSubmit}
                                    disabled={isFormInvalid}
                                />
                            </div>

                        </div>
                    </div>

                    {/* Change Password  */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div className="subHeading">Change Password</div>
                        <div className="user-form-container">
                            <div className="form-layout">
                                {/* Current Password */}
                                <div className="form-group">
                                    <label htmlFor="currentPassword" className="form-label fieldLabel">Current Password</label>
                                    <input
                                        id="currentPassword"
                                        type="password"
                                        autoComplete="off"
                                        className="form-control form-input"
                                        placeholder="Enter current password"
                                        maxLength={50}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>

                                {/* New Password */}
                                <div className="form-group">
                                    <label htmlFor="newPassword" className="form-label fieldLabel">New Password</label>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        autoComplete="off"
                                        className={`form-control form-input ${newPasswordError ? 'is-invalid' : ''}`}
                                        placeholder="Enter new password"
                                        maxLength={50}
                                        value={newPassword}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setNewPassword(val);
                                            validateNewPassword(val);
                                        }}
                                    />
                                    {newPasswordError && <div className="invalid-feedback">{newPasswordError}</div>}
                                </div>

                                {/* Confirm Password */}
                                <div className="form-group">
                                    <label htmlFor="confirmPassword" className="form-label fieldLabel">Confirm Password</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        autoComplete="off"
                                        className={`form-control form-input ${confirmPasswordError ? 'is-invalid' : ''}`}
                                        placeholder="Confirm new password"
                                        maxLength={50}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setConfirmPassword(val);
                                            validateConfirmPassword(val);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handlePasswordSubmit();
                                            }
                                        }}
                                    />
                                    {confirmPasswordError && <div className="invalid-feedback">{confirmPasswordError}</div>}
                                </div>
                            </div>

                            {/* Update Password Button */}
                            <div className="buttons" style={{ marginTop: "105px" }}>
                                <ButtonComponent
                                    title="Update Password"
                                    height="50px"
                                    width="160px"
                                    backgroundColor="var(--btn-primary-bg)"
                                    color="white"
                                    margin="0px"
                                    className="button-component-hover common-btn"
                                    handleClick={handlePasswordSubmit}
                                // disabled={isPasswordFormInvalid}
                                />
                            </div>
                        </div>
                    </div>

                </div>

            }{
                showAlertBox &&
                <div className='alert-warp'>
                    <Alertbox type={showType} message={showMessage} />
                </div>
            }


        </div>
    )

};
