import SideBar from '../../config/side-navbar-config';
import "../../styles/layouts/side-main-navbar.scss"

interface Props {
    filterClick: (val: any) => void
    filterIconStatus: any
}

function SideNavBar({ filterClick, filterIconStatus }: Props) {
    void filterClick;
    void filterIconStatus;

    return (
        <div className='side-main-navbar'>
            <SideBar />
        </div>
    )
}

export default SideNavBar
