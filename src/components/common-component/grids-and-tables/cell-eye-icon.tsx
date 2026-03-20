import { useState } from 'react';
import { BsEyeSlashFill, BsEyeFill } from 'react-icons/bs';
import IconButton from '../form-elements/icon-button';
import { MdLock } from "react-icons/md";

interface Props {
    handleIconClick: (showIcon: string, data: any) => void;
    iconClicked: boolean;
    accessType?: boolean;
    vcinCargoDependency?: boolean;
    showIcons: any[];
    data: any; // Add the data property to the Props interface  
    marginTop?: any;
}

const Actions: React.FC<Props> = ({ handleIconClick, accessType, vcinCargoDependency, iconClicked, data, showIcons, marginTop = "0px" }) => {
    // console.log("showIcons>>>>>",showIcons);
    

    return (
        <>
            <div className='actions-button-normal-grid' style={{ display: 'flex', alignItems: "center", gap: '2px', flexWrap: 'wrap', marginTop: marginTop }}>
                {
                    showIcons.includes("View") &&
                    <div title='View'>
                        <IconButton
                            iconName={"Eye"}
                            height={"40px"}
                            width={"40px"}
                            // border={'1px solid #B3CAE1'}
                            fontSize={"25px"}
                            margin={"0px 8px"}
                            color={"var(--btn-primary-bg)"}
                            disabled={false}
                            opacity={"1"}
                            cursor={"pointer"}
                            backgroundColor={"transparant"}
                            hover={true}
                            handleClick={() => {
                                handleIconClick('View', data)
                            }}
                        /> 
                    </div >
                }
                {
                    showIcons.includes("print") &&
                    <div title='Print'>
                        <IconButton
                            iconName={"print"}
                            height={"40px"}
                            width={"40px"}
                            fontSize={"25px"}
                            border={'1px solid #B3CAE1'}
                            margin={"0px 8px"}
                            color={"#295285"}
                            disabled={false}
                            opacity={"1"}
                            cursor={"pointer"}
                            backgroundColor={"#FFFFFF"}
                            hover={true}
                            handleClick={() => {
                                handleIconClick('print', data)
                            }}
                        />
                    </div >
                }
                {
                    showIcons.includes("edit") &&
                    <div title='Edit'>
                        <IconButton
                            iconName={"Edit"}
                            height={"40px"}
                            width={"40px"}
                            fontSize={"25px"}
                            // border={'1px solid #B3CAE1'}
                            margin={"0px 8px"}
                            color={"var(--btn-primary-bg)"}
                            opacity={"1"}
                            disabled={accessType || vcinCargoDependency}
                            cursor={(accessType || vcinCargoDependency) ? "not-allowed" : "pointer"}
                            backgroundColor={"transparant"}
                            hover={(accessType || vcinCargoDependency) ? false : true}
                            handleClick={() => {
                                handleIconClick('Edit', data)
                            }}
                        />
                    </div >
                }
                {
                    showIcons.includes("key") &&
                    <div title='Reset Password' >
                        <IconButton
                            iconName={"Key"}
                            height={"40px"}
                            width={"40px"}
                            fontSize={"20px"}
                            border={'1px solid #B3CAE1'}
                            margin={"0px 8px"}
                            color={"#295285"}
                            opacity={'1'}
                            disabled={accessType}
                            cursor={accessType ? "not-allowed" : "pointer"}
                            backgroundColor={accessType ? "#AEAEAE" : "#FFFFFF"}
                            hover={accessType ? false : true}
                            handleClick={() => {
                                handleIconClick('key', data)
                            }}
                        />
                    </div >
                }
                {
                    showIcons.includes("key-disabled") &&
                    <div title='Reset Password' >
                        <IconButton
                            iconName={"Key"}
                            height={"40px"}
                            width={"40px"}
                            fontSize={"20px"}
                            border={'1px solid #B3CAE1'}
                            margin={"0px 8px"}
                            color={"#295285"}
                            disabled={false}
                            opacity={'0.6'}
                            cursor={"default"}
                            backgroundColor={"#FFFFFF"}
                            hover={false}
                            handleClick={() => {
                                handleIconClick('key', data)
                            }}
                        />
                    </div >
                }
                {
                    showIcons.includes("repeat") &&
                    <div>
                        <IconButton
                            iconName="Repeat"
                            height="40px"
                            width="40px"
                            fontSize="25px"
                            color="#295285"
                            // border="1px solid #B3CAE1"
                            backgroundColor="#FFFFFF"
                            margin="0px 8px"
                            hover={true}
                            handleClick={() => {
                                handleIconClick('Repeat', data);
                            }}
                        />
                    </div >
                }
                {
                    showIcons.includes("share") &&
                    <div>
                        <IconButton
                            iconName="Share"
                            height="40px"
                            width="40px"
                            fontSize="25px"
                            color="#295285"
                            // border="1px solid #B3CAE1"
                            backgroundColor="#FFFFFF"
                            margin="0px 8px"
                            hover={true}
                            handleClick={() => {
                                handleIconClick('Share', data);
                            }}
                        />
                    </div >
                }
                {
                    showIcons.includes("delete") &&
                    <div title='Delete'>
                        <IconButton
                            iconName={"Delete"}
                            height={"40px"}
                            width={"40px"}
                            fontSize={"30px"}
                            // border={'1px solid #B3CAE1'}
                            margin={"0px 8px"}
                            color={"red"}
                            opacity={"1"}
                            disabled={accessType}
                            cursor={accessType ? "not-allowed" : "pointer"}
                            backgroundColor={"taransparant"}
                            hover={accessType ? false : true}
                            handleClick={() => {
                                handleIconClick('Delete', data)

                            }}
                        />
                    </div >
                }
                {
                    showIcons.includes("view&edit") &&
                    <div>
                        <IconButton
                            iconName={"view&edit"}
                            height={"40px"}
                            width={"130px"}
                            fontSize={"25px"}
                            border={'1px solid #B3CAE1'}
                            margin={"0px 8px"}
                            color={"#295285"}
                            disabled={false}
                            opacity={"1"}
                            cursor={"pointer"}
                            backgroundColor={"#FFFFFF"}
                            hover={true}
                            handleClick={() => {
                                handleIconClick('view&edit', data)
                            }}
                        />
                    </div >
                }
                {
                    showIcons.includes("qrscan") &&
                    <div>
                        <IconButton
                            iconName="qrscan"
                            height="40px"
                            width="40px"
                            fontSize="25px"
                            color="#295285"
                            border="1px solid #B3CAE1"
                            backgroundColor="#FFFFFF"
                            margin="0px 8px"
                            hover={true}
                            handleClick={() => {
                                handleIconClick('qrscan', data);
                            }}
                        />
                    </div >
                }


            </div>
        </>
    );
};

export default Actions;
