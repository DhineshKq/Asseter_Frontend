import { ReactComponent as HamburgerMenu } from "../../assets/icons/hamburger-menu.svg";
import { ReactComponent as LogoutIcon } from "../../assets/web-icons/Logout.svg";
import Logo from '../../assets/logos/kqLogo.png'
import '../../styles/layouts/header.scss'
import 'rc-tooltip/assets/bootstrap.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logoutmodal from '../../components/common-component/modals/delete-modal';
import useAxiosPrivate from '../../services/hooks/useaxios-private';
import useAuth from '../../services/hooks/useauth';
import { useDispatch } from 'react-redux';
import { resetFormModified } from '../../redux/action';


interface Props {
    filterClick: (val: any) => void
    filterIconStatus: any
}



// Icons for notification 


export default function Header({ filterClick, filterIconStatus }: Props) {
    const location = useLocation();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();
    const { setAuth } = useAuth();
    const dispatch = useDispatch();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Function for shortcut key to oen and close side nav bar
    const filterClickShortcut = () => {
        filterClick(!filterIconStatus)
    };

    const currentPageTitle = {
        "/dashboard": "Dashboard",
        "/assets": "Assets",
        "/asset-locations": "Asset Locations",
        "/asset-mapping": "Asset Mapping",
        "/ip-mapping": "IP Mapping",
        "/credential-manager": "Credential Manager",
        "/users": "Employees",
    }[location.pathname] || "Workspace";

    const completeLogout = () => {
        setShowLogoutModal(false);
        dispatch(resetFormModified(false));
        setAuth({});
        localStorage.clear();
        navigate("/");
    };

    const handleLogout = async () => {
        try {
            const response = await axiosPrivate.post("signOut");
            if (response.status === 200) {
                completeLogout();
            }
        } catch {
            completeLogout();
        }
    };

    return (
        <>
            <div className={"header-main"}>
                <div className={"header-start"}>
                    <button type="button" className="sidebar-toggle-btn" onClick={filterClickShortcut} aria-label="Toggle sidebar">
                        <HamburgerMenu className={"sideNavBar-lines"} />
                    </button>
                    <div className={"kq-logo"}>
                        <div className="header-logo-shell">
                            <img src={Logo} alt={"Logo"} draggable={false} className={"kq-logo-image"} />
                        </div>
                        <div className="header-title-block">
                            <span className="header-kicker">InfraPilot 360</span>
                            <strong>{currentPageTitle}</strong>
                            <small>Manage infrastructure, asset records, and assignment ownership from one control layer.</small>
                        </div>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        type="button"
                        className="header-logout-btn"
                        onClick={() => setShowLogoutModal(true)}
                        aria-label="Logout"
                        title="Logout"
                    >
                        <LogoutIcon className="header-logout-icon" />
                    </button>
                </div>
            </div>
            {showLogoutModal && (
                <Logoutmodal
                    clearValue={() => setShowLogoutModal(false)}
                    handleSignOut={handleLogout}
                    modelType="signOut"
                />
            )}
        </>
    )
}
