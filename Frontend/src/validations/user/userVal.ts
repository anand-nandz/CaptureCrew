interface ValidationErrors {
    name: string;
    email: string;
    contactinfo: string;
    password: string;
    confirmPassword: string;
  }
  
  interface ValidationValues {
    name: string;
    email: string;
    contactinfo: string;
    password: string;
    confirmPassword: string;
  }
  
  export const validate = (values: ValidationValues): ValidationErrors => {
    const errors: ValidationErrors = {
      name: "",
      email: "",
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
  


  export const validateEmail = (values: Pick<ValidationValues,'email'>): Pick<ValidationErrors, 'email'> => {
    const errors: Pick<ValidationErrors, 'email'>= {
      email: "",
    };
    
    // Regular Expression for email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    // Email validation
    if (!values.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(values.email)) {
      errors.email = 'Invalid email address';
    }
   
    return errors;
  };

  
  export const validatePassword = (values: Pick<ValidationValues,'password' | 'confirmPassword'>): Pick<ValidationErrors, 'password' | 'confirmPassword'> => {
    const errors: Pick<ValidationErrors, 'password' | 'confirmPassword'>= {
      password: "",
      confirmPassword: "",
    };
    
    // Regular Expression for email validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
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



  
  export const validateProfile = (values: Pick<ValidationValues,'name' | 'contactinfo'>): Pick<ValidationErrors, 'name' | 'contactinfo'> => {
    const errors: Pick<ValidationErrors, 'name' | 'contactinfo'>= {
      name: "",
      contactinfo: "",
    };
    const mobileRegex = /^(91)?0?[6-9]\d{9}$/;
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
  
  
   
    return errors;
  };