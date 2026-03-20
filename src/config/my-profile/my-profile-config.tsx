export const validatedata: any = {
  firstName: {
    field: 'First Name',
    isMandatory: true,
    regex: /^[a-zA-Z\s]*$/,
    errorMessage: 'First Name cannot be blank.'
  },
  lastName: {
    field: 'Last Name',
    isMandatory: true,
    regex: /^[a-zA-Z\s]*$/,
    errorMessage: 'Last Name cannot be blank.'
  },
  email: {
    field: 'Email',
    isMandatory: true,
    regex: /^[a-z0-9._-]+@[a-z0-9-]+\.[a-z]{2,}$/,
    errorMessage: 'Email cannot be blank.'
  },
  mobile: {
    field: 'Mobile',
    isMandatory: true,
    regex: /^\+\d{8,16}$/,
    errorMessage: 'Mobile number cannot be blank.',
    regexMessage: 'Enter a valid mobile number (e.g.+651234567890).'
  },
  country: {
    field: 'Country',
    isMandatory: true,
    regex: null, // No regex validation for country
    errorMessage: 'Country cannot be blank.'
  },
  city: {
    field: 'City',
    isMandatory: true,
    regex: /^[a-zA-Z\s]*$/,
    errorMessage: 'City cannot be blank.'
  },
  address: {
    field: 'Address',
    isMandatory: true,
    regex: null, // No regex validation for address
    errorMessage: 'Address cannot be blank.'
  }
};