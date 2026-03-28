import { useEffect, useState } from 'react'
import { ReactComponent as DashboardIcon } from '../assets/web-icons/dashboard.svg';
import { ReactComponent as AssestsIcon } from '../assets/web-icons/assets.svg';
import { ReactComponent as ScansIcon } from '../assets/web-icons/Scans.svg';
import { ReactComponent as CapturesIcon } from '../assets/web-icons/captures.svg';
import { ReactComponent as LogoutIcon } from '../assets/web-icons/Logout.svg';
import { ReactComponent as UserIcon } from '../assets/web-icons/Users.svg';
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { resetFormModified } from '../redux/action';
import Logoutmodal from '../components/common-component/modals/delete-modal'
import useAxiosPrivate from '../services/hooks/useaxios-private';
import useAuth from '../services/hooks/useauth';
import { useCommonData } from '../services/context/useContext';

interface SidebarItemProps {
  title: string;
  route: string;
  icon: React.ReactElement;
  caption: string;
  selectedTitle: string;
  navConfirmation: (title: string, path: string) => void;
}

function SidebarItem({
  title,
  route,
  icon,
  caption,
  selectedTitle,
  navConfirmation
}: SidebarItemProps) {
  const isActive = selectedTitle === title;

  return (
    <button
      type="button"
      className={`sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : ""}`}
      onClick={() => navConfirmation(title, route)}
      title={`${title} - ${caption}`}
    >
      <div className="sidebar-nav-icon">{icon}</div>
      <div className="sidebar-nav-copy">
        <span>{title}</span>
      </div>
    </button>
  );
}

export default function SideBar() {
  const { setCurrentLoggedUserData } = useCommonData();
  const [selectedTitle, setSelectedTitle] = useState("");
  const isFormModified = useSelector((state: any) => state.isFormModified);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const dispatch = useDispatch();
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate()
  const { setAuth } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const pathMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/assets": "Assets",
      "/asset-locations": "Asset Locations",
      "/asset-mapping": "Asset Mapping",
      "/ip-mapping": "IP Mapping",
      "/credential-manager": "Credential Manager",
      "/eb-tracker": "EB Tracker",
      "/users": "Users"
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

  const navConfirmation = (select: string, navTo: string) => {
    if (isFormModified && location.pathname !== navTo) {
      setShowChangesModal(true);
    } else {
      setSelectedTitle(select);
      navigate(navTo);
    }
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

  const completeLogout = () => {
    setShowChangesModal(false);
    dispatch(resetFormModified(false));
    setAuth({});
    localStorage.clear();
    navigate("/");
  };

  const menuItems: SidebarItemProps[] = [
    { title: "Dashboard", route: "/dashboard", icon: <DashboardIcon />, caption: "Overview and health", selectedTitle, navConfirmation },
    { title: "Assets", route: "/assets", icon: <AssestsIcon />, caption: "Inventory records", selectedTitle, navConfirmation },
    { title: "Asset Locations", route: "/asset-locations", icon: <ScansIcon />, caption: "Teams and places", selectedTitle, navConfirmation },
    { title: "Asset Mapping", route: "/asset-mapping", icon: <CapturesIcon />, caption: "Ownership mapping", selectedTitle, navConfirmation },
    { title: "IP Mapping", route: "/ip-mapping", icon: <ScansIcon />, caption: "Subnet ownership", selectedTitle, navConfirmation },
    { title: "Credential Manager", route: "/credential-manager", icon: <UserIcon />, caption: "Access vault", selectedTitle, navConfirmation },
    { title: "EB Tracker", route: "/eb-tracker", icon: <CapturesIcon />, caption: "Energy readings and units", selectedTitle, navConfirmation },
    { title: "Employees", route: "/users", icon: <UserIcon />, caption: "People for asset mapping", selectedTitle, navConfirmation },
  ];

  return (
    <>
      <div className="vessel-management-sidebar expanded">
        <div className="sidebar-top">
          <div className="sidebar-brand-card">
            <p className="sidebar-eyebrow">InfraPilot 360</p>
            <div className="sidebar-brand-title-row">
              <h2>Command Center</h2>
              <small>{menuItems.length} Modules</small>
            </div>
            <span>{isAdmin ? "Administrator Access" : "Workspace Access"}</span>
          </div>
        </div>

        <div className="menu-items-wrapper">
          <div className="sidebar-section-label">Navigation</div>
          <div className="sidebar-nav-list">
            {menuItems.map((item) => (
              <SidebarItem key={item.title} {...item} />
            ))}
          </div>
          <button
            type="button"
            className="sidebar-nav-item sidebar-nav-item-logout"
            onClick={() => setShowChangesModal(true)}
          >
            <div className="sidebar-nav-icon">
              <LogoutIcon />
            </div>
            <div className="sidebar-nav-copy">
              <span>Logout</span>
              <small>End current session</small>
            </div>
          </button>
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
