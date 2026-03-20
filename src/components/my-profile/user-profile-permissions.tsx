import { useEffect, useState } from 'react'
import { GoTriangleRight } from "react-icons/go";
import { BsCheck } from "react-icons/bs";
import useAxiosPrivate from '../../services/hooks/useaxios-private';
import Alertbox from '../common-component/modals/alertbox-modal';
// import Loading from '../common-component/modals/loading-screen';
import Loader from '../common-component/loader/Main-loader'
import '../../styles/pages/my-profile/user-profile-permissions.scss';
interface Props {
  userId?: any;
}

function UserProfilePermissions({ userId }: Props) {
  const [permissionsData, setPermissionsData] = useState<any>({});
  const [isLoadingModal, setIsLoadingModal] = useState<boolean>(false); // loading screen
  const [showType, setShowType] = useState("warning") // error message showType
  const [showMessage, setShowMessage] = useState<string>("") // error message showMessage
  const [showAlertBox, setShowAlertBox] = useState(false) // error message ShowAlertBox
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
      handleGetCountryDropDown()    
  }, [])

  async function handleGetCountryDropDown() {
    setIsLoadingModal(true)
    try {
      const response = await axiosPrivate.post(`my-profile/permissions/get`, { userId: userId })
      if (response.status === 200) {
        setIsLoadingModal(false)
        setPermissionsData(response.data.permissionDetails)
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
    <div className='permissions-component'>
      {
        Object.keys(permissionsData).map((elem, i) => {
          return (
            <div key={i} className='permissions-heading-main'>
              <div className='permissions-name'>
                <span className='icon-triangle-main'>
                  <GoTriangleRight className='icon-triangle' />
                </span>
                <p>{elem}</p>
              </div>
              <div className='permissions-sub-main'>
                {
                  permissionsData[elem].map((subValue: any, subIndex: any) => {
                    return (
                      <div className='sub-main' key={subIndex} >
                        <BsCheck className='check-icon' />
                        <p>{subValue}</p>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          )
        })
      }
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

export default UserProfilePermissions;