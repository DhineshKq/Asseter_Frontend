import { forwardRef, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ReactComponent as Calender } from '../../../assets/icons/calender.svg';
import '../../../styles/common-component/date-picker-component.scss';
import moment from 'moment';

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

function ManualDatePickerComponent({
  showMonthYearPicker,
  width,
  height,
  disabled,
  maxDate,
  showTimePicker,
  dateFormat,
  errorMessage,
  padding,
  title,
  required,
  getDateAndTime,
  selectValue,
  border,
  margin,
  borderRadius,
  textAlign,
  color,
  minDate,
  minTime,
  maxTime,
  placeholder,
}: propsType) {
  const [inputValue, setInputValue] = useState(
    selectValue ? moment(selectValue).format('DD/MM/YYYY HH:mm') : ''
  );
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isTyping && selectValue) {
      setInputValue(moment(selectValue).format('DD/MM/YYYY HH:mm'));
    }
  }, [selectValue, isTyping]);

  const ExampleCustomInput = forwardRef<HTMLInputElement, any>(
    ({ value, onClick, onChange, onBlur }: any, ref) => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          ref={ref}
          type="text"
          value={value}
          onClick={onClick}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder || 'dd/mm/yyyy hh:mm'}
          style={{ width, height, padding, border, margin, textAlign, color, borderRadius }}
        />
        <div className="icon-calender" onClick={onClick}>
          <Calender style={{ width: '25px', height: '25px', fill: !disabled ? 'rgb(41, 82, 133)' : '#B3CAE1' }} />
        </div>
      </div>
    )
  );

  const handleInputChange = (e: any) => {
    setIsTyping(true);
    const value = e.target.value;
    setInputValue(value);
  };

  const handleInputBlur = () => {
    const date = moment(inputValue, 'DD/MM/YYYY HH:mm', true);
    if (date.isValid()) {
      getDateAndTime(date.toDate());
    } else {
      // Handle invalid date
      setInputValue('');
      getDateAndTime(null);
    }
    setIsTyping(false);
  };

  const handleDateChange = (date: Date) => {
    if (!date) return;
    const formattedDate = moment(date).format('DD/MM/YYYY HH:mm');
    setInputValue(formattedDate);
    getDateAndTime(date);
    setIsTyping(false);
  };

  return (
    <>
      <div className="date-picker-component">
        <div className="title">
          {title}
          {required && <span style={{ color: 'red' }}>*</span>}
        </div>
        <DatePicker
          selected={selectValue}
          showTimeSelect={showTimePicker}
          onChange={handleDateChange}
          dateFormat={dateFormat}
          timeFormat="HH:mm"
          timeIntervals={1}
          timeCaption="Time"
          showMonthYearPicker={showMonthYearPicker}
          placeholderText="dd/mm/yyyy hh:mm"
          className="form-control"
          autoFocus={true}
          closeOnScroll={true}
          customInput={
            <ExampleCustomInput
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
            />
          }
          minDate={minDate}
          maxDate={maxDate}
          minTime={minTime}
          maxTime={maxTime}
        />
      </div>
      {errorMessage && <div className="datepicker-error-message">{errorMessage}</div>}
    </>
  );
}

export default ManualDatePickerComponent;
