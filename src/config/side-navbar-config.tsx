import { useEffect, useState } from 'react'
import { ReactComponent as DashboardIcon } from '../assets/web-icons/dashboard.svg';
import { ReactComponent as AssestsIcon } from '../assets/web-icons/assets.svg';
import { ReactComponent as ScansIcon } from '../assets/web-icons/Scans.svg';
import { ReactComponent as CapturesIcon } from '../assets/web-icons/captures.svg';
import { ReactComponent as SettingsIcon } from '../assets/web-icons/Setting.svg';
import { ReactComponent as LogoutIcon } from '../assets/web-icons/Logout.svg';
import { ReactComponent as UserIcon } from '../assets/web-icons/Users.svg';
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { resetFormModified } from '../redux/action';
import Logoutmodal from '../components/common-component/modals/delete-modal'
import useAxiosPrivate from '../services/hooks/useaxios-private';
import useAuth from '../services/hooks/useauth';
import { useCommonData } from '../services/context/useContext';

export default function SideBar() {
  const { currentLoggedUserData } = useCommonData();
  const name = currentLoggedUserData.name || 'User';
  const [selectedTitle, setSelectedTitle] = useState("");
  const isFormModified = useSelector((state: any) => state.isFormModified);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const dispatch = useDispatch();
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate()
  const { setAuth } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const { setCurrentLoggedUserData } = useCommonData();

  interface SidebarItemProps {
    title: string;
    route: string;
    icon: React.ReactElement;
    selectedTitle: string;
    navConfirmation: (title: string, path: string) => void;
    isAdminOnly?: boolean;
    isAdmin?: boolean;
  }

  const SidebarItem = ({
    title,
    route,
    icon,
    selectedTitle,
    navConfirmation,
    isAdminOnly = false,
    isAdmin = false
  }: SidebarItemProps) => {
    if (isAdminOnly && !isAdmin) return null;

    const isActive = selectedTitle === title;

    return (
      <div
        className={isActive ? "title" : "titles"}
        onClick={() => navConfirmation(title, route)}
        style={{
          background: isActive ? "var(--sidebar-selected-bg)" : undefined,
          borderRadius: isActive ? "10px" : undefined,
          gap: "15px"
        }}
      >
        <div className="icon">{icon}</div>
        <div style={{ width: "100%" }}>{title}</div>
      </div>
    );
  };

  useEffect(() => {
    const pathMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/assets": "Assets",
      "/asset-locations": "Asset Locations",
      "/asset-mapping": "Asset Mapping",
      "/users": "Users",
      "/settings": "Settings"
    };
    setSelectedTitle(pathMap[location.pathname] || "");
  }, [location.pathname]);

  async function userData() {
    try {
      const res = await axiosPrivate.get('/userData');
      if (res.status === 200) {
        const { name, userName, isAdmin } = res.data.data;

        setCurrentLoggedUserData((prevData: any) => ({
          ...prevData,
          isAdmin: isAdmin ?? prevData.isAdmin,
          userName: userName ?? prevData.userName,
          name: name ?? prevData.name,
        }));
        setIsAdmin(isAdmin);
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
    }
  }

  useEffect(() => {
    userData()
  }, []);

  const navConfirmation = (Select: string, navTo: string) => {
    if (isFormModified && location.pathname !== navTo) {
      setShowChangesModal(true);
    } else {
      setSelectedTitle(Select);
      navigate(navTo);
    }
  };




  // #545454db

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

  const completeLogout = () => {
    setShowChangesModal(false);
    dispatch(resetFormModified(false));
    setAuth({});
    localStorage.clear();
    navigate("/");
  };

  const menuItems: SidebarItemProps[] = [
    { title: "Dashboard", route: "/dashboard", icon: <DashboardIcon />, selectedTitle, navConfirmation },
    { title: "Assets", route: "/assets", icon: <AssestsIcon />, selectedTitle, navConfirmation },
    { title: "Asset Locations", route: "/asset-locations", icon: <ScansIcon />, selectedTitle, navConfirmation },
    { title: "Asset Mapping", route: "/asset-mapping", icon: <CapturesIcon />, selectedTitle, navConfirmation },
    { title: "Users", route: "/users", icon: <UserIcon />, selectedTitle, navConfirmation, isAdminOnly: true, isAdmin },
    { title: "Settings", route: "/settings", icon: <SettingsIcon />, selectedTitle, navConfirmation },


  ];

  return (
    <>
      <div className="side-main-navbar">
        <div className="vessel-management-sidebar expanded">
          <div className="menu-items-wrapper">
            {menuItems.map((item) => (
              <SidebarItem key={item.title} {...item} />
            ))}
            <div
              className={selectedTitle === "Logout" ? "title" : "titles"}
              onClick={() => setShowChangesModal(true)}
              style={{
                background: selectedTitle === "Logout" ? "var(--sidebar-selected-bg)" : undefined,
                borderRadius: "10px",
                gap: "15px"
              }}
            >
              <div className="icon">
                <LogoutIcon />
              </div>
              <div style={{ width: "100%" }}>Logout</div>
            </div>
          </div>

          {/* 🔴 Fixed red box at bottom */}
          <div className="red-bottom-box">
            <div className="user-icon"></div>
            <div className="username">{name}</div>
          </div>
        </div>
      </div>


      {showChangesModal && (
        <Logoutmodal
          clearValue={() => setShowChangesModal(false)}
          handleSignOut={handleLogout}
          modelType="signOut"
        />
      )}
    </>
  );
}
