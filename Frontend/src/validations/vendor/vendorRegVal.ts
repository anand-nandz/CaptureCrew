interface ValidationErrors {
    name: string;
    email: string;
    city: string;
    contactinfo: string;
    password: string;
    confirmPassword: string;
}

interface ValidationValues {
    name: string;
    email: string;
    city: string;
    contactinfo: string;
    password: string;
    confirmPassword: string;
}

export const validate = (values: ValidationValues): ValidationErrors => {
    const errors: ValidationErrors = {
        name: "",
        email: "",
        city: "",
        contactinfo: "",
        password: "",
        confirmPassword: ""
    };

    // Regular Expressions for validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const mobileRegex = /^(91)?0?[6-9]\d{9}$/;

    // Name validation
    if (!values.name.trim()) {
        errors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]+$/i.test(values.name)) {
        errors.name = 'Should not contain numbers or special characters!';
    }

    // Email validation
    if (!values.email.trim()) {
        errors.email = 'Email is required';
    } else if (!emailRegex.test(values.email)) {
        errors.email = 'Invalid email address';
    }

    // City validation
    if (!values.city.trim()) {
        errors.city = 'City is required';
    } else if (!/^[A-Za-z\s]+$/i.test(values.city)) {
        errors.city = 'Should not contain numbers!';
    }

    // Phone validation
    if (!values.contactinfo.trim()) {
        errors.contactinfo = 'Phone is required';
    } else if (!mobileRegex.test(values.contactinfo)) {
        errors.contactinfo = 'Invalid mobile number';
    }

    // Password validation
    if (!values.password.trim()) {
        errors.password = 'Password is required';
    } else if (!passwordRegex.test(values.password)) {
        errors.password = 'Password must contain at least 8 characters, including one uppercase, one lowercase, one number, and one special character.';
    }

    // Confirm Password validation
    if (!values.confirmPassword.trim()) {
        errors.confirmPassword = 'Confirm Password is required';
    } else if (values.confirmPassword !== values.password) {
        errors.confirmPassword = 'Passwords do not match!';
    }

    return errors;
};
