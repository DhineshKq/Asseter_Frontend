import React from 'react';
import '../../../styles/radio-button.scss';

interface Props {
    name?: string;
    value: string;
    type: string;
    label?: string;
    margin?: string;
    checkedValue?: string;
    id?: string;
    disabled?: boolean;
    getVal: (val: any) => void;
}

export default function RadioOrCheckbox({
    getVal,
    value,
    label,
    type,
    margin,
    name,
    disabled,
    checkedValue,
    id,
}: Props) {
    const uniqueId = id || `${name}-${value.replace(/\s+/g, '-')}`; // ensure unique ID per option

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        getVal(event.target.value);
    };

    return (
        <div style={{ margin }}>
            <span className='radio-button'>
                <input
                    disabled={disabled}
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleOnChange}
                    checked={value === checkedValue}
                    id={uniqueId}
                    tabIndex={0}
                />
                <label className={disabled? 'label-cursor':'label-cursor-pointer'} htmlFor={uniqueId}>
                    {label ?? value}
                </label>
            </span>
        </div>
    );
}
