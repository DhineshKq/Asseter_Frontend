import { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from '../services/hooks/useaxios-private';
import { useCommonData } from '../services/context/useContext';
import Changesmodal from '../components/common-component/modals/changes-modal';

interface SidebarItemProps {
  title: string;
  route: string;
  caption: string;
  selectedTitle: string;
  navConfirmation: (title: string, path: string) => void;
}

function SidebarItem({
  title,  
  route,
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
      <div className="sidebar-nav-copy">
        <span>{title}</span>
        <small>{caption}</small>
      </div>
    </button>
  );
}

export default function SideBar() {
  const { setCurrentLoggedUserData } = useCommonData();
  const [selectedTitle, setSelectedTitle] = useState("");
  const isFormModified = useSelector((state: any) => state.isFormModified);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ title: string; route: string } | null>(null);
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const pathMap: Record<string, string> = {
      "/dashboard": "Dashboard",
      "/assets": "Inward",
      "/asset-locations": "Locations",
      "/asset-mapping": "Allocation",
      "/ip-mapping": "IP Mapping",
      "/credential-manager": "Credential Manager",
      "/eb-tracker": "EB Tracker",
      "/users": "Users"
    };
    setSelectedTitle(pathMap[location.pathname] || "");
  }, [location.pathname]);

  const navConfirmation = (select: string, navTo: string) => {
    if (isFormModified && location.pathname !== navTo) {
      setPendingNavigation({ title: select, route: navTo });
      setShowChangesModal(true);
    } else {
      setSelectedTitle(select);
      navigate(navTo);
    }
  };

  const menuItems: SidebarItemProps[] = [
    { title: "Dashboard", route: "/dashboard", caption: "Overview and health", selectedTitle, navConfirmation },
    { title: "Inward", route: "/assets", caption: "Inventory records", selectedTitle, navConfirmation },
    { title: "Locations", route: "/asset-locations", caption: "Teams and places", selectedTitle, navConfirmation },
    { title: "Allocation", route: "/asset-mapping", caption: "Ownership mapping", selectedTitle, navConfirmation },
    { title: "IP Mapping", route: "/ip-mapping", caption: "Subnet ownership", selectedTitle, navConfirmation },
    { title: "EB Tracker", route: "/eb-tracker", caption: "Access vault", selectedTitle, navConfirmation },
    { title: "Credential Manager", route: "/credential-manager", caption: "Access vault", selectedTitle, navConfirmation },

    { title: "Employees", route: "/users", caption: "People for asset mapping", selectedTitle, navConfirmation },
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
        </div>
      </div>

      {showChangesModal && (
        <Changesmodal
          closeModal={() => {
            setShowChangesModal(false);
            setPendingNavigation(null);
          }}
          leavePage={() => {
            if (pendingNavigation) {
              setSelectedTitle(pendingNavigation.title);
              navigate(pendingNavigation.route);
            }
            setShowChangesModal(false);
            setPendingNavigation(null);
          }}
          handleClose={() => {
            setShowChangesModal(false);
            setPendingNavigation(null);
          }}
        />
      )}
    </>
  );
}
