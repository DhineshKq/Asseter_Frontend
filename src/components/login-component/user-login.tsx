import React, { useEffect, useState } from 'react';
import '../../styles/login-component/user-login.scss';
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from '../../services/hooks/useaxios-private';
import Alertbox from '../common-component/modals/alertbox-modal';
import { setCookie } from '../../services/utils/cookie-utils';
import useAuth from '../../services/hooks/useauth';
import Loader from '../common-component/loader/Main-loader'
import { useCommonData } from "../../services/context/useContext";
import { getPublicIP } from '../../services/utils/getIp'

interface propsType {
    handleclick: (val: string) => void;
}
export default function UserLogin({ handleclick }: propsType) {
    const [buttonDisabled, setIsDisabled] = useState<boolean>(true)
    const [userValues, setUserValues] = useState<any>({
        email: "",
        password: ""
    })
    const [showPassword, setShowPassword] = useState<boolean>()
    const [showType, setShowType] = useState("warning")
    const [showMessage, setShowMessage] = useState<string>("")
    const [showAlertBox, setShowAlertBox] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    const { setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const { setCurrentLoggedUserData } = useCommonData();

    const toggleShowPassword = () => {
        if (userValues.password !== "") {
            setShowPassword(!showPassword);
        }
    };

    useEffect(() => {
        if (userValues.email !== "" && userValues.password !== "") {
            setIsDisabled(false)
        } else {
            setIsDisabled(true)
        }
    }, [userValues.email, userValues.password])


    async function loginData() {
        setIsLoading(true)
        try {
            const ip = await getPublicIP();
            const res = await axiosPrivate.post('/user/login', { "email": userValues.email, "password": userValues.password, ipAddress: ip })
            if (res.status === 200) {

                setCurrentLoggedUserData((prevData: any) => ({
                    ...prevData,
                    userID: res.data.userID || prevData.userID,
                    isAdmin: res.data.isAdmin || prevData.isAdmin,
                    email: res.data.userName || prevData.email,
                    name: res.data.name || prevData.name,
                }));
                setIsLoading(false)
                navigate("/dashboard")
                setAuth({
                    token: res.data.token,
                    email: res.data.email,
                    userID: res.data.userID
                })
                setCookie("token", res.data.token)
            }
        } catch (error: any) {
            setIsLoading(false) 
            setShowAlertBox(true)
            setShowType("danger")
            setShowMessage(error.response.data.error)
            setTimeout(() => {
                setShowAlertBox(false)
            }, 5000)
        }
    }

    return (

        <>
            <div className='loginPage'>
                <div className='login-shell'>
                    <section className='login-hero-panel'>
                        <div className='login-hero-badge'>Asseter Platform</div>
                        <h1>Professional asset operations, from intake to ownership.</h1>
                        <p>
                            Bring assets, locations, assignments, and users into one reliable admin workflow
                            with a cleaner operational control surface.
                        </p>
                        <div className='login-hero-points'>
                            <div className='login-hero-point'>
                                <strong>Unified Inventory</strong>
                                <span>Track physical assets, ownership, and deployment context in one place.</span>
                            </div>
                            <div className='login-hero-point'>
                                <strong>Operational Clarity</strong>
                                <span>Review status, mapped responsibility, and location visibility without switching tools.</span>
                            </div>
                            <div className='login-hero-point'>
                                <strong>Admin Ready</strong>
                                <span>Built for structured management workflows rather than simple list storage.</span>
                            </div>
                        </div>
                    </section>

                    <div className='login-container'>
                        <div className='login-box'>
                            <div className='login-box-header'>
                                <span className='login-box-kicker'>Welcome Back</span>
                                <h2>Sign In</h2>
                                <p>Use your Asseter credentials to access the admin workspace.</p>
                            </div>

                            <div className='inputs-align'>
                                <div className="formSpace">
                                    <label className='login-label'>Email</label>
                                    <input
                                        type="email"
                                        className="inputField"
                                        placeholder="Enter your email"
                                        value={userValues.email}
                                        autoFocus={true}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^A-Za-z0-9@_+-.]/g, "");
                                            setUserValues({ ...userValues, email: val });
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === ' ' || e.key === ",") {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                </div>

                                <div className="formSpace password-field-wrapper">
                                    <label className='login-label'>Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={userValues.password}
                                        className="inputField passwordInput"
                                        placeholder="Enter your password"
                                        onChange={(e) => {
                                            setUserValues({ ...userValues, password: e.target.value });
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === ' ') e.preventDefault();
                                        }}
                                        onKeyDown={(e) => {
                                            if (userValues.password !== "" && e.key === 'Enter') loginData();
                                        }}
                                    />

                                    <div className="eyeIconWrapper">
                                        {showPassword ? (
                                            <FaEyeSlash
                                                className={`eyeIconEnhanced ${userValues.password === "" ? 'disabled' : ''}`}
                                                onClick={userValues.password !== "" ? toggleShowPassword : undefined}
                                            />
                                        ) : (
                                            <FaEye
                                                className={`eyeIconEnhanced ${userValues.password === "" ? 'disabled' : ''}`}
                                                onClick={userValues.password !== "" ? toggleShowPassword : undefined}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="formSpace btnArea">
                                    <button
                                        type="submit"
                                        className="loginBtnActive"
                                        onClick={() => {
                                            if (!buttonDisabled) loginData()
                                        }}>
                                        Sign In
                                    </button>
                                </div>

                                <div className="linkArea">
                                    <p tabIndex={0} onClick={() => handleclick('forgotPassword')}>
                                        Forgot password?
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="footer">
                            <span>Version 1.0</span> &nbsp;
                            <span>&copy; KnowledgeQ Interactive Consultancy Services Pvt Ltd</span>
                        </div>
                    </div>
                </div>
            </div >
            {
                showAlertBox &&
                <div className=''>
                    <Alertbox type={showType} message={showMessage} />
                </div>

            }
            {
                isLoading &&
                <div>
                    <Loader />
                </div>
            }
            {/* {
                <TabTitle
                    title={"Login"}
                />
            } */}
        </>
    )
}
