import { ReactComponent as HamburgerMenu } from "../../assets/icons/hamburger-menu.svg";
import Logo from '../../assets/logos/kqLogo.png'
import '../../styles/layouts/header.scss'
import 'rc-tooltip/assets/bootstrap.css';
import { useLocation } from 'react-router-dom';


interface Props {
    filterClick: (val: any) => void
    filterIconStatus: any
}



// Icons for notification 


export default function Header({ filterClick, filterIconStatus }: Props) {
    const location = useLocation();

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

    return (
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
        </div >
    )
}
