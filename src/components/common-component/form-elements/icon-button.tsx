import { MdDeleteForever } from "react-icons/md";
import { MdModeEdit } from "react-icons/md";
import { FaKey } from 'react-icons/fa';
import { IoFingerPrintSharp, IoAdd } from 'react-icons/io5';
import { MdDialpad } from 'react-icons/md';
import { TfiImport } from 'react-icons/tfi';
import { BiFilter } from 'react-icons/bi';
import { LuFilterX } from "react-icons/lu";
import { BiCaretDown } from 'react-icons/bi';
import { RxCross1 } from 'react-icons/rx';
import { IoEye } from "react-icons/io5";
import { IoMdSync } from "react-icons/io";
import { IoRefreshSharp } from "react-icons/io5";
import { MdLock } from "react-icons/md";
import { IoMdShare } from "react-icons/io";  // Share icon
import { MdQrCodeScanner } from "react-icons/md"; // Rescan (QR Code Scanner) icon
import { MdRepeat } from "react-icons/md"; // Repeat icon
import pAndl_png from '../../../assets/images/p&L.png'
import laytime_png from '../../../assets/images/laytime.png'
import invoices_png from '../../../assets/images/invoices.png'
import { ReactComponent as Save } from '../../../assets/icons/save.svg'
import { ReactComponent as OperationsEdit } from '../../../assets/icons/operations-edit.svg'
import gridDownload from '../../../assets/images/grid-download.png'
import { IoMdDownload } from "react-icons/io";
import { LuListFilter } from "react-icons/lu";
import { FiEdit3 } from 'react-icons/fi';
import { RiDeleteBin6Line, RiPrinterFill } from 'react-icons/ri';
import { ReactComponent as Laytime } from '../../../assets/icons/laytime.svg'
import { ReactComponent as PAndL } from '../../../assets/icons/p-and-l.svg'
import { ReactComponent as Invoices } from '../../../assets/icons/invoices.svg'
import '../../../styles/common-components/form-elements/icon-button.scss';
// import Otp from '../../../assets/icons/icon-otp.svg'
// import { ReactComponent as Fetch } from '../../../assets/icons/fetch.svg'
// import Expand from '../../../assets/icons/expand.svg'
// import { ReactComponent as Message } from '../../../assets/icons/message.svg'
// import { ReactComponent as MessageNotify } from '../../../assets/icons/messageNotify.svg'
// import { ReactComponent as Eye } from '../../../assets/icons/eyeshowoff.svg'
// import { ReactComponent as ShowEye } from '../../../assets/icons/ShowEye.svg'
// import { ReactComponent as Documentation } from '../../../assets/icons/documentationicon.svg'

interface Props {
    iconName: string;
    height: string;
    width: string;
    fontSize: string;
    color: string;
    backgroundColor: string;
    margin?: string;
    border?: string;
    className?: string
    hover: boolean;
    borderRadius?: string;
    padding?: string;
    disabled?: boolean;
    transform?: string;
    opacity?: string;
    cursor?: string;
    handleClick: (val: any) => void;
    refreshIconRotate?: boolean;
}

