import { useState } from 'react';
import Select from 'react-select';
import '../../../styles/dropdown.scss'

export interface Option {
    value: string | number;
    label: string | number;
    id?: string | number;
    quantity?: string | number;
}

interface Props {
    options: Option[],
    title?: string,
    required?: boolean,
    getData: (val: any) => void,
    defaultValue?: any,
    width?: string,
    className?: string
    isDisabled?: boolean
    placeHolder?: string
    errorMessage?: string
    color?: any
}

export default function DropdownComponent({
    options,
    getData,
    defaultValue,
    title,
    required,
    width,
    className,
    isDisabled,
    placeHolder = "Select",
    errorMessage,
    color
}: Props) {

    const DefaultValues = defaultValue ? defaultValue : { value: 'Select', label: 'Select' };
    const [selectedOption, setSelectedOption] = useState(DefaultValues)

    function handleChange(value: any) {
        if (value.value !== "") {
            setSelectedOption(value)
            getData(value)
        }
    };

    return (
        <>
            {title && (
                <div style={{ fontSize: "18px", marginBottom: "8px", width: width, color: color }}>
                    {title}{required && <span style={{ color: "red" }}>*</span>}
                </div>
            )}

            <div style={{ width: width || "100%" }}>
                <Select
                    noOptionsMessage={() => "No results found"}
                    value={selectedOption}
                    onChange={handleChange}
                    isDisabled={isDisabled}
                    maxMenuHeight={180}
                    options={options}
                    placeholder={placeHolder}
                    className={className || 'input-select'}
                    menuPortalTarget={document.body}
                    styles={{
                        menuPortal: base => ({ ...base, zIndex: 100000 }),
                        menu: base => ({ ...base, zIndex: 100000 }),
                    }}
                />
            </div>

            {errorMessage && (
                <div className='dd-error-mesaage'>
                    {errorMessage}
                </div>
            )}
        </>
    )
}
