import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../services/hooks/useaxios-private";
// import Loading from "../common-component/modals/loading-screen";
import Loader from '../common-component/loader/Main-loader'
import Alertbox from "../common-component/modals/alertbox-modal";
import useAuth from "../../services/hooks/useauth";
import "../../styles/pages/my-profile/user-profile-overview.scss"

const profileDetails = ['Full Name', 'Company', 'Designation', 'Country', 'Address', 'Mobile', 'Email', 'Last Login'];
interface Props {
  userId?: any;
}

function UserProfileOverview({ userId }: Props) {
  const [overviewRecords, setOverviewRecords] = useState<any>({});
  const [isLoadingModal, setIsLoadingModal] = useState<boolean>(false); // loading screen
  const [showType, setShowType] = useState("warning") // error message showType
  const [showMessage, setShowMessage] = useState<string>("") // error message showMessage
  const [showAlertBox, setShowAlertBox] = useState(false) // error message ShowAlertBox
  const axiosPrivate = useAxiosPrivate();
  const { user } = useAuth();

  useEffect(() => {   
      if (userId) {
        handleGetOverviewDetails()
      }    
  }, [])

  useEffect(() => {
    if (!userId) {
      setOverviewRecords(user)
    }
  }, [user])

  async function handleGetOverviewDetails() {
    setIsLoadingModal(true)
    try {
      const response = await axiosPrivate.post('my-profile/overview/get', { userId: userId })
      if (response.status === 200) {
        setOverviewRecords(response.data.setUserDetails)
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

  return (
    <div className='user-profile-overview-component'>
      {/* <div className='about-main'>
        <p className='about'>{"About"}</p>
        <p className='about-content'>{"Sunt est soluta temporibus accusantium neque nam maiores cumque temporibus. Tempora libero non est unde veniam est qui dolor. Ut sunt iure rerum quae quisquam autem eveniet perspiciatis odit. Fuga sequi sed ea saepe at unde."}</p>
      </div> */}
      <div className='profile-details-main'>
        <p className='profile-details'>{"Profile Details"}</p>
        {
          profileDetails.map((elem, i) => {
            return (
              <div key={i} className='list-main'>
                <p className='left-header'>{elem}</p>
                <p className='right-name'>
                  {
                    elem === 'Last Login' &&
                    <MdOutlineAccessTimeFilled className="time-icon" />
                  }
                  {overviewRecords[elem]}
                </p>
              </div>
            )
          })
        }
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

export default UserProfileOverview;