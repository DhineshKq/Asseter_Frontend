import { useContext, useEffect, useRef, useState } from 'react'
import { ReactComponent as HamburgerMenu } from "../../assets/icons/hamburger-menu.svg";
import Logo from '../../assets/logos/kqLogo.png'
import DropdownComponent from '../../components/common-component/form-elements/dropdown-component'
import useAxiosPrivate from '../../services/hooks/useaxios-private';
import '../../styles/layouts/header.scss'
import 'rc-tooltip/assets/bootstrap.css';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../ThemeContext';
import { Palette } from "lucide-react";
import { useCommonData } from '../../services/context/useContext';


interface Props {
    filterClick: (val: any) => void
    filterIconStatus: any
    chatIconClick: (val: any) => void
    socketIoChanges: () => void
    chatIconClickStatus: any
    handleTotalUsers: any
}



// Icons for notification 


export default function Header({ filterClick, filterIconStatus }: Props) {
    const axiosPrivate = useAxiosPrivate();
    const [workspace, setWorkspace] = useState<any>()
    const [defaultWorkspace, setDefaultWorkspace] = useState<any>([]);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);
    const themes = [
        { name: 'light', label: 'Default', color: '#4a5a9b', type: 'light' },
        { name: 'sunset', label: 'Sunset', color: '#953b1d', type: 'light' },
        { name: 'aqua', label: 'Ocean Blue', color: '#465efb', type: 'light' },
        { name: 'purple', label: 'Deep Purple', color: '#4b3c69', type: 'light' },
        { name: 'dark', label: 'Night Owl', color: '#0f0f0f', type: 'dark' },
        { name: 'galaxy', label: 'Galaxy', color: '#1a1b2f', type: 'dark' },
        { name: 'nord', label: 'Nordic Frost', color: '#2e3440', type: 'dark' },
        { name: 'deepsea', label: 'Deep Sea', color: '#011627', type: 'dark' }
    ];
    const { setCurrentLoggedUserData, currentLoggedUserData } = useCommonData();

    const radius = 150;
    const center = 200;
    const sliceAngle = (2 * Math.PI) / themes.length;

    const getPath = (index: number) => {
        const startAngle = index * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);

        return `M${center},${center} L${x1},${y1} A${radius},${radius} 0 0,1 ${x2},${y2} Z`;
    };

    const [initialTheme, setInitialTheme] = useState<any>("");

    const handleOpen = () => {
        setInitialTheme(theme); // From context
        setHovered(themes.findIndex((t) => t.name === theme));
        setOpen(true);
    };


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
            if (event.altKey && event.key.toLowerCase() === 't') {
                event.preventDefault();
                handleOpen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    async function getWorkspaceData() {
        try {
            const response = await axiosPrivate.get("/getWorkSpaces");

            if (response.data.status) {
                const options = response.data.options;
                setWorkspace(options); // [{value, label}, ...]
                const defaultWs = response.data.defaultWorkspace[0];
                setCurrentLoggedUserData((prev: any) => ({
                    ...prev,
                    workspaceOptions: options,
                    workspaceId: defaultWs.id
                }))

                const savedWorkspace = localStorage.getItem("workspaceId");
                const savedOption = options.find((opt: any) => opt.id === savedWorkspace);

                const initial = savedOption
                    ? { value: savedOption.value, label: savedOption.label, id: savedOption.id }
                    : { value: defaultWs.value, label: defaultWs.label, id: defaultWs.id };

                setDefaultWorkspace(initial);
                localStorage.setItem("workspaceId", initial?.id);
                // Save if not already set
                if (!savedWorkspace) {
                    localStorage.setItem("workspaceId", defaultWs.id);
                }
            }
        } catch (error) {
            console.error("Error fetching workspaces:", error);
        }
    }

    // Function for shortcut key to oen and close side nav bar
    const filterClickShortcut = () => {
        filterClick(!filterIconStatus)
    };


    useEffect(() => {
        getWorkspaceData();
    }, []);
    const { theme, setTheme } = useContext(ThemeContext);

    return (
        <div className={"header-main"}>
            <div className={"kq-logo"}>
                <img src={Logo} alt={"Logo"} draggable={false} className={"kq-logo-image"} />
                <div>
                    <HamburgerMenu className={"sideNavBar-lines"} onClick={filterClickShortcut} />
                </div>
            </div>
            <div className={"header-sub"}>
                <div className={"profile-notification-section"}>
                    {<>
                        <button title="Alt + t" className="open-wheel-btn button-color" onClick={handleOpen} style={{ display: "none" }}>
                            <Palette style={{ marginRight: "5px" }} className="w-4 h-4 mr-2 inline" />
                            {"Change Theme"}
                        </button>

                        {open &&
                            <div className="modal-backdrop-modal" onClick={() => setOpen(false)}>

                                <svg
                                    viewBox="0 0 400 400"
                                    className="theme-wheel"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {themes.map((theme: any, index) => (
                                        <path
                                            key={theme.name}
                                            d={getPath(index)}
                                            fill={theme.color}
                                            className={`slice ${hovered === index ? "hovered" : ""}`}
                                            onMouseEnter={() => {

                                                setHovered(index)
                                                setTheme(theme.name);
                                            }

                                            }
                                            onMouseLeave={() => {
                                                setHovered(themes.findIndex((t) => t.name === initialTheme));
                                                setTheme(initialTheme);
                                            }}
                                            onClick={() => {
                                                setTheme(theme.name);
                                                setOpen(false)
                                            }}
                                        />
                                    ))}

                                    <circle cx={center} cy={center} r="40" fill="#000" />
                                    <text
                                        x={center}
                                        y={center + 5}
                                        textAnchor="middle"
                                        fill="#fff"
                                        style={{ fontSize: 10, fontWeight: 500 }}

                                    >
                                        {themes.find((data: any) => data.name == theme)?.label}
                                    </text>
                                </svg>
                            </div>
                        }
                    </>
                    }
                    <div style={{ width: '200px' }} key={uuidv4()}>

                        <DropdownComponent
                            // className='dropdown'
                            options={currentLoggedUserData.workspaceOptions}
                            isDisabled={false}
                            width={"100%"}
                            title={""}
                            defaultValue={[defaultWorkspace]}
                            getData={(val) => {
                                if (val?.id) {
                                    console.log(val.id, "Selected workspace ID");
                                    localStorage.setItem("workspaceId", val.id);
                                    setDefaultWorkspace(val);
                                    setCurrentLoggedUserData((prev: any) => ({
                                        ...prev,
                                        workspaceId: val.id
                                    }))
                                    navigate('/dashboard');
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

        </div >
    )
}