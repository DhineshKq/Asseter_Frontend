import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import "../../../styles/common-component/input-component.scss";
import { AiOutlineMail, AiFillCaretDown } from "react-icons/ai";
import { MdDone } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import { IoMdAdd } from "react-icons/io";
import { OverlayTrigger, Tooltip, FormControl, Placeholder } from "react-bootstrap";
import { ReactComponent as BoxArrow } from "../../../assets/icons/left-box-arrow.svg";
import { FaRupeeSign } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import { BsCurrencyDollar } from "react-icons/bs";
interface Styles {
    height: string;
    width: string;
    padding?: string;
    textAlign?: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent';
    border: string;
    borderRadius: string;
    backgroundColor: string;
    color: string;
    type: "text" | "number" | "password" | "email" | any;
    placeHolder?: string;
    inputTitle?: string;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    autoFocus?: boolean;
    blockCopyPaste?: boolean;
    showTooltipTitle?: boolean;
    maxLength?: number;
    margin?: string;
    max?: string;
    min?: string;
    //GSTIN and PAN
    inputField?: string;
    className?: "mobilenumber-input" | "gmail-input" | "address-input" | string;
    points?: any;
    password?: string;
    confirmPassword?: string;
    inputValue?: string | any;
    errorMessage?: string | any;
    getUser: (val: any) => void;
    fieldStatus?: (val: any) => void;
    onFocusOut?: (val: any) => void;
    handleKeyDown?: (val: any) => void;
    handleInputFocus?: (val: any) => void;
}

