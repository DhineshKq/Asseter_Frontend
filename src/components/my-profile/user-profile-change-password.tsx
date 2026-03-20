import { useState } from 'react'
import InputComponent from '../common-component/form-elements/input-component';
import { IoIosEye, IoIosEyeOff } from 'react-icons/io';
import ButtonComponent from '../common-component/form-elements/button-component';
import useAxiosPrivate from '../../services/hooks/useaxios-private';
import Alertbox from '../common-component/modals/alertbox-modal';
// import Loading from '../common-component/modals/loading-screen';
import Loader from '../common-component/loader/Main-loader'
import { useDispatch } from 'react-redux';
import { resetFormModified } from '../../redux/action';
import '../../styles/pages/my-profile/user-profile-change-password.scss';

function UserProfileChangePassword() {
  const [password, setPassword] = useState<string>('')
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [isPasswordValid, setIsPasswordValid] = useState<boolean>(false)
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState<boolean>(false)
  const [isNewPasswordValid, setIsNewPasswordValid] = useState<boolean>(true)
  const [disabled, setDisabled] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [isLoadingModal, setIsLoadingModal] = useState<boolean>(false); // loading screen
  const [showType, setShowType] = useState("warning") // error message showType
  const [showMessage, setShowMessage] = useState<string>("") // error message showMessage
  const [showAlertBox, setShowAlertBox] = useState(false) // error message ShowAlertBox
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useDispatch();

  async function handleSetPassword() {
    setIsLoadingModal(true);

    const minLength = 8;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    // const hasSpecialChar = /^(?=.*[~!@#$%_-])[a-zA-Z0-9~!@#$%_-]+$/.test(password);
    const hasSpecialChar = /^(?=.*[\W_])[a-zA-Z0-9\W_]+$/.test(password);
    const hasNumber = /\d/.test(password);

    if (
      password.length < minLength ||
      !hasLowerCase ||
      !hasUpperCase ||
      !hasSpecialChar ||
      !hasNumber
    ) return;

    try {
      const response = await axiosPrivate.patch('my-profile/change-password/update', {
        "currentPassword": currentPassword,
        "newPassword": confirmPassword,
      })
      if (response.status === 200) {
        setCurrentPassword('')
        setConfirmPassword('')
        setPassword('')
        dispatch(resetFormModified(false))
        setIsPasswordValid(true)
        setDisabled(true)
        setIsNewPasswordValid(true)
        setIsLoadingModal(false)
        setShowAlertBox(true)
        setShowType("success")
        setShowMessage(response.data.message)
        clearAleart()
      }
    } catch (error: any) {
      setIsLoadingModal(false)
      setShowAlertBox(true)
      setShowType("danger")
      setShowMessage(error.response.data.error)
      clearAleart()
    }
  }

  const clearAleart = () => {
    const timer = setTimeout(() => {
      setShowAlertBox(false)
      setShowMessage("");
      clearTimeout(timer);
    }, 5000);
  }

  function isValidPassword(pass: string, confirmPass: string, currentPassword: any) {
    const minLength = 8;
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    // const hasSpecialChar = /^(?=.*[~!@#$%_-])[a-zA-Z0-9~!@#$%_-]+$/.test(password);
    const hasSpecialChar = /^(?=.*[\W_])[a-zA-Z0-9\W_]+$/.test(password);
    const hasNumber = /\d/.test(password);
    const currentpassword = currentPassword.length >= 8;

    if (password.length < minLength || !hasLowerCase || !hasUpperCase || !hasSpecialChar || !hasNumber || pass !== confirmPass || !currentpassword) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    if (password !== "") {
      setShowConfirmPassword(!showConfirmPassword);
    }
  }

  const handleKeyPress = (e: any) => {
    if (e.keyCode === 32) {
      e.preventDefault();
    }
    setErrorMessage("")
  }

  const handleKeyDown = (e: any) => {
    if (e.keyCode === 32) {
      e.preventDefault();
    }
    if (e.key === 'Enter') {
      handleSetPassword()
    }
    setErrorMessage("")
  };

  function handleInputData(value: any) {
    setCurrentPassword(value)

    if (isPasswordValid) {

      if (value.length >= 8) {
        setIsNewPasswordValid(false)
      } else {
        setIsNewPasswordValid(true)
      }
    } else if (value.length < 8 && !isPasswordValid) {
      setIsNewPasswordValid(false)
    }

    isValidPassword(password, confirmPassword, value);
  }

  return (
    <div className='create-new-password'>
      <div className='password'>
        <InputComponent
          height={"40px"}
          width={"300px"}
          padding={"0px 0px 0px 10px"}
          borderRadius={"5px"}
          backgroundColor={""}
          color={"black"}
          maxLength={16}
          placeHolder={"Enter Current Password"}
          inputTitle={"Current Password"}
          autoFocus={true}
          required={true}
          readOnly={false}
          inputValue={currentPassword}
          type={showCurrentPassword ? 'text' : 'password'}
          border={'1px solid #B3CAE1'}
          getUser={(val) => {
            handleInputData(val)
            dispatch(resetFormModified(true));
          }}
        />
        {showCurrentPassword ? (
          <IoIosEyeOff
            className='show-icon'
            onClick={() => setShowCurrentPassword(false)}
          />
        ) : (
          <IoIosEye
            className='show-icon'
            onClick={() => setShowCurrentPassword(true)}
          />
        )}
      </div>
      <div className='password'>
        <InputComponent
          height={"40px"}
          width={"300px"}
          padding={"10px 10px"}
          border={"1px solid #B3CAE1"}
          maxLength={16}
          blockCopyPaste={true}
          backgroundColor={""}
          borderRadius={"5px"}
          handleKeyDown={handleKeyPress}
          inputValue={password}
          required={true}
          color={"#333333"}
          inputTitle={'New Password'}
          placeHolder={"Enter New Password"}
          disabled={(isNewPasswordValid) ? true : false}
          type={showPassword ? 'text' : 'password'}
          getUser={(val: any) => {
            setPassword(val)
            isValidPassword(val, confirmPassword, currentPassword)
            dispatch(resetFormModified(true))
          }}
          fieldStatus={(val: any) => {
            setIsPasswordValid(val)
          }}
          points={[
            { name: "At least 8 characters", pattern: "8 character" },
            { name: "At least 1 lowercase", pattern: "lowercase" },
            { name: "At least 1 uppercase", pattern: "uppercase" },
            { name: "At least 1 number", pattern: "number" },
            { name: "At least 1 special character", pattern: "specialCharacter" },
          ]}
        />
        {showPassword ? (
          <IoIosEyeOff
            className={(isNewPasswordValid) ? `show-icon disabled-icon` : `show-icon`}
            onClick={() => !isNewPasswordValid && toggleShowPassword()}
          />
        ) : (
          <IoIosEye
            className={(isNewPasswordValid) ? `show-icon disabled-icon` : `show-icon`}
            onClick={() => !isNewPasswordValid && toggleShowPassword()}
          />
        )}
      </div>
      <div className='password'>
        <InputComponent
          height={"40px"}
          width={"300px"}
          padding={"10px 10px"}
          border={"1px solid #B3CAE1"}
          inputTitle={'Confirm Password'}
          backgroundColor={""}
          borderRadius={"5px"}
          blockCopyPaste={true}
          handleKeyDown={handleKeyDown}
          color={"black"}
          showTooltipTitle={false}
          required={true}
          maxLength={16}
          inputValue={confirmPassword}
          password={password}
          disabled={(password === "" || isPasswordValid) ? true : false}
          type={showConfirmPassword ? 'text' : 'password'}
          getUser={(val: any) => {
            setConfirmPassword(val)
            isValidPassword(password, val, currentPassword)
            dispatch(resetFormModified(true))
          }}
          fieldStatus={(val: any) => { setIsConfirmPasswordValid(val) }}
          placeHolder={"Re-enter New Password"}
          points={[
            { name: "Password do not match", pattern: "confirmpassword" },
          ]}
        />
        {showConfirmPassword ? (
          <IoIosEyeOff
            className={(password === "" || isPasswordValid) ? `show-icon disabled-icon` : `show-icon`}
            onClick={(password === "" || isPasswordValid) ? () => { } : toggleShowConfirmPassword}
          />
        ) : (
          <IoIosEye
            className={(password === "" || isPasswordValid) ? `show-icon disabled-icon` : `show-icon`}
            onClick={(password === "" || isPasswordValid) ? () => { } : toggleShowConfirmPassword}
          />
        )}
      </div>
      <div className='submit-btn'>
        <ButtonComponent
          title={"Change Password"}
          height={"40px"}
          disabled={disabled}
          width={"210px"}
          backgroundColor={"#295285"}
          color={"#FFFFFF"}
          handleClick={() => {
            handleSetPassword()
          }}
          className={disabled ? "button-component-hover disabled" : "button-component common-btn"}
        />
      </div>
      {errorMessage && <p className='error'>{errorMessage}</p>}
      {
        showAlertBox &&
        <div className='alert-warp'>
          <Alertbox type={showType} message={showMessage} />
        </div>
      }
      {
        isLoadingModal &&
        <Loader />
      }
    </div>
  )
}

export default UserProfileChangePassword;