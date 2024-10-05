import * as Yup from 'yup';

// Regular login validation
export const loginValidationSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least 8 characters, including one uppercase, one lowercase, one number, and one special character.'
        ),
});

// Google login validation
export const googleValidationSchema = Yup.object().shape({
    credential: Yup.string().required('Google credential is required')
});