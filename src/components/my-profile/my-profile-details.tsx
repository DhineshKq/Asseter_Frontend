import UserProfileheaderMenu from './user-profile-header-menu';
import UserProfileOverview from './user-profile-overview';
import UserProfileEditProfile from './user-profile-edit-profile';
import UserProfilePermissions from './user-profile-permissions';
import UserProfileChangePassword from './user-profile-change-password';
import { MdEdit } from 'react-icons/md';
import "../../styles/pages/my-profile/my-profile-details.scss";
import { useSelector } from 'react-redux';
interface Props {
  headerMenuList?: any;
  userId?: any;
  currentHeader?: string;
  userManagementViewFunction?: (val: any) => void;
  setCurrentHeader?: (val: any) => void;
}
function MyProfileDetails({ headerMenuList, userId, userManagementViewFunction, setCurrentHeader, currentHeader }: Props) {
  const Permission = useSelector((state: any) => state.Permission);
  const accessType = Permission?.accessType === "Read Only" ? true : false;
  return (
    <div className='my-profile-details-component'>
      {
        userId &&
        <div className={accessType ? "disable-profile-edit" : "profile-edit"} onClick={() => {
          if (userManagementViewFunction) {
            userManagementViewFunction('FormView')
          } 
        }}><MdEdit style={{ fontSize: '25px' }} /></div>
      }
      <UserProfileheaderMenu
        setCurrentHeader={setCurrentHeader}
        currentHeader={currentHeader}
        headerMenuList={headerMenuList}
      />
      {
        currentHeader === "overview" &&
        <UserProfileOverview
          userId={userId}
        />
      }
      {
        currentHeader === "editProfile" &&
        <UserProfileEditProfile />
      }
      {
        currentHeader === "permissions" &&
        <UserProfilePermissions
          userId={userId}
        />
      }
      {
        currentHeader === "changePassword" &&
        <UserProfileChangePassword />
      }
    </div>
  )
}

export default MyProfileDetails;