import { ReactComponent as MyProfile } from "../../assets/icons/my-profile.svg";
import { FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import DeleteModal from "../common-component/modals/delete-modal";
import { removeCookie } from "../../services/utils/cookie-utils";
import { useDispatch } from "react-redux";
import { resetFormModified } from "../../redux/action";
import Changesmodal from "../common-component/modals/changes-modal";
import { useSelector } from "react-redux";
import '../../styles/pages/my-profile/my-profile-menu-modal.scss';
import { axiosPrivate } from "../../middleware/axios-api";
import useAuth from "../../services/hooks/useauth";
interface propsType {
    handleUserNameIcon: () => void;
    overviewRecords: any;
}

function MyProfileMenuModal({ handleUserNameIcon, overviewRecords }: propsType) {
    const [showModel, setShowModel] = useState(false)
    const [currentValue, setCurrentValue] = useState('')
    const [showChangesModal, setShowChangesModal] = useState<boolean>(false);//changes modal
    const isFormModified = useSelector((state: any) => state.isFormModified);
    const profileRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    let isOpend = false;
    let isLeaveModal = false;
    const { setAuth } = useAuth();

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        isOpend = true;
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleClickOutside = (event: MouseEvent) => {
        const currentCheck = !isLeaveModal ? ["my-profile-modal-component", "profile-name-main", "profile-name-bottom-main", "profile-name", "profile-email", "profile-date", "myprofile-main", "icon", "name"] : [''];
        if (
            isOpend &&
            profileRef.current &&
            !profileRef.current.contains(event.target as Node) &&
            !currentCheck.includes((event.target as HTMLElement).className)
        ) {
            handleUserNameIcon()
        }
    };

    function handleMenus(value: string) {
        if (isFormModified) {
            setCurrentValue(value)
            setShowChangesModal(true)
            isLeaveModal = true;
        } else {
            changeMenuPage(value)
        }
    }

    function changeMenuPage(value: string) {
        if (value === "myProfile") {
            navigate('/my-profile')
            handleUserNameIcon()
        } else if (value === "signOut") {
            setShowModel(true)
        }
    }

    const handleSignOut = async () => {
        if (isFormModified) {
            setShowChangesModal(true)
            isLeaveModal = true;
        }
        try {
            const response = await axiosPrivate.post(`signOut`);
            if (response.status === 200) {
                removeCookie('token')
                setAuth({ })
                navigate('/')
                handleUserNameIcon()
                dispatch(resetFormModified(false));
            }
        } catch (error: any) {
        }
    }

    return (
        <div ref={profileRef} className='my-profile-modal-component'>
            <div className='profile-name-main'>
                <p className='profile-name'>{overviewRecords['Full Name'] && overviewRecords['Full Name'].length > 20 ? overviewRecords['Full Name'].substring(0, 20) + '...' : overviewRecords['Full Name']}</p>
                <p className='profile-email'>{overviewRecords['Email'] && overviewRecords['Email'].length > 27 ? overviewRecords['Email'].substring(0, 27) + '...' : overviewRecords['Email']}</p>
                <p className='profile-date'>{overviewRecords['Last Login']}</p>
            </div>
            <div className='profile-name-bottom-main'>
                <div className='myprofile-main' onClick={() => handleMenus('myProfile')}>
                    <p className='icon'>
                        <MyProfile style={{ height: "25px", width: "25px" }} className="my-profile-icon" />
                    </p>
                    <p className='name'>{"My Profile"}</p>
                </div>
                <div className='myprofile-main' style={{ borderBottom: "0px" }} onClick={() => handleSignOut()}>
                    <p className='icon'>
                        <FaSignOutAlt className='icon' style={{ height: "25px", width: "25px" }} />
                    </p>
                    <p className='name'>{"Sign Out"}</p>
                </div>
            </div>
            {
                showModel &&
                <DeleteModal
                    clearValue={(value: any) => {
                        setShowModel(value)
                        handleUserNameIcon()
                    }}
                    handleSignOut={() => { handleSignOut() }}
                    modelType={'signOut'}
                />
            }
            {
                showChangesModal &&
                <Changesmodal
                    closeModal={() => {
                        handleUserNameIcon()
                        setShowChangesModal(false)
                    }}
                    handleClose={() => {
                        setShowChangesModal(false);
                    }}
                    leavePage={() => {
                        changeMenuPage(currentValue)
                        setShowChangesModal(false);
                        dispatch(resetFormModified(false));
                    }}
                />
            }
        </div>
    )
}

export default MyProfileMenuModal;