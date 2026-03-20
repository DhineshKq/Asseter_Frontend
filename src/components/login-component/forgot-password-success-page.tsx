import React from "react";
import "../../styles/login-component/forgot-password.scss";
import loginHeaderImage from "../../assets/images/KQ_Logo.svg";
import { useNavigate } from "react-router-dom";
import emailGif from "../../assets/gif/email.gif";
import TabTitle from "../common-component/form-elements/tab-title";


interface propsType {
  handleclick: (val: string) => void;
}
export default function ForgotPasswordEmailSent({ handleclick }: propsType) {
  const navigate = useNavigate();
  return (
    <div className="forgotPasswordPage">
      <div className="forgotPassword-box">
        <div style={{ paddingLeft: "50px" }}>
          <div className="formSpace1">
            <img
              src={loginHeaderImage}
              className="img-fluid netbulkLogo"
              alt="..."
            />
          </div>
          <div>
            <img className="emailLogo formSpace1" draggable={false} src={emailGif}></img>
          </div>
          <div>
            <p className="contents">
              We've emailed you a new password to your registered  <br />
              email address. You should receive it shortly.
            </p>
          </div>
          <div className="col-auto formSpace">
            <button
              type="submit"
              className="btn btn-primary mb-3 loginBtn "
              onClick={() => {
                handleclick("login"); 
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
                  handleclick("login");
                }
              }}
              tabIndex={0}
            >
              Back to Login
            </button>
          </div>
        </div>
        <div className="blue"></div>
      </div>
      <br />
      <div className="forgotPassshadow"></div>
      {
        <TabTitle
          title={"Forgot Password"}
        />
      }
    </div>
  );
}
