import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email cannot be blank')
    .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email must be a valid @gmail.com address'),
  password: Yup.string()
    .required('Password cannot be blank')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = Yup.object().shape({
  name: Yup.string().required('Name cannot be blank'),
  email: Yup.string()
    .required('Email cannot be blank')
    .matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email must be a valid @gmail.com address'),
  password: Yup.string()
    .required('Password cannot be blank')
    .min(6, 'Password must be at least 6 characters'),
});