export default function IconButton({ disabled, iconName, height, width, fontSize, color, border, backgroundColor, transform, borderRadius, hover, padding, opacity, cursor, refreshIconRotate, handleClick, margin }: Props) {
    const className = hover ? 'icon-button hover' : 'icon-button';

    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter' && !disabled) {
            // If Enter key is pressed while focused,   trigger the click action
            handleClick(event);
        }
    };
    const handleKeyUp = (event: any) => {
        if (event.key === ' ' && !disabled) {
            // If Enter key is pressed while focused,   trigger the click action
            handleClick(event);
        }
    };
    return (
        <div tabIndex={hover ? 0 : -1}
            autoFocus
            data-testid="icon-button"
            className={className}
            style={{ height, width, border, color, backgroundColor, margin, borderRadius, padding, transform, opacity, cursor }}
            onClick={(e) => {
                if (disabled) return;
                handleClick(e)
            }}
            onKeyDown={(e) => {
                handleKeyPress(e)
            }}
            onKeyUp={(e) => {
                handleKeyUp(e)
            }}
        >
            {iconName === "Delete" && <MdDeleteForever data-testid="delete-icon" style={{ fontSize }} />}
            {iconName === "lock" && <MdLock data-testid="lock-icon" style={{ fontSize }} />}
            {iconName === "Key" && <FaKey style={{ fontSize }} />}
            {iconName === "FingerPrint" && <IoFingerPrintSharp style={{ fontSize }} />}
            {iconName === "Eye" && <IoEye style={{ fontSize }} />}
            {iconName === "DialPad" && <MdDialpad style={{ fontSize }} />}
            {iconName === "DownArrow" && <BiCaretDown style={{ fontSize }} />}
            {iconName === "Edit" && <MdModeEdit style={{ fontSize }} />}
            {iconName === "Download" && <IoMdDownload style={{ fontSize }} />}
            {iconName === "Upload" && <TfiImport style={{ fontSize, transform: "rotate(180deg)" }} />}
            {iconName === "Filter" && <LuListFilter style={{ fontSize: "22px" }} />}
            {iconName === "ClearFilter" && <LuFilterX style={{ fontSize }} />}
            {iconName === "Add" && <div className="add-icon-main"><IoAdd className='add-icon' />{` Add`}</div>}
            {iconName === "AddPlus" && <div className="add-icon-main"><IoAdd className='add-icon' /></div>}
            {iconName === "Update" && <div className="add-icon-main">{`Update`}</div>}
            {iconName === "Vendor" && <div ><IoAdd className='add-icon' />{` Vendor`}</div>}
            {iconName === "Invoice" && <div ><IoAdd className='add-icon' />{` Invoice`}</div>}
            {iconName === "eyeFillter" && <div ><IoAdd className='add-icon' />{` Add`}</div>}
            {iconName === "view&edit" && <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }} ><IoEye className='add-icon' style={{ fontSize }} color={color} />{` View & Edit`}</div>}
            {iconName === "refresh" && <div className={`${refreshIconRotate ? "refreshIconRotate" : ""}`}><IoRefreshSharp style={{ fontSize }} /> </div>}
            {iconName === "layTime" && <div ><img src={laytime_png} width={28} />{` Laytime`}</div>}
            {iconName === "pAndL" && <div > <img src={pAndl_png} width={30} /> {` P&L`}</div>}
            {iconName === "invoices" && <div ><img src={invoices_png} width={30} />{` Invoices`}</div>}
            {iconName === "save" && <div ><Save className='add-icon' /></div>}
            {iconName === "operationsEdit" && <div ><OperationsEdit className='add-icon' /></div>}
            {iconName === "gridDownload" && <div ><img src={gridDownload} width={30} /></div>}
            {iconName === "Request" && <div ><IoAdd className='add-icon' />{` Request`}</div>}
            {iconName === "print" && <div ><RiPrinterFill className='add-icon' color={color} /></div>}
            {iconName === "decline" && <div><RxCross1 style={{ fontSize, }} className='add-icon' />{` Decline`}</div>}
            {iconName === "tallySync" && <div><IoMdSync style={{ fontSize, color }} className='tally-icon' />{` Tally Sync`}</div>}
            {iconName === "Rescan" && <MdQrCodeScanner style={{ fontSize }} />}
            {iconName === "Share" && <IoMdShare style={{ fontSize }} />}
            {iconName === "Repeat" && <MdRepeat style={{ fontSize }} />}


            {/* {iconName === "invoices" && <div ><Invoices className='add-icon' />{` Invoices`}</div>} */}
            {/* {iconName === "layTime" && <div ><Laytime className='add-icon' />{` Laytime`}</div>} */}
            {/* {iconName === "pAndL" && <div ><PAndL className='add-icon' />{` P&L`}</div>} */}
            {/* {iconName === "Otp" && <img src={Otp} />} */}
            {/* {iconName === "Fetch" && <div className='fetch-icon'><Fetch />{` Fetch`}</div >} */}
            {/* {iconName === "Expand" && <div className='expand-icon'><img src={Expand} />{` Expand All`}</div >} */}
            {/* {iconName === "Message" && <div className='message-icon'><Message />{` `}</div >} */}
            {/* {iconName === "MessageNotify" && <div className='messagenotify-icon'><MessageNotify />{``}</div >} */}
            {/* {iconName === "Eye" && <div className='eye-icon'><IoEye />{``}</div >} */}
            {/* {iconName === "Eye" && <div><IoEye style={{ fontSize }}/></div >} */}
            {/* {iconName === "Notification" && <div className='notification-icon'><Notification />{``}</div >} */}
            {/* {iconName === "Eye-white" && <div className='eye-icon'><Eye />{``}</div >} */}
            {/* {iconName === "ShowEye" && <div className='eye-icon'><ShowEye />{``}</div >} */}
            {/* {iconName === "Documentation" && <div className='document-icon'><Documentation />{``}</div >} */}
        </div>
    )
}