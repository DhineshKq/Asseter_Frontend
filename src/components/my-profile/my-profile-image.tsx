import { ReactComponent as MyProfile } from "../../assets/icons/my-profile.svg";
import { ReactComponent as ProfileEdit } from "../../assets/icons/profile-edit.svg";
import { MdDeleteForever } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../../services/hooks/useaxios-private";
import Alertbox from "../common-component/modals/alertbox-modal";
// import Loading from "../common-component/modals/loading-screen";
import Loader from '../common-component/loader/Main-loader'
import DeleteModal from "../common-component/modals/delete-modal";
import useAuth from "../../services/hooks/useauth";
import "../../styles/pages/my-profile/my-profile-image.scss";
import { useSelector } from "react-redux";
interface Props {
  isNeedEditDelete?: any;
  userId?: any
}

function MyProfileImage({ isNeedEditDelete, userId }: Props) {
  const [myProfileRecords, setMyProfileRecords] = useState<any>({});
  const [userProfileUrl, setUserProfileUrl] = useState<string>('');
  const [showModel, setShowModel] = useState<boolean>(false)
  const [isLoadingModal, setIsLoadingModal] = useState<boolean>(false); // loading screen
  const [showType, setShowType] = useState("warning") // error message showType
  const [showMessage, setShowMessage] = useState<string>("") // error message showMessage
  const [showAlertBox, setShowAlertBox] = useState(false) // error message ShowAlertBox
  const fileInputRef = useRef<HTMLInputElement>(null);
  const axiosPrivate = useAxiosPrivate();
  const { updateUser, user } = useAuth();
  const Permission = useSelector((state: any) => state.Permission);
  const accessType = Permission?.accessType === "Read Only" ? true : false;
  useEffect(() => {
    if (userId) {
      handleGetOverviewDetails()
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setMyProfileRecords(user)
      setUserProfileUrl(user.imageUrl)
    }
  }, [user])

  async function handleGetOverviewDetails() {
    setIsLoadingModal(true)
    try {
      const response = await axiosPrivate.post('my-profile/overview/get', { userId: userId })
      if (response.status === 200) {
        setMyProfileRecords(response.data.setUserDetails)
        setUserProfileUrl(response.data.setUserDetails?.imageUrl)
        !userId && updateUser(response.data.setUserDetails);
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

  function handleProfileEdit() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    };
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const fileList = event.target.files;
    if (fileList) {
      const file = fileList[0]; // Assuming only one file is selected
      if (file.type.toLowerCase() === "image/jpeg" || file.type.toLowerCase() === "image/jpg" || file.type.toLowerCase() === "image/png") {
        if (file.size > 2000000) {
          event.target.value = '';
          setShowAlertBox(true)
          setShowType("warning")
          setShowMessage("File size should not exceed 2 MB.")
          clearAleart()
          return;
        }

        const reader = new FileReader();

        reader.onload = async () => {
          const base64String = reader.result as string;
          setUserProfileUrl(base64String);
          updateProfileImage(base64String)

          event.target.value = ''; // This should clear the input value and allow selecting the same file again
        };
        reader.readAsDataURL(file);
      } else {
        event.target.value = '';
        setShowAlertBox(true);
        setShowType('warning');
        setShowMessage('Unsupported file format. Upload JPEG or JPG or PNG file format.');
        clearAleart()
      }
    }
  };

  async function updateProfileImage(imageUrl: any) {
    setIsLoadingModal(true)
    try {
      const response = await axiosPrivate.post('my-profile/profile-image/add', {
        userId: userId,
        imageUrl: imageUrl,
      })
      if (response.status === 200) {
        !userId && updateUser({
          ...user, ['imageUrl']: imageUrl
        })
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

  async function handleDeleteProfile() {
    setShowModel(false)
    try {
      const response = await axiosPrivate.patch(`my-profile/profile-image/delete`, {
        userId: userId,
      })
      if (response.status === 200) {
        !userId && updateUser({
          ...user, ['imageUrl']: null
        })
        setUserProfileUrl('');
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
    <div className='my-profile-image-component'>
      <div className='center-profile-main'>
        <div className='profile-pic-main'>
          {
            userProfileUrl === null || userProfileUrl === "" ?
              <MyProfile className='profile-pic-icon' />
              :
              <img className='profile-pic' src={userProfileUrl} alt={"profile-pic"} />
          }
        </div>
        {
          isNeedEditDelete &&
          <div className={accessType ? 'icon-main-disable' : 'icon-main'} >
            <button className='edit' onClick={() => handleProfileEdit()}>
              <ProfileEdit className='edit-icon' />
              <input
                id={'input-file'}
                type={"file"}
                ref={fileInputRef}
                key={userProfileUrl}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept={"image/jpeg, image/png"}
              />
            </button>
            <button
              disabled={userProfileUrl === null || userProfileUrl === ""}
              className={userProfileUrl === null || userProfileUrl === "" ? 'delete-disabled' : 'delete'}
              onClick={() => { !['', null].includes(userProfileUrl) && setShowModel(true) }}
            >
              <MdDeleteForever className='delete-icon' />
            </button>
          </div>
        }
      </div>
      <p className='full-name'>{myProfileRecords['Full Name'] && myProfileRecords['Full Name'].length > 20 ? myProfileRecords['Full Name'].substring(0, 20) + '...' : myProfileRecords['Full Name']}</p>
      <p className='employee'>{myProfileRecords && myProfileRecords['Designation']}</p>
      {
        showModel &&
        <DeleteModal
          clearValue={(value: any) => { setShowModel(value) }}
          handleConfirm={() => { handleDeleteProfile() }}
          modelType={'profilPictureDelete'}
        />
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

export default MyProfileImage;