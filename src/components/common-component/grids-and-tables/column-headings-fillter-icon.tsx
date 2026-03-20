import { useEffect, useState } from 'react'; 
import { BsEyeSlashFill, BsEyeFill } from 'react-icons/bs';

const ColumnHeadingsFillterIcon: React.FC<any> = (props) => {
    const [iconClicked, setIconClicked] = useState(props.isGridEyeFilter);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    let classes = [
        "grid-eye-filter",
        "searching-bar",
        "searching-checkbox",
        "select-all",
        "input-box",
        "search-icon",
        "column-headings",
        "header-list-checkbox",
        "menu-icon",
        "names",
        "drop-area",
        "column-headings",
        "header-list-checkbox",
        "menu-icon",
        "names",
        "drop-area",
        "column-headings",
        "header-list-checkbox",
        "names",
        'input-box-Input',
        "drop-area"
    ]

    const handleClickOutside = (event: MouseEvent) => {
        // Get the class name of the clicked element
        const clickedClassName = (event.target as HTMLElement).className;
        const clickedId = (event.target as HTMLElement).id;
        const element = (event.target as HTMLElement).tagName;
        // Check if the clicked class name is not in the 'classes' array
        if (classes.indexOf(clickedClassName) === -1 && clickedId !== "Menu_Burger" && clickedId !== "search" && element !== "path" && element !== "g" && element !== "svg") {
            setIconClicked(false);
        }
    };

    function handleIconClick(event: any) {
        setIconClicked(!iconClicked);
        props.handleGridEyeFilter(iconClicked, event)
    };

    return (
        <div>
            <span>{props.displayName}</span>
            <span
                data-testid="column-icon"
                className="header-icon"
                onClick={(event) => {
                    handleIconClick(event)
                }}
            >
                {!iconClicked ? <BsEyeFill className='icon' /> : <BsEyeSlashFill className='icon' />}
            </span>
        </div>
    );
};

export default ColumnHeadingsFillterIcon;