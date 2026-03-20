import React from "react";
import { Checkbox, FormControl, InputLabel, ListItemIcon, ListItemText, MenuItem, Select } from "@mui/material";

interface Option {
    id: number;
    value: string;
    label: string;
}
interface Props {
    selectValue?: any;
    handleSelectAll?: (val: any) => void;
    displayText?: string;
    gstDropdownValues?: Option[];
}

const MultiSelectDropDown = ({ selectValue, handleSelectAll, displayText, gstDropdownValues }: Props) => {
    // const OptionsValue = gstDropdownValues?.map((item: any) => item.value)
    // const OptionsLabel = gstDropdownValues?.map((item: any) => item.label)
    const isAllSelected = gstDropdownValues && gstDropdownValues?.length > 0 && selectValue?.length === gstDropdownValues?.length;

    return (
        <div className='gst-fetch-flex dropdown-datas'>
            <FormControl style={{ border: "1px solid #A9C3DC", height: "40px" }}>
                {selectValue?.length > 0 ? "" :
                    <InputLabel shrink={false} id="placeholder-dropdown"
                        style={{ userSelect: "none", cursor: "pointer", color: "rgb(185 179 179)", fontFamily: "inherit" }}>
                        {"Select an Option"}
                    </InputLabel>
                }
                <Select
                    // value={"ghgh"}
                    id="multi-select"
                    // onChange={handleSelectAll}
                    renderValue={() => displayText}
                    // multiple
                    className='dropdown-style-gst'
                    aria-expanded='true'
                >
                    <MenuItem value="all">
                        <ListItemIcon>
                            <Checkbox checked={isAllSelected}></Checkbox>
                        </ListItemIcon>
                        <ListItemText primary="Select All"></ListItemText>
                    </MenuItem>
                    {gstDropdownValues && gstDropdownValues.map((options: any) => (
                        <MenuItem key={options?.id} value={options.value}>
                            <ListItemIcon>
                                <Checkbox checked={selectValue?.includes(options.value as string)} name="select-checkbox"></Checkbox>
                            </ListItemIcon>
                            <ListItemText primary={options?.label}></ListItemText>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

export default MultiSelectDropDown;
