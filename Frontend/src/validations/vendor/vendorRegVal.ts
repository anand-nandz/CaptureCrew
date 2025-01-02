interface ValidationErrors {
    name: string;
    email: string;
    city: string;
    contactinfo: string;
    password: string;
    confirmPassword: string;
    companyName: string;
    about: string,
}

interface ValidationValues {
    name: string;
    email: string;
    city: string;
    contactinfo: string;
    password: string;
    confirmPassword: string;
    companyName: string;
    about: string,
}

export const validate = (values: ValidationValues): ValidationErrors => {
    const errors: ValidationErrors = {
        name: "",
        email: "",
        city: "",
        contactinfo: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        about: "",
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

    // Company Name validation
    if (!values.companyName.trim()) {
        errors.companyName = 'Company name is required';
    } else if (values.companyName.length < 2) {
        errors.companyName = 'Company name must be at least 2 characters long';
    } else if (values.companyName.length > 100) {
        errors.companyName = 'Company name must not exceed 100 characters';
    } else if (!/^[A-Za-z0-9\s&'-]+$/i.test(values.companyName)) {
        errors.companyName = 'Company name can only contain letters, numbers, spaces, and the characters &, \', -';
    }

     // About field validation
    if (!values.about.trim()) {
        errors.about = 'About is required';
    } else if (values.about.length < 10) {
        errors.about = 'About must be at least 10 characters long';
    } else if (values.about.length > 500) {
        errors.about = 'About must not exceed 500 characters';
    }
    return errors;
};


export const validateProfile = (values: Pick<ValidationValues,'name' | 'contactinfo' | 'companyName' | 'city' | 'about'>): Pick<ValidationErrors, 'name' | 'contactinfo' | 'companyName' | 'city' | 'about'> => {
    const errors: Pick<ValidationErrors, 'name' | 'contactinfo' | 'companyName' | 'city' | 'about'>= {
      name: "",
      contactinfo: "",
      companyName: "",
      city: "",
      about: "",
    };
    const mobileRegex = /^(91)?0?[6-9]\d{9}$/;
    // Regular Expression for email validation
    if (!values.name.trim()) {
      errors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]+$/i.test(values.name)) {
      errors.name = 'Should not contain numbers or special characters!';
    }
  
    if (!values.contactinfo.trim()) {
        errors.contactinfo = 'Phone is required';
      } else if (!mobileRegex.test(values.contactinfo)) {
        errors.contactinfo = 'Invalid mobile number';
      }
    

    if (!values.companyName.trim()) {
        errors.companyName = 'Company name is required';
    } else if (values.companyName.length < 2) {
        errors.companyName = 'Company name must be at least 2 characters long';
    } else if (values.companyName.length > 100) {
        errors.companyName = 'Company name must not exceed 100 characters';
    } else if (!/^[A-Za-z0-9\s&'-]+$/i.test(values.companyName)) {
        errors.companyName = 'Company name can only contain letters, numbers, spaces, and the characters &, \', -';
    }

    if (!values.city.trim()) {
        errors.city = 'City is required';
    } else if (!/^[A-Za-z\s]+$/i.test(values.city)) {
        errors.city = 'Should not contain numbers!';
    }

    if (!values.about.trim()) {
        errors.about = 'About is required';
    } else if (values.about.length < 10) {
        errors.about = 'About must be at least 10 characters long';
    } else if (values.about.length > 500) {
        errors.about = 'About must not exceed 500 characters';
    }
  
    return errors;
  };