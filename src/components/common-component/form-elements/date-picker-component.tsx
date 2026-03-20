import { forwardRef, useEffect, useState, memo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ReactComponent as Calender } from '../../../assets/icons/calender.svg';
import '../../../styles/common-component/date-picker-component.scss';

interface propsType {
  width?: string;
  height?: string;
  padding?: string;
  border?: string;
  margin?: string;
  textAlign?: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'match-parent';
  color?: string;
  borderRadius?: string;
  showTimePicker: boolean;
  required: boolean;
  dateFormat: string;
  title?: string;
  selectValue: any;
  disabled?: boolean;
  showMonthYearPicker?: boolean;
  maxDate?: any;
  errorMessage?: string | any;
  minDate?: any;
  minTime?: any;
  maxTime?: any;
  placeholder?: string;
  getDateAndTime: (value: any) => void;
}

const DatePickerComponent = memo(function DatePickerComponent({
  showMonthYearPicker, width, height, disabled, maxDate, showTimePicker, dateFormat, errorMessage, padding, title, required, getDateAndTime, selectValue, border, margin, borderRadius, textAlign, color, minDate, minTime, maxTime, placeholder }: propsType) {

  const [inputValue, setInputValue] = useState('');

  const ExampleCustomInput = forwardRef<HTMLInputElement, any>(
    ({ value, onClick }: any, ref) => {
      const [inputValue, setInputValue] = useState(value || '');

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        let filteredValue = newValue.replace(/[a-zA-Z]/g, '').substring(0, 16);
        if (filteredValue.length > 2 && filteredValue[2] !== '/') {
          filteredValue = filteredValue.slice(0, 2) + '/' + filteredValue.slice(2);
          // console.log("1")
        }
        if (filteredValue.length > 5 && filteredValue[5] !== '/') {
          filteredValue = filteredValue.slice(0, 5) + '/' + filteredValue.slice(5);
          // console.log("2")
        }
        if (filteredValue.length > 13 && filteredValue[13] !== ':') {
          filteredValue = filteredValue.slice(0, 13) + ':' + filteredValue.slice(13);
          // console.log("4")
        }
        if (filteredValue.length > 10 && filteredValue[10] !== ' ') {
          filteredValue = filteredValue.slice(0, 10) + ' ' + filteredValue.slice(10);
          // console.log("4")
        }
        setInputValue(filteredValue);
        if (isValidDateOrDateTime(filteredValue) && !showTimePicker) {
          // console.log("3")
          const parsedDate = parseDate(filteredValue, showTimePicker);
          getDateAndTime(parsedDate);
        } else if (showTimePicker) {
          if (isValidDateOrDateTime(filteredValue) && filteredValue.length == 16) {
            const parsedDate = parseDate(filteredValue, showTimePicker);
            getDateAndTime(parsedDate);
          }
        }
      };
      // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      //   if (!showMonthYearPicker) {
      //     const newValue = e.target.value;
      //     const filteredValue = newValue.replace(/[a-zA-Z]/g, '').substring(0, 20);
      //     setInputValue(filteredValue);
      //     if (isValidDateOrDateTime(filteredValue)) {
      //       const parsedDate = parseDate(filteredValue, showTimePicker);
      //       getDateAndTime(parsedDate);
      //     }
      //   }
      // };
      useEffect(() => {
        setInputValue(value || '');
      }, [value]);
      return (
        <div className='inputContainer' style={{ width, height, padding, border, margin, textAlign, color, borderRadius }}>
          <input
            disabled={disabled}
            value={inputValue}
            placeholder={placeholder || 'dd/mm/yyyy hh:mm'}
            style={{ width: '100%', border: 'none', outline: 'none', backgroundColor: 'transparent', color: inputValue === '' ? '#cecece' : 'black' }}
            className='inputField'
            onClick={onClick}
            onChange={handleInputChange}
            ref={ref}
          />
          <div className='icon-calender' style={{ pointerEvents: !disabled ? "auto" : "none" }} onClick={onClick}>
            <Calender style={{ width: '25px', height: '25px', fill: !disabled ? "rgb(41, 82, 133)" : '#B3CAE1' }} />
          </div>
        </div>
      );
    }
  );

  const parseDate = (dateStr: string, showTimePicker: boolean) => {
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    if (showTimePicker && timePart) {
      const [hours, minutes] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes);
    }
    return new Date(year, month - 1, day);
  };

  const handleClearDate = () => {
    getDateAndTime(null);
    setInputValue('');
  };
  function isValidDateOrDateTime(value: any) {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;

    if (typeof value !== 'string') {
      return false;
    }

    let date;
    let match;

    if (match = dateRegex.exec(value)) {
      const [, day, month, year] = match;
      date = new Date(`${year}-${month}-${day}`);
    } else if (match = dateTimeRegex.exec(value)) {
      const [, day, month, year, hours, minutes] = match;
      date = new Date(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      return false;
    }

    return date instanceof Date && !isNaN(date.getTime());
  }
  return (
    <>
      <div className='date-picker-component'>
        <div className="title">
          {title}
          {required && <span style={{ color: "red" }}>*</span>}
        </div>
        <DatePicker
          selected={selectValue}
          showTimeSelect={showTimePicker}
          onChange={(date: any) => {
            getDateAndTime(date);
            setInputValue(date ? date.toString() : '');
          }}
          dateFormat={dateFormat}
          timeFormat="HH:mm"
          timeIntervals={1}
          timeCaption="Time"
          showMonthYearPicker={showMonthYearPicker}
          placeholderText="dd/mm/yyyy hh:mm"
          className="form-control"
          autoFocus={true}
          closeOnScroll={true}
          customInput={<ExampleCustomInput />}
          minDate={minDate}
          maxDate={maxDate}
          minTime={minTime}
          maxTime={maxTime}
          shouldCloseOnSelect={false} // Prevents auto-closing on select
        />
      </div>
      {errorMessage && <div className="datepicker-error-mesaage">{errorMessage}</div>}
    </>
  )
});

export default DatePickerComponent;
