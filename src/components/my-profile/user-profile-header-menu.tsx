import "../../styles/pages/my-profile/user-profile-header-menu.scss";
interface propsType {
    setCurrentHeader?: (value: string) => void;
    currentHeader?: string;
    headerMenuList: any
}

function UserProfileheaderMenu({ setCurrentHeader, currentHeader, headerMenuList }: propsType) {
    return (
        <div className='header-menu-component'>
            {
                headerMenuList.includes('Overview') &&
                <button
                    className={currentHeader === "overview" ? 'menu-main-active' : 'menu-main'}
                    onClick={() => { setCurrentHeader && setCurrentHeader('overview') }}
                >
                    <p>{"Overview"}</p>
                </button >
            }
            {
                headerMenuList.includes('Edit Profile') &&
                <button
                    className={currentHeader === "editProfile" ? 'menu-main-active' : 'menu-main'}
                    onClick={() => { setCurrentHeader && setCurrentHeader('editProfile') }}
                >
                    <p>{"Edit Profile"}</p>
                </button>
            }
            {
                headerMenuList.includes('Permissions') &&
                <button
                    className={currentHeader === "permissions" ? 'menu-main-active' : 'menu-main'}
                    onClick={() => { setCurrentHeader && setCurrentHeader('permissions') }}
                >
                    <p>{"Permissions"}</p>
                </button>
            }
            {
                headerMenuList.includes('Change Password') &&
                <button
                    className={currentHeader === "changePassword" ? 'menu-main-active' : 'menu-main'}
                    onClick={() => { setCurrentHeader && setCurrentHeader('changePassword') }}
                >
                    <p>{"Change Password"}</p>
                </button>
            }
        </div>
    )
}

export default UserProfileheaderMenu;