import * as yup from 'yup';
import { ServiceProvided } from '../enums/commonEnums';

const customizationOptionValidationSchema = yup.object().shape({
    type: yup
        .string()
        .required('Customization option type is required')
        .min(3, 'Type must be at least 3 characters')
        .max(50, 'Type must not exceed 50 characters'),

    description: yup
        .string()
        .required('Customization option description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(200, 'Description must not exceed 200 characters'),

    price: yup
        .number()
        .required('Customization option price is required')
        .positive('Price must be positive')
        .min(100, 'Price cannot be less than 100')
        .max(100000, 'Price cannot exceed 100,000')
        .transform((value) => (isNaN(value) ? undefined : Number(value))),

    unit: yup
        .string()
        .optional()
        .max(30, 'Unit must not exceed 30 characters')
});


export const packageValidationSchema = yup.object().shape({
    serviceType: yup
        .string()
        .required('Service type is required')
        .oneOf(Object.values(ServiceProvided), 'Invalid service type'),

    price: yup
        .number()
        .required('Price is required')
        .positive('Price must be positive')
        .min(1000, 'Price cannot be less than 1000')
        .max(1000000, 'Price cannot exceed 1,000,000')
        .transform((value) => (isNaN(value) ? undefined : Number(value))),

    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must not exceed 1000 characters'),

    duration: yup
        .number()
        .required('Duration is required')
        .positive('Duration must be positive')
        .max(72, 'Duration cannot exceed 72 hours')
        .transform((value) => (isNaN(value) ? undefined : Number(value))),

    photographerCount: yup
        .number()
        .required('Photographer count is required')
        .min(1, 'At least one photographer is required')
        .max(10, 'Cannot exceed 10 photographers')
        .transform((value) => (isNaN(value) ? undefined : Number(value))),

    videographerCount: yup
        .number()
        .required('Videographer count is required')
        .min(0, 'Videographer count cannot be negative')
        .max(5, 'Cannot exceed 5 videographers')
        .transform((value) => (isNaN(value) ? undefined : Number(value))),

    features: yup
        .array()
        .of(yup.string().required('Feature cannot be empty'))
        .required('Features are required')
        .min(1, 'At least one feature is required')
        .max(10, 'Cannot exceed 10 features'),

    customizationOptions: yup
        .array()
        .of(customizationOptionValidationSchema)
        .required('Customization options are required')
        .min(1, 'At least one customization option is required')
        .max(5, 'Cannot exceed 5 customization options')
});

export const validatePackageInput = async (data: any) => {
    try {
        const validatedData = await packageValidationSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });
        return { isValid: true, data: validatedData };
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            return {
                isValid: false,
                errors: error.errors
            };
        }
        throw error;
    }
};