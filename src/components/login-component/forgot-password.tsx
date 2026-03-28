import React, { useEffect, useState } from "react";
import "../../styles/login-component/forgot-password.scss";
import useAxiosPrivate from '../../services/hooks/useaxios-private';
import Alertbox from "../common-component/modals/alertbox-modal";
import Loader from '../common-component/loader/Main-loader'



interface propsType {
  handleclick: (val: string) => void;
}
export default function ForgotPassword({ handleclick }: propsType) {
  const [userEmail, setUserEmail] = useState<any>({
    email: "",

  })
  const [buttonDisabled, setIsDisabled] = useState<boolean>(true)
  const [showType, setShowType] = useState("warning") // error message showType
  const [showMessage, setShowMessage] = useState<string>("") // error message showMessage
  const [showAlertBox, setShowAlertBox] = useState(false) // error message ShowAlertBox
  const [isLoading, setIsLoading] = useState(false)
  const axiosPrivate = useAxiosPrivate();


  useEffect(() => {
    if (userEmail.email !== "") {
      setIsDisabled(false)
    } else {
      setIsDisabled(true)
    }
  }, [userEmail.email])

  //generateNewPassword function used to generate a new password through the backend while click "Request New Password" button
  async function generateNewPassword() {
    setIsLoading(true)
    try {
      const res = await axiosPrivate.post('generate/newPassword', { "email": userEmail.email })
      if (res.status === 200) {
        setIsLoading(false)
        handleclick("passwordGenerated");
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
    <div className="forgotPasswordPage">
      <div className="forgotPassword-shell">
        <div className="forgotPassword-container">
          <div className="forgotPassword-box">
            <div className="inputs-align">
              <div className="forgotPassword-kicker">InfraPilot 360 Recovery</div>
              <div className="forgotPassword-title">Forgot Password</div>

              <p className="contents">
                Enter your registered InfraPilot 360 email address and we will send a new password to that inbox.
              </p>

              <div className="formSpace">
                <label className="forgot-label">Registered Email</label>
                <input
                  type="email"
                  autoComplete="off"
                  className="form-control formFormat"
                  placeholder="Enter your registered email"
                  maxLength={100}
                  value={userEmail.email}
                  autoFocus={true}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-z0-9@_+-.]/g, "");
                    setUserEmail({ ...userEmail, email: val });
                  }}
                  onKeyPress={(e) => {
                    if (e.key === ' ' || e.key === ",") e.preventDefault();
                  }}
                  onKeyDown={(e) => {
                    if (userEmail.email !== "" && e.key === 'Enter') generateNewPassword();
                  }}
                />
              </div>

              <div className="formSpace submitBtn">
                <button
                  type="submit"
                  tabIndex={buttonDisabled ? -1 : 0}
                  className={buttonDisabled ? "btn btn-primary loginBtnDisabled" : "btn btn-primary loginBtn"}
                  onClick={() => {
                    if (!buttonDisabled) generateNewPassword();
                  }}
                >
                  Request New Password
                </button>

                <p
                  className="forgotPass"
                  onClick={() => handleclick("login")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') handleclick("login");
                  }}
                  tabIndex={0}
                >
                  Back to Login
                </p>
              </div>
            </div>
          </div>

          <div className="footer">
            <span>Version 1.0 </span>
            <span>&copy; KnowledgeQ Interactive Consultancy Services Pvt Ltd</span>
          </div>
        </div>
      </div>
      {showAlertBox && <Alertbox type={showType} message={showMessage} />}
      {isLoading && <Loader />}
    </div>

  );
}
