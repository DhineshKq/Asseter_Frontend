
const example: any = {
    field1: {
        regex: "",
        field: "mandatory",
        shouldNotBe: "",
        error: "This field is required.",
        regexError: "Base Amount is not in required format.",
    },
    field2: {
        regex: "",
        field: "",
        shouldNotBe: "",
        error: "",
        regexError: "",
    },
}

export const validateForm = (validationRules: any, fieldToCheck: any, seterrorshow: any, seterrorMessage: any): any => {

    const updatedIsValueValidAll: Record<string, boolean> = {};
    const updatedmessageAll: any = {};
    const updatedFieldValidity: Record<string, boolean> = {};
    Object.keys(validationRules).forEach((field) => {
        const rule = validationRules[field];
        const value = fieldToCheck[field];
        // Check if the field value meets the conditions based on rule.field and rule.shouldNotBe
        const isValueValid = (rule.field === "mandatory") ? (value !== rule.shouldNotBe) : true;
        // If a regular expression is provided, test the field value against it
        // console.log(field, rule, value)
        const isRegexValid = rule.regex !== "" ? new RegExp(rule.regex).test(value) : true;
        updatedFieldValidity[field] = !isValueValid || !isRegexValid;
        updatedIsValueValidAll[field] = !isValueValid;
        updatedmessageAll[field] = !isValueValid ? rule.error : !isRegexValid ? rule.regexError : ''
    });
    seterrorMessage(updatedmessageAll);
    seterrorshow(updatedFieldValidity);
    // Check if any field has validation errors
    const isFormValid = Object.keys(updatedFieldValidity).every((keys) => {
        return !updatedFieldValidity[keys]
    });
    let globalMessage = Object.values(updatedIsValueValidAll).every((values) => !values) ?
        "Some of the field(s) are not in required format." : "Mandatory field(s) should not be left blank."
    return { isFormValid: isFormValid, globalMessage: globalMessage };
};