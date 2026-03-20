import React, { useEffect, useState } from 'react'
import { Accordion } from 'react-bootstrap'
import { FaCaretRight } from "react-icons/fa6";
import RadioOrCheckbox from '../../components/common-component/form-elements/radio-or-checkbox';
import InputComponent from '../../components/common-component/form-elements/input-component';
import "../../styles/pages/user-permission.scss"
import ButtonComponent from '../../components/common-component/form-elements/button-component';
import { axiosPrivate } from '../../middleware/axios-api';
import { validateForm } from '../../helpers/form-validator';
import Alertbox from '../../components/common-component/modals/alertbox-modal';
import DeleteModal from '../../components/common-component/modals/delete-modal';
import Loading from '../../components/common-component/modals/loading-screen';
import TabTitle from '../../components/common-component/form-elements/tab-title';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

interface props {

}
export interface userValidationRulesInterface {

    [key: string]: {
        regex: RegExp | string;
        field: string;
        error: string;
        shouldNotBe: string;
        regexError: string;
    };

}
export default function UserPermission({ }: props) {
    const [isEditMode, setisEditMode] = useState(false)
    const [errorMessage, setErrorMessage] = useState<any>({})
    const [errorShow, setErrorShow] = useState<any>({})
    const [getaccordionData, setGetaccordionData] = useState<any>([])
    const [showType, setShowType] = useState("warning") // error message showType
    const [showMessage, setShowMessage] = useState<string>("") // error message showMessage
    const [showAlertBox, setShowAlertBox] = useState(false) // error message ShowAlertBox
    const [userPermissionData, setUserPermissionData] = useState<any>({})
    const [showDeleteModel, setShowDeleteModel] = useState<boolean>(false)
    const [loadingModal, setLoadingModal] = useState<boolean>(false)
    const [idData, setIdData] = useState("")
    const [userTemplateName, setUserTemplateName] = useState({
        temlateName: "",
        temlateID: ""
    })
    const Permission = useSelector((state: any) => state.Permission);
    const accessType = Permission?.accessType === "Read Only" ? true : false;

    const navigate = useNavigate();
    // validationRules
    const userValidationRules: userValidationRulesInterface = {
        temlateName: {
            regex: /^[a-zA-Z][a-zA-Z0-9- /]*$/,
            field: "mandatory",
            shouldNotBe: "",
            error: "Template Name cannot be blank.",
            regexError: "Some of the field(s) are not in required format.",
        },
    }

    useEffect(() => {
        getData()
        getPermissionLevel()

    }, [])


    // warningMsg  
    const clearAleart = (status: any) => {
        const timer = setTimeout(() => {
            setShowAlertBox(false)
            setShowMessage("");
            clearTimeout(timer);
        }, 5000);
    }

    // Get data for grid API
    const getData = async () => {
        try {
            const response = await axiosPrivate.get('/permissionLevelRouter');
            const transformedData = (response.data.results).reduce((acc: any, item: any) => {
                const featureCategory = item.permissionLevelCategory;
                if (!acc[featureCategory]) {
                    acc[featureCategory] = {
                        module: featureCategory,
                        features: [],
                    };
                }
                acc[featureCategory].features.push({
                    permissionLevelCategory: featureCategory,
                    permissionLevelvel: item.permissionLevelvel,
                    discription: item.description,
                    permissionLevelId: item.permissionLevelId,
                    isChoosed: '',
                });
                return acc;
            }, {});
            setUserPermissionData(transformedData)
        } catch (error) {
        }
    };

    // get Accoding Data Api
    const getPermissionLevel = async () => {
        setLoadingModal(true)
        try {
            const response = await axiosPrivate.get('/permissionLevel/get');
            if (response.status === 200) {
                setLoadingModal(false)
                setGetaccordionData(response.data.consolidatedPermissionDatas)
            }

        } catch (error) {
            setLoadingModal(false)
        }
    };


    // post update Api
    const savePermissionData = async () => {
        let { globalMessage, isFormValid } = validateForm(userValidationRules, userTemplateName, setErrorShow, setErrorMessage)
        if (isFormValid) {
            let allrecords: any = []
            userPermissionData && Object.keys(userPermissionData).map((item: any, ind: number) => {
                if (userPermissionData[item]?.features) {
                    userPermissionData[item]?.features.map((data: any, index: number) => (
                        allrecords.push({
                            permissionLevelCategory: data.permissionLevelCategory,
                            permissionLevelvel: data.permissionLevelvel,
                            description: data.description,
                            permissionLevelId: data.permissionLevelId,
                            isChoosed: data.isChoosed,
                        })
                    ));
                }
                return [];
            }).flat();
            const nonEmptyData = allrecords.filter((item: any) => item.isChoosed !== '');
            if (nonEmptyData.length <= 0) {
                setShowAlertBox(true)
                setShowType("danger")
                setShowMessage("At least one permission should be selected.")
                clearAleart("")
                return;
            }
            setLoadingModal(true)
            try {
                const res = isEditMode ? await axiosPrivate.patch(`/permissionLevel/update/${userTemplateName.temlateID}`,
                    {
                        "permissionTemplateName": userTemplateName,
                        "permissionLevel": allrecords
                    }) :
                    await axiosPrivate.post('/permissionLevelRouter/create',
                        {
                            "permissionTemplateName": userTemplateName,
                            "permissionLevel": allrecords
                        })
                if (res.status === 200) {
                    getPermissionLevel()
                    getData()
                    setUserTemplateName({
                        temlateName: "",
                        temlateID: ""
                    })
                    setUserPermissionData({})
                    setShowAlertBox(true)
                    setShowType("success")
                    setShowMessage(res.data.message)
                    clearAleart("")
                    setLoadingModal(false)
                    setisEditMode(false)
                }
            } catch (error: any) {
                setShowAlertBox(true)
                setShowType("danger")
                setShowMessage(error.response.data.error)
                clearAleart("")
                setLoadingModal(false)
            }
        } else {

        }
    }

    // delete function api
    const permissionLevelDelete = () => {
        setLoadingModal(true)
        if (idData) {
            axiosPrivate.delete(`/permissionLevel/delete/${idData}`)
                .then(response => {
                    if (response.status === 200) {
                        setisEditMode(false)
                        setUserPermissionData({})
                        getData()
                        setUserTemplateName({
                            temlateName: "",
                            temlateID: ""
                        })
                        getPermissionLevel()
                        setShowAlertBox(true)
                        setShowType("success")
                        setShowMessage(response.data.message)
                        clearAleart("")
                        setShowDeleteModel(false);
                        setIdData("")
                        setLoadingModal(false)
                    }
                })
                .catch(error => {
                    setShowAlertBox(true)
                    setShowType("danger")
                    setShowMessage(error.response.data.error)
                    clearAleart("")
                    setShowDeleteModel(false);
                    setIdData("")
                    setLoadingModal(false)
                });
        }
    }

    // retriveData
    function retriveData(data: any, index: number) {
        setisEditMode(true)
        setUserTemplateName({
            temlateName: data.permissionTemplateName,
            temlateID: data.permissionTemplateId
        })
        const updatedUserPermissionData = { ...userPermissionData };
        // Iterate through each permission in data.permission
        data.permission.forEach((permission: any) => {
            const { permissionLevelId, permissionLevel, permissionLevelCategory, status } = permission;
            // Find the corresponding module in userPermissionData
            const moduleData = updatedUserPermissionData[permissionLevelCategory];
            if (moduleData) {
                // Find the feature with the matching permissionLevelId
                const feature = moduleData.features.find((f: any) => f.permissionLevelId === permissionLevelId);
                if (feature) {
                    // Update the isChoosed value
                    feature.isChoosed = status == 'enable' ? permissionLevel : '';
                } else {
                    feature.isChoosed = "";
                }
            }
        });
        setUserPermissionData(updatedUserPermissionData);
    }
}
