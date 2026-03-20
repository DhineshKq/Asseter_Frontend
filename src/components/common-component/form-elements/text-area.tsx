import "../../../styles/text-area.scss"

interface propsType {
    name: string;
    placeHolder: string;
    width: string;
    height: string;
    margin?: string;
    disabled?: boolean
    padding?: string;
    maxLength?: number;
    border?: string
    getUser: (value: string) => void;
    inputValue: string,
    borderRadius?: string,
    errorMessage?: string,
    autoFocus?: boolean,
    required?: boolean,
}

export default function TextArea({ name, placeHolder, autoFocus,width, height, padding, margin, maxLength, border, inputValue, getUser, disabled, borderRadius, errorMessage, required }: propsType) {
    return (
        <div className='text-area' style={{ margin, }}>
            <div >
                {name}
                {required && <span style={{ color: "red" }}>*</span>}
            </div>
            <textarea
                autoFocus={autoFocus}
                placeholder={placeHolder}
                style={{ width, height, padding, border, borderRadius }}
                value={inputValue}
                maxLength={maxLength}
                disabled={disabled}
                onChange={(e) => { getUser(e.target.value) }}
            />
            {
                errorMessage &&
                <div className="error-mesaage">
                    {errorMessage}
                </div>
            }
        </div>
    )
}
