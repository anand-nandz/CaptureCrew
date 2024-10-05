interface otpErrors {
    otp?: string
}

interface otpValue {
    otp :string
}

export const validate =(values: otpValue) : otpErrors =>{
    const errors : otpErrors = {}
    if(!values.otp){
        errors.otp = 'OTP is Required'
    }else if(!/^[0-9]{4}/.test(values.otp)){
        errors.otp = 'Sould contain 4 digits'
    }
    return errors
}