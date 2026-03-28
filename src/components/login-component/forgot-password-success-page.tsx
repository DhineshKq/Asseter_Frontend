import React from "react";
import "../../styles/login-component/forgot-password.scss";
import emailGif from "../../assets/gif/email.gif";
import TabTitle from "../common-component/form-elements/tab-title";


interface propsType {
  handleclick: (val: string) => void;
}
export default function ForgotPasswordEmailSent({ handleclick }: propsType) {
  return (
    <div className="forgotPasswordPage">
      <div className="forgotPassword-shell success-shell">
        <div className="forgotPassword-box success-box">
          <div className="success-icon-wrap">
            <img className="emailLogo formSpace1" draggable={false} src={emailGif} alt="Email sent" />
          </div>
          <div className="forgotPassword-kicker">InfraPilot 360 Recovery</div>
          <div className="forgotPassword-title">Check Your Email</div>
          <div>
            <p className="contents">
              We&apos;ve emailed you a new password to your registered email address. You should receive it shortly.
            </p>
          </div>
          <div className="col-auto formSpace success-action">
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
      </div>
      {
        <TabTitle
          title={"Forgot Password"}
        />
      }
    </div>
  );
}
