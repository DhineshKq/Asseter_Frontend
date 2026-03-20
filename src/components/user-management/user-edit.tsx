import React, { useEffect, useState } from 'react'
import '../../styles/pages/users/users.scss'
import ButtonComponent from '../../components/common-component/form-elements/button-component';
import { axiosPrivate } from '../../middleware/axios-api';
import Alertbox from '../../components/common-component/modals/alertbox-modal';
import DropdownComponent from '../common-component/form-elements/dropdown-component';
import { v4 as uuidv4 } from 'uuid';


interface propsType {
    setassetsPageView: (val: string) => void;
    setEditAssets: (val: number) => void;
    editAssetId: string;
    setOriginalRowData: (val: string) => void;
}


export default function UserEdit({ setassetsPageView, setEditAssets, editAssetId, setOriginalRowData }: propsType) {

    const cancelActoin = () => {
        setassetsPageView("Grid")

    };
    const clearAleart = (status: any) => {
        const timer = setTimeout(() => {
            setShowAlertBox(false)
            setShowMessage("");
            clearTimeout(timer);
            setassetsPageView("Grid");
        }, 5000);
    }
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');

    const [error, setError] = useState('');
    const [showAlertBox, setShowAlertBox] = useState(false)
    const [showMessage, setShowMessage] = useState<string>("")
    const [showType, setShowType] = useState("warning")
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [mobileError, setMobileError] = useState('');
    const [subscriptionPlans, setSubscriptionPlans] = useState<string[]>([]); // array of plan names
    const [selectedPlan, setSelectedPlan] = useState({}); // currently selected plan

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                cancelActoin();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const isFormInvalid = !firstName || !lastName || !!usernameError || !!emailError || !!mobileError;
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
        if (editAssetId) {
            getUserById(editAssetId);
        }
        getAllPlans()
    }, [editAssetId]);


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

    async function getUserById(id: string) {
        try {
            const response = await axiosPrivate.get(`/getUserById/${id}`);

            if (response.data.status) {
                const user = response.data.data;
                setFirstName(user.firstName || '');
                setLastName(user.lastName || '');
                setUsername(user.userName || '');
                setEmail(user.email || '');
                setMobile(user.mobileNumber || '');
                setSelectedPlan({ label: user.subscriptionPlan, value: user.subscriptionPlan })
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
    function formatLocalDateTime(dateString: string): string {

        if (!dateString || dateString === "Not Yet Started") return 'Not Yet Started';


        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    }

    async function getUsersData() {
        try {
            const workspaceId = localStorage.getItem("workspaceId"); // 👈 get from localStorage

            const response = await axiosPrivate.get('/getUsers');

            if (response.data.status) {
                const localTimeFormattedData = response.data.data.map((item: any) => {
                    return {
                        ...item,
                        // name: `${item.firstName} ${item.lastName}`,
                        activity: formatLocalDateTime(item.activity)
                    }
                });
                setOriginalRowData(localTimeFormattedData);
            } else {
                console.log("API responded with error:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching asset data:", error);
        }
    }
    const handleSubmit = async () => {
        try {
            const response = await axiosPrivate.put(`/updateUsers/${editAssetId}`, {
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
                setOriginalRowData("");
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

        getUsersData();
    };



    return (
        <div className={"add-modal"}>
            {

                <div className={"container_user"}>
                    <h2 className='pageHeading'>Edit User</h2>
                    <div className='heading-line'></div>
                    <div className="formSpace_user">
                        {/* First Name */}
                        <div className="inputfield">
                            <label htmlFor="firstName" className="form-label fieldLabel">First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                autoFocus
                                autoComplete="off"
                                className="form-control formFormat"
                                placeholder="Enter first name"
                                maxLength={50}
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>

                        {/* Last Name */}
                        <div className="inputfield">
                            <label htmlFor="lastName" className="form-label fieldLabel">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                autoComplete="off"
                                className="form-control formFormat"
                                placeholder="Enter last name"
                                maxLength={50}
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>

                        {/* Username */}
                        <div className="inputfield">
                            <label htmlFor="username" className="form-label fieldLabel">Username</label>
                            <input
                                id="username"
                                type="text"
                                autoComplete="off"
                                className={`form-control formFormat ${usernameError ? 'is-invalid' : ''}`}
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
                        <div className="inputfield">
                            <label htmlFor="email" className="form-label fieldLabel">Email</label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="off"
                                className={`form-control formFormat ${emailError ? 'is-invalid' : ''}`}
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
                        <div className="inputfield">
                            <label htmlFor="mobile" className="form-label fieldLabel">Mobile Number</label>
                            <input
                                id="mobile"
                                type="tel"
                                autoComplete="off"
                                className={`form-control formFormat ${mobileError ? 'is-invalid' : ''}`}
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
                        <div className="inputfield" style={{ width: "100%" }} key={uuidv4()}>
                            <label htmlFor="subscription" className="form-label fieldLabel">Subscription Plan</label>
                            <DropdownComponent
                                options={subscriptionPlans.map(plan => ({
                                    label: plan,
                                    value: plan
                                }))}
                                className="custom-dropdown"
                                placeHolder={"Select Plan"}
                                width={"100%"}
                                defaultValue={selectedPlan}
                                color={"var(--input-bg)"}
                                isDisabled={false}
                                getData={(val) => {
                                    setSelectedPlan(val);
                                }}
                            />

                        </div>
                    </div>
                    <div className={"buttons"}>
                        <ButtonComponent
                            title={"Cancel"}
                            height={"50px"}
                            width={"150px"}
                            backgroundColor={"var(--btn-primary-bg)"}
                            color={"white"}
                            margin={"0px"}
                            className={"button-component-hover cancel"}
                            handleClick={cancelActoin}
                        />
                        <ButtonComponent
                            title={"Update"}
                            height={"50px"}
                            width={"150px"}
                            backgroundColor={"var(--btn-primary-bg)"}
                            color={"white"}
                            margin={"0px"}
                            className={"button-component-hover common-btn"}
                            handleClick={handleSubmit}
                            disabled={isFormInvalid}
                        />
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


}