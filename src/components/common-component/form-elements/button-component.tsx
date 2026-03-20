import { BsArrowRight } from 'react-icons/bs';
import '../../../styles/common-component/button-component.scss';

interface Styles {
    title: string | any;
    height: string;
    width: string;
    backgroundColor: string;
    color: string;
    disabled?: boolean;
    margin?: string;
    boxShadow?: string;
    border?: string;
    borderRadius?: string;
    icon?: string;
    imageSrc?: string;
    className: "button-component" | "button-component common-btn" | "button-component-hover" | "button-component-hover common-btn" | "button-component-hover cancel" | "button-component-hover disabled" | "button-component disabled" | "button-border" | "previous-disabled";
    handleClick: () => void;
    cursor?: string;
}

export default function ButtonComponent({ title, height, width, disabled, boxShadow, backgroundColor, borderRadius, color, className, handleClick, margin, border, icon, imageSrc, cursor }: Styles) {
    
    return (
        <div className={className} style={{ width, margin }}>
            <button
                disabled={disabled}
                style={{
                    height,
                    width: "100%",
                    boxShadow,
                    background: disabled ? '#ccc' : backgroundColor,
                    color: disabled ? '#666' : color,
                    border,
                    borderRadius,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.7 : 1,
                }}
                onClick={handleClick}

            >
                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt="icon"
                        style={{ height: "25px", width: "25px", objectFit: "contain" }}
                    />
                )}
                {icon === "tick" && <span style={{ marginRight: "10px" }}>{'✓'}</span>}
                {title}
                <BsArrowRight className='arrow-icon' style={{ display: "none" }} />
            </button>
        </div>
    );
}