export default function InputComponent({
    height,
    width,
    padding,
    margin,
    border,
    borderRadius,
    backgroundColor,
    color,
    placeHolder,
    type,
    autoFocus = false,
    inputTitle,
    required,
    readOnly = false,
    disabled = false,
    blockCopyPaste = false,
    showTooltipTitle = true,
    maxLength,
    className,
    inputField,
    textAlign,
    points,
    password,
    inputValue,
    max,
    min,
    errorMessage,
    // handleInputFocus,
    handleKeyDown,
    getUser,
    fieldStatus,
    onFocusOut,

}: Styles) {

    let toolTipwidthVal = width?.replace(/\D/g, "");
    let toolTipwidth = Number(toolTipwidthVal) + 15;

    let inputvalue = inputValue;

    // Mobile Number Value Conditions
    const [mobileValue, setMobileValue] = useState("");
    function mobilehandleChange(value: string) {
        const sanitizedValue = value.replace(/\D/g, "");
        setMobileValue(sanitizedValue);
    }
    const isPhonenumber = mobileValue.length == 10;

    //Password

    //   useEffect(() => {
    //     console.log(inputvalue,"Inputcompont")

    // }, [inputvalue])
    const [passValue, PanValue] = useState("");

    function handleInputFocus(e: any) {
        const { value } = e.target;

        setToolTip(true);
        toolTipvalidate(value);


    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { value } = e.target;
        switch (inputField) {

            case "pan":
                handleInputs(value, /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/);
                break;
            case "ifsc":
                handleInputs(value, /^[a-zA-Z0-9]+$/);
                getUser(value);
                break;
            case "gstin":
                handleInputs(
                    value,
                    /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/
                );
                break;
            case "gmail":
                handleInputs(value, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
                getUser(value);
                break;
            case "mobile":
                mobilehandleChange(value);
                getUser(mobileValue);
                break;
            case "password":
                getUser(mobileValue);
                break;
            default:
                handleInputs(value, null);
                getUser(value);
                break;
        }
        toolTipvalidate(value);
    }
    const [conditionMatching, setconditionMatching] = useState<string[]>([]);
    const [confirmpasswordTooltip, setConfirmpasswordTooltip] = useState<string>('');
    // const [gmialTooltip, setGmailTooltip] = useState<string>('');

    useEffect(() => {
        if (points && conditionMatching.length == points.length && fieldStatus) {
            fieldStatus(false);
        } else if (fieldStatus) {
            fieldStatus(true);
        }
    }, [conditionMatching])

    function toolTipvalidate(value: any) {
        if (!points) return;
        let updatedArray = conditionMatching;
        if (points.some((e: any) => e.pattern === "8 character") && !conditionMatching.includes("8 character") && value.length >= 8) {
            // setconditionMatching((pre) => [...pre, "8 character"]);
            updatedArray = [...updatedArray, "8 character"];
        } else if (value.length < 8) {
            // const updatedArray = conditionMatching.filter((value) => value !== "8 character");
            // setconditionMatching(updatedArray);      
            updatedArray = updatedArray.filter((value) => value !== "8 character");
        }
        if (points.some((e: any) => e.pattern === "uppercase") && !conditionMatching.includes("uppercase") && /[A-Z]/.test(value)) {
            // setconditionMatching((pre) => [...pre, "uppercase"]);
            updatedArray = [...updatedArray, "uppercase"];
        } else if (conditionMatching.includes("uppercase") && !(/[A-Z]/.test(value))) {
            // const updatedArray = conditionMatching.filter((value) => value !== "uppercase");
            // setconditionMatching(updatedArray);
            updatedArray = updatedArray.filter((value) => value !== "uppercase");
        }
        if (points.some((e: any) => e.pattern === "lowercase") && !conditionMatching.includes("lowercase") && /[a-z]/.test(value)) {
            // setconditionMatching((pre) => [...pre, "lowercase"]);
            updatedArray = [...updatedArray, "lowercase"];
        } else if (conditionMatching.includes("lowercase") && !(/[a-z]/.test(value))) {
            // const updatedArray = conditionMatching.filter((value) => value !== "lowercase");
            // setconditionMatching(updatedArray);
            updatedArray = updatedArray.filter((value) => value !== "lowercase");
        }
        if (points.some((e: any) => e.pattern === "specialCharacter") && !conditionMatching.includes("specialCharacter") && (/^(?=.*[\W_])[a-zA-Z0-9\W_]+$/.test(value))) {
            // (/^(?=.*[~!@#$%_-])[a-zA-Z0-9~!@#$%_-]+$/.test(value))
            // setconditionMatching((pre) => [...pre, "specialCharacter"]);      
            updatedArray = [...updatedArray, "specialCharacter"];
        } else if (conditionMatching.includes("specialCharacter") && !(/^(?=.*[\W_])[a-zA-Z0-9\W_]+$/.test(value))) {
            // !(/^(?=.*[~!@#$%_-])[a-zA-Z0-9~!@#$%_-]+$/.test(value))
            // const updatedArray = conditionMatching.filter((value) => value !== "specialCharacter");
            // setconditionMatching(updatedArray);
            updatedArray = updatedArray.filter((value) => value !== "specialCharacter");
        }
        if (points.some((e: any) => e.pattern === "number") && !conditionMatching.includes("number") && /\d/.test(value)) {
            // setconditionMatching((pre) => [...pre, "number"]);
            updatedArray = [...updatedArray, "number"];
        } else if (conditionMatching.includes("number") && !(/\d/.test(value))) {
            // const updatedArray = conditionMatching.filter((value) => value !== "number");
            // setconditionMatching(updatedArray);
            updatedArray = updatedArray.filter((value) => value !== "number");
        }
        if (points.some((e: any) => e.pattern === "confirmpassword") && (password === value)) {
            setConfirmpasswordTooltip("Password Matched");
            // setconditionMatching((pre) => [...pre, "confirmpassword"]);
            updatedArray = [...updatedArray, "confirmpassword"];
        } else if (conditionMatching.includes("confirmpassword") && (password !== value)) {
            // const updatedArray = conditionMatching.filter((value) => value !== "confirmpassword");
            // setconditionMatching(updatedArray);
            setConfirmpasswordTooltip("");
            updatedArray = updatedArray.filter((value) => value !== "confirmpassword");
        }
        if (points.some((e: any) => e.pattern === "using@") && (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value))) {
            // setconditionMatching((pre) => [...pre, "using@"]);
            updatedArray = updatedArray.filter((value) => value !== "using@");
        } else if (conditionMatching.includes("using@")) {
            // const updatedArray = conditionMatching.filter((value) => value !== "using@");
            // setconditionMatching(updatedArray);     
            updatedArray = updatedArray.filter((value) => value !== "using@");

        }
        setconditionMatching(updatedArray);
        return;
    }

    const [handleInputvalue, setHandleInputvalue] = useState("");
    const [pattern, setPattern] = useState<RegExp | null>(null);

    function handleInputs(value: any, pattern: any) {
        setHandleInputvalue(value);
        setPattern(pattern);
    }
    const validateInputs = (
        handleInputvalue: string,
        pattern: RegExp | null
    ): boolean => {
        if (handleInputvalue && pattern) {
            return pattern.test(handleInputvalue);
        }
        return false;
    };
    const isInputvalueValid = validateInputs(handleInputvalue, pattern);

    const [toolTip, setToolTip] = useState(false);

    function handleInputBlur(e: any) {
        setToolTip(false);
        onFocusOut && onFocusOut(e)
    }
    function handleCopy(e: React.ClipboardEvent<HTMLInputElement>) {
        if (blockCopyPaste) {
            e.preventDefault();
        }
    }
    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
        if (blockCopyPaste) {
            e.preventDefault();
        }
    }
    return (
        <>
            <div className={className}>
                {inputTitle && (
                    <div className="title">
                        {inputTitle}
                        {required && <span style={{ color: "red" }}>*</span>}
                    </div>
                )}

                <span className="input-field">
                    {className === "mobilenumber-input" && (
                        <span className="country-name">
                            &nbsp; IN &nbsp;{" "}
                            <span className="contact-icon">
                                <AiFillCaretDown />
                            </span>
                        </span>
                    )}
                    {
                        className === 'input-dollar' ?
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div className="dollar-sign-input" style={{ width: "40px", height: "40px", textAlign: "center" }}>
                                    <BsCurrencyDollar fill="#295285" />
                                </div>
                                <input
                                    className={inputTitle === "Password" ? "input-main" : ""}
                                    style={{ height, width, padding, border, borderRadius, color, backgroundColor, margin, textAlign }}
                                    maxLength={maxLength}
                                    onChange={handleChange}
                                    onFocus={handleInputFocus}
                                    autoFocus={autoFocus}
                                    onKeyDown={handleKeyDown}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                    max={max}
                                    min={min}
                                    // value={inputField == "mobile" ? mobileValue : undefined}
                                    value={inputvalue}
                                    placeholder={placeHolder}
                                    onBlur={handleInputBlur}
                                    onCopy={handleCopy}
                                    onPaste={handlePaste}
                                    type={type}
                                />
                            </div>
                            :
                            <input
                                className={inputTitle === "Password" ? "input-main" : ""}
                                style={{ height, width, padding, border, borderRadius, color, backgroundColor, margin, textAlign }}
                                maxLength={maxLength}
                                onChange={handleChange}
                                onFocus={handleInputFocus}
                                autoFocus={autoFocus}
                                onKeyDown={handleKeyDown}
                                disabled={disabled}
                                readOnly={readOnly}
                                max={max}
                                min={min}
                                // value={inputField == "mobile" ? mobileValue : undefined}
                                value={inputvalue}
                                placeholder={placeHolder}
                                onBlur={handleInputBlur}
                                onCopy={handleCopy}
                                onPaste={handlePaste}
                                type={type}
                            />
                    }
                    {points && toolTip && (
                        // <span className="tool-tip" style={{ right: `-${toolTipwidth}px` }}>
                        <span className="tool-tip" >
                            {/* <span className="tool-tip" > */}
                            <div className="arrow">
                                <BoxArrow />
                            </div>
                            {showTooltipTitle && <div className="tooltip-title">{`Your new password must contain`}</div>}
                            {points && points.map((e: any, i: number) => {
                                return (
                                    <div style={{ display: "flex" }} key={i}>
                                        <span>
                                            {/* {toolTip} */}
                                            {conditionMatching.includes(e.pattern) ? (
                                                <>
                                                    <MdDone className="correct-icon" />
                                                    &nbsp;
                                                </>
                                            ) : (
                                                <>
                                                    <RxCross1 className="wrong-icon" /> &nbsp;
                                                </>
                                            )}
                                        </span>
                                        <li
                                            style={{
                                                color: conditionMatching.includes(e.pattern)
                                                    ? "green"
                                                    : "red",
                                            }}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: confirmpasswordTooltip === "" ? "• " + e.name : confirmpasswordTooltip }} />
                                        </li>
                                    </div>
                                );
                            })}
                        </span>
                    )}
                    {
                        errorMessage &&
                        <div className="error-mesaage">
                            {errorMessage}
                        </div>
                    }

                </span>
                {inputField == "gmail" && (
                    <span className="mail-icon ">

                        <AiOutlineMail style={{ fontSize: "20px" }} />
                    </span>

                )}
                {inputField == "rupee" && (
                    <span className="rupee-icon" style={{ position: "relative", left: "10px", bottom: "65px" }}>

                        <FaRupeeSign style={{ fontSize: "18px", color: "#0055D4" }} />
                    </span>
                )}
                {inputField == "search" && (
                    <span className="search-bar" style={{ position: "absolute", left: "15px", bottom: "18px" }}>
                        <BsSearch style={{ fontSize: "20px", color: "#B3CAE1" }} />
                    </span>

                )}
            </div>
        </>
    );
}