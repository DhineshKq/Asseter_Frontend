import { useEffect, useState } from 'react'
import InputComponent from '../common-component/form-elements/input-component'
import DropdownComponent from '../common-component/form-elements/dropdown-component';
import TextArea from '../common-component/form-elements/text-area';
import ButtonComponent from '../common-component/form-elements/button-component';
import useAxiosPrivate from '../../services/hooks/useaxios-private';
import Alertbox from '../common-component/modals/alertbox-modal';
// import Loading from '../common-component/modals/loading-screen';
import Loader from '../common-component/loader/Main-loader'
import { v4 as uuidv4 } from 'uuid';
import useAuth from '../../services/hooks/useauth';
import { validatedata } from '../../config/my-profile/my-profile-config';
import { useDispatch } from 'react-redux';
import { resetFormModified } from '../../redux/action';
import { useSelector } from 'react-redux';
import '../../styles/pages/my-profile/user-profile-edit-profile.scss'

const editProfileInitialData = {
  userId: "",
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  country: "",
  city: "",
  address: "",
  countryId: "",
}

function UserProfileEditProfile() {
  const [editProfileRecords, setEditProfileRecords] = useState<any>(editProfileInitialData);
  const [countryDropDownData, setCountryDropDownData] = useState<any>([]);
  const [vlidationErrors, setValidationErrors] = useState<any>(editProfileInitialData);
  const [isLoadingModal, setIsLoadingModal] = useState<boolean>(false); // loading screen
  const [showType, setShowType] = useState("warning") // error message showType
  const [showMessage, setShowMessage] = useState<string>("") // error message showMessage
  const [showAlertBox, setShowAlertBox] = useState(false) // error message ShowAlertBox
  const axiosPrivate = useAxiosPrivate();
  const { updateUser, user } = useAuth();
  const dispatch = useDispatch();
  const isFormModified = useSelector((state: any) => state.isFormModified);

  useEffect(() => {
      handleGetCountryDropDown()
      const setUserDetails = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.Email,
        mobile: user.Mobile,
        country: user.Country,
        city: user.city,
        address: user.Address,
        countryId: user.countryId,
      }
      setEditProfileRecords(setUserDetails)    
  }, [])

  async function handleGetCountryDropDown() {
    try {
      const response = await axiosPrivate.get(`get/flags`)
      if (response.status === 200) {
        let finalData: any[] = [];
        response.data.flags.map((elem: any) => {
          finalData.push({ label: elem.flagName, value: elem.flagId })
        })
        setCountryDropDownData(finalData)
      }
    } catch (error: any) {
      setShowAlertBox(true)
      setShowType("danger")
      setShowMessage(error.response.data.error)
      clearAleart()
    }
  }

  async function handleGetOverviewDetails() {
    setIsLoadingModal(true)
    try {
      const response = await axiosPrivate.post('my-profile/overview/get', { userId: undefined })
      if (response.status === 200) {
        updateUser(response.data.setUserDetails)
        setIsLoadingModal(false)
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

  function handleInputData(params: any, value: any) {
    setEditProfileRecords(((prevState: any) => {
      return { ...prevState, [params]: value }
    }))
  }

  function validateData(data: any) {
    const validationResult: any = {};

    for (const key in validatedata) {
      const { field, isMandatory, regex, errorMessage, regexMessage } = validatedata[key];
      const value = data[key];

      if (isMandatory && value.trim() === '') {
        validationResult[key] = errorMessage;
      } else if (regex && !regex.test(value)) {
        validationResult[key] = regexMessage ? regexMessage : `Some of the field(s) are not in required format.`;
      } else {
        validationResult[key] = true;
      }
    }

    setValidationErrors(validationResult);
    // Check if any field has validation errors
    const isFormValid = Object.keys(validationResult).every((keys) => {
      return (typeof validationResult[keys] === "boolean" && validationResult[keys] === true)
    });
    return isFormValid;
  }

  async function handleUpdateUserDetails() {
    setIsLoadingModal(true)
    try {
      const response = await axiosPrivate.patch(`my-profile/edit-profile/save`, { editProfileRecords })
      if (response.status === 200) {
        await handleGetOverviewDetails()
        dispatch(resetFormModified(false));
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

  return (
    <div className='edit-profile-component'>
      <div className='edit-profile-flex'>
        <div className='edit-profile-seprate-input'>
          <div className='edit-profile-input-main'>
            <InputComponent
              height={"40px"}
              width={"100%"}
              padding={"0px 0px 0px 10px"}
              margin={"0px 60px 5px 0px"}
              borderRadius={"5px"}
              maxLength={100}
              backgroundColor={""}
              color={""}
              placeHolder={'Enter Your First Name'}
              type={"text"}
              inputTitle={"First Name"}
              required={true}
              readOnly={false}
              disabled={false}
              inputValue={editProfileRecords.firstName}
              border={!["", true].includes(vlidationErrors.firstName) ? "1px solid red" : '1px solid #B3CAE1'}
              errorMessage={!["", true].includes(vlidationErrors.firstName) && vlidationErrors.firstName}
              getUser={(val) => {
                const Name = val.trimStart().replace(/[^A-Za-z_\ -]/g, "");                
                handleInputData('firstName', Name);
                dispatch(resetFormModified(true));
              }}
            />
          </div>
          <div className='edit-profile-input-main' >
            <InputComponent
              height={"40px"}
              width={"100%"}
              padding={"0px 0px 0px 10px"}
              margin={"0px 60px 5px 0px"}
              borderRadius={"5px"}
              backgroundColor={""}
              maxLength={100}
              color={""}
              placeHolder={'Enter Your Last Name'}
              type={"text"}
              inputTitle={"Last Name"}
              required={true}
              readOnly={false}
              disabled={false}
              inputValue={editProfileRecords.lastName}
              border={!["", true].includes(vlidationErrors.lastName) ? "1px solid red" : '1px solid #B3CAE1'}
              errorMessage={!["", true].includes(vlidationErrors.lastName) && vlidationErrors.lastName}
              getUser={(val) => {
                const Name = val.trimStart().replace(/[^A-Za-z_\ -]/g, "");   
                handleInputData('lastName', Name);
                dispatch(resetFormModified(true));
              }}
            />
          </div>
        </div>
        <div className='edit-profile-seprate-input'>
          <div className='edit-profile-input-main'>
            <InputComponent
              height={"40px"}
              width={"100%"}
              padding={"0px 0px 0px 10px"}
              margin={"0px 60px 5px 0px"}
              borderRadius={"5px"}
              backgroundColor={""}
              color={""}
              placeHolder={'Enter Email'}
              type={"email"}
              inputTitle={"Email"}
              required={true}
              readOnly={true}
              disabled={true}
              inputValue={editProfileRecords.email}
              border={!["", true].includes(vlidationErrors.email) ? "1px solid red" : '1px solid #B3CAE1'}
              errorMessage={!["", true].includes(vlidationErrors.email) && vlidationErrors.email}
              getUser={(val) => {
                handleInputData('email', val);
                dispatch(resetFormModified(true));
              }}
            />
          </div>
          <div className='edit-profile-input-main'>
            <InputComponent
              height={"40px"}
              width={"100%"}
              padding={"0px 0px 0px 10px"}
              margin={"0px 60px 5px 0px"}
              borderRadius={"5px"}
              backgroundColor={""}
              color={""}
              placeHolder={'Enter Your Mobile Number'}
              type={"text"}
              inputTitle={"Mobile"}
              maxLength={16}
              required={true}
              readOnly={false}
              disabled={false}
              inputValue={editProfileRecords.mobile}
              border={!["", true].includes(vlidationErrors.mobile) ? "1px solid red" : '1px solid #B3CAE1'}
              errorMessage={!["", true].includes(vlidationErrors.mobile) && vlidationErrors.mobile}
              getUser={(val) => {
                const Name = val.replace(/[^\d+]/g, "");
                handleInputData('mobile', Name);
                dispatch(resetFormModified(true));
              }}
            />
          </div>
        </div>
        <div className='edit-profile-seprate-input'>
          <div
            className='edit-profile-dropdown'
            style={{ paddingRight: !["", true].includes(vlidationErrors.country) ? '57px' : '60px' }}
            key={editProfileRecords.country === "" ? uuidv4() : 1}
          >
            <DropdownComponent
              title={"Country"}
              placeHolder={'Select'}
              required={true}
              width={"100%"}
              isDisabled={false}
              options={countryDropDownData}
              defaultValue={[
                {
                  label: editProfileRecords.country === "" ? "Select" : editProfileRecords.country,
                  value: editProfileRecords.country === "" ? "Select" : editProfileRecords.country
                }
              ]}
              errorMessage={!["", true].includes(vlidationErrors.country) && vlidationErrors.country}
              className={!["", true].includes(vlidationErrors.country) ? "errorhighlight" : "input-select"}
              getData={(val) => {
                handleInputData('country', val.label);
                handleInputData('countryId', val.value);
                dispatch(resetFormModified(true));
              }}
            />
          </div>
          <div className='edit-profile-input-main'>
            <InputComponent
              height={"40px"}
              width={"100%"}
              padding={"0px 0px 0px 10px"}
              margin={"0px 60px 5px 0px"}
              borderRadius={"5px"}
              backgroundColor={""}
              color={""}
              maxLength={100}
              placeHolder={'Enter Your City'}
              type={"text"}
              inputTitle={"City"}
              required={true}
              readOnly={false}
              disabled={false}
              inputValue={editProfileRecords.city}
              border={!["", true].includes(vlidationErrors.city) ? "1px solid red" : '1px solid #B3CAE1'}
              errorMessage={!["", true].includes(vlidationErrors.city) && vlidationErrors.city}
              getUser={(val) => {
                const Name = val.trimStart().replace(/[^A-Za-z_\ -]/g, "");
                handleInputData('city', Name);
                dispatch(resetFormModified(true));
              }}
            />
          </div>
        </div>
        <div className='edit-profile-textarea-main'>
          <TextArea
            height={"70px"}
            width={"100%"}
            maxLength={250}
            padding={"0px 0px 0px 10px"}
            margin={"0px 0px 5px 0px"}
            required={true}
            borderRadius={"5px"}
            name={"Address"}
            placeHolder={'Enter Your Address'}
            disabled={false}
            inputValue={editProfileRecords.address}
            border={!["", true].includes(vlidationErrors.address) ? "1px solid red" : '1px solid #B3CAE1'}
            errorMessage={!["", true].includes(vlidationErrors.address) && vlidationErrors.address}
            getUser={(val) => {
              const Name = val.trimStart();
              handleInputData('address', Name);
              dispatch(resetFormModified(true));
            }} />
        </div>
      </div>
      <div className='edit-profile-input-main'>
        <ButtonComponent
          height={"50px"}
          width={"176px"}
          margin={"0px 30px 0px 0px"}
          border={""}
          borderRadius={"5px"}
          title={"Update"}
          backgroundColor={"#295285"}
          color={"#FFFFFF"}
          disabled={!isFormModified}
          className={!isFormModified ? "button-component-hover disabled" : "button-component common-btn"}
          handleClick={() => {
            const value = validateData(editProfileRecords);
            value && handleUpdateUserDetails();
          }}
        />
      </div>
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

export default UserProfileEditProfile;