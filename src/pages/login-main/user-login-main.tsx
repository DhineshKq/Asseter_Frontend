import React, { useState } from 'react'
import UserLogin from '../../components/login-component/user-login'
import ForgotPassword from '../../components/login-component/forgot-password'
import ForgotPasswordEmailSent from '../../components/login-component/forgot-password-success-page'

export default function UsersLoginMain() {

    const [loginNavigation, setLoginNavigation] = useState<string>("login")
    return (
        <div>
            {loginNavigation === "login" &&
                <UserLogin
                    handleclick={(val) => {
                        setLoginNavigation(val)
                    }}
                />

            }
            {loginNavigation === "forgotPassword" &&
                <ForgotPassword
                    handleclick={(val) => {
                        setLoginNavigation(val)
                    }}
                />

            }
            {loginNavigation === "passwordGenerated" &&
                <ForgotPasswordEmailSent
                    handleclick={(val) => {
                        setLoginNavigation(val)
                    }}
                />

            }
        </div>
    )
}
