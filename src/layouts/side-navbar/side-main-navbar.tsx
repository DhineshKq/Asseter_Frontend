import { useEffect, useState } from 'react'
import SideBar from '../../config/side-navbar-config';
import thunderImg from '../../assets/web-images/thunder.svg'
import "../../styles/layouts/side-main-navbar.scss"
import ButtonComponent from '../../components/common-component/form-elements/button-component'
import AnimatedBtn from '../../components/common-component/animated_btn/Animated-btn'
import img from "../../assets/web-images/loginBanner.png"
interface Props {
    filterClick: (val: any) => void
    filterIconStatus: any

}
function SideNavBar({ filterClick, filterIconStatus }: Props) {
    // Function for shortcut key to oen and close side nav bar
    const filterClickShortcut = () => {
        filterClick(!filterIconStatus)
    };
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
 
    // Update screen width on resize
    useEffect(() => {
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
   
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return (
        <>
            <div className='side-main-navbar'>

                <div className="scanBtn" style={{ marginRight: "20px", marginTop:"60px",marginLeft:"20px",display:"none",justifyContent:"center",  }} >
                    <AnimatedBtn
                    
                    />


                </div>

                {
                    <SideBar />
                }
            </div>
        </>
    )
}
export default SideNavBar