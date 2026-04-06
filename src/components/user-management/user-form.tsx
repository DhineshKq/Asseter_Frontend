import React, { useEffect, useState } from 'react'
import '../../styles/pages/users/users.scss'
import ButtonComponent from '../../components/common-component/form-elements/button-component';
import { axiosPrivate } from '../../middleware/axios-api';
import Alertbox from '../../components/common-component/modals/alertbox-modal';
import DropdownComponent from '../common-component/form-elements/dropdown-component';
import { v4 as uuidv4 } from 'uuid';

interface propsType {
  setassetsPageView: (val: string) => void;
  setRefreshGrid: (val: boolean) => void;
  setOriginalRowData: (val: string) => void;

}

export default function UsersFormView({ setassetsPageView, setRefreshGrid, setOriginalRowData }: propsType) {
  const [showAlertBox, setShowAlertBox] = useState(false)
  const [showMessage, setShowMessage] = useState<string>("")
  const [showType, setShowType] = useState("warning")
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [subscriptionPlans, setSubscriptionPlans] = useState<string[]>([]); // array of plan names
  const [selectedPlan, setSelectedPlan] = useState<string>(""); // currently selected plan


  const isFormInvalid = !firstName || !lastName || !username || !email || !!usernameError || !!emailError || !!mobileError;
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
    setMobileError(val === '' || val.length === 10 ? '' : 'Mobile number must be 10 digits');
  };



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

  useEffect(() => {
    getAllPlans();
  }, []);

  const clearAleart = (status: any) => {
    const timer = setTimeout(() => {
      setShowAlertBox(false)
      setShowMessage("");
      clearTimeout(timer);
      setassetsPageView("Grid");
    }, 5000);
  }

  const cancelActoin = () => {
    setassetsPageView("Grid")

  };

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
      const response = await axiosPrivate.post('/createUsers', {
        firstName,
        lastName,
        userName: username,
        email,
        mobileNumber: mobile,
        subscriptionPlan: selectedPlan
      });

      console.log("response.data.status", response.data.status);
      if (response.data.status) {
        console.log("iffffff");
        setShowAlertBox(true);
        setShowType("success");
        setShowMessage("User created successfully!");
        setRefreshGrid(true);
        setOriginalRowData("");
      } else {
        setShowAlertBox(true);
        setShowType("warning");
        setShowMessage("Failed to create user");
      }

      clearAleart(true);
    } catch (error: any) {
      setShowType("danger");
      const msg = error?.response?.data?.message || "Something went wrong";
      setShowMessage(msg);
      setShowAlertBox(true);
      clearAleart(false);
    }
    getUsersData()
  };

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




  return (

    <div className="add-modal">
      <div className="container_user">
        <h2 className="pageHeading">Add User</h2>
        <div className="heading-line"></div>

        <div className="formSpace_user">
          {/* Row 1 */}
          <div className="inputfield">
            <label className="form-label fieldLabel">First Name</label>
            <input
              type="text"
              className="form-control formFormat"
              placeholder="Enter first name"
              maxLength={50}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="inputfield">
            <label className="form-label fieldLabel">Last Name</label>
            <input
              type="text"
              className="form-control formFormat"
              placeholder="Enter last name"
              maxLength={50}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Row 2 */}
          <div className="inputfield">
            <label className="form-label fieldLabel">Username</label>
            <input
              type="text"
              className={`form-control formFormat ${usernameError ? 'is-invalid' : ''}`}
              placeholder="Enter username"
              maxLength={30}
              value={username}
              onChange={(e) => {
                const val = e.target.value.trim();
                setUsername(val);
                validateUsername(val);
              }}
              onKeyDown={(e) => [" ", ","].includes(e.key) && e.preventDefault()}
            />
            {usernameError && <div className="invalid-feedback">{usernameError}</div>}
          </div>

          <div className="inputfield">
            <label className="form-label fieldLabel">Email</label>
            <input
              type="email"
              className={`form-control formFormat ${emailError ? 'is-invalid' : ''}`}
              placeholder="Enter email"
              maxLength={100}
              value={email}
              onChange={(e) => {
                const val = e.target.value.trim();
                setEmail(val);
                validateEmail(val);
              }}
            />
            {emailError && <div className="invalid-feedback">{emailError}</div>}
          </div>

          {/* Row 3 */}
          <div className="inputfield">
            <label className="form-label fieldLabel">Mobile Number (Optional)</label>
            <input
              type="tel"
              className={`form-control formFormat ${mobileError ? 'is-invalid' : ''}`}
              placeholder="Enter mobile number"
              maxLength={10}
              value={mobile}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setMobile(val);
                validateMobile(val);
              }}
            />
            {mobileError && <div className="invalid-feedback">{mobileError}</div>}
          </div>

          <div className="inputfield">
            <label className="form-label fieldLabel">Subscription Plan</label>
            <DropdownComponent
              options={subscriptionPlans.map(plan => ({ label: plan, value: plan }))}
              className="custom-dropdown"
              placeHolder={"Select Plan"}
              defaultValue={selectedPlan}
              width={"100%"}
              getData={(val) => setSelectedPlan(val)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="buttons">
          <ButtonComponent
            title="Cancel"
            height="50px"
            width="150px"
            backgroundColor="var(--btn-primary-bg)"
            color="white"
            className="button-component-hover cancel"
            handleClick={cancelActoin}
          />
          <ButtonComponent
            title="Submit"
            height="50px"
            width="150px"
            backgroundColor="var(--btn-primary-bg)"
            color="white"
            className="button-component-hover common-btn"
            handleClick={handleSubmit}
            disabled={isFormInvalid}
          />
        </div>
      </div>
      <div>

        {showAlertBox && (
          <div className="alert-warp">
            <Alertbox type={showType} message={showMessage} />
          </div>
        )}
      </div>

    </div>




  )


}
