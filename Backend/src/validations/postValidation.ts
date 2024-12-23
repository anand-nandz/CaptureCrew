
import * as yup from 'yup';
import { PostStatus, ServiceProvided } from '../enums/commonEnums';

export const postValidationSchema = yup.object().shape({
    caption: yup
        .string()
        .required('Caption is required')
        .min(3, 'Caption must be at least 3 characters')
        .max(2000, 'Caption must not exceed 2000 characters'),
        
    location: yup
        .string()
        .required('Location is required')
        .min(3, 'Location must be at least 3 characters')
        .max(200, 'Location must not exceed 200 characters'),
        
    serviceType: yup
        .string()
        .required('Service type is required')
        .oneOf(
            Object.values(ServiceProvided),
            'Invalid service type'
        ),
        
    status: yup
        .string()
        .required('Status is required')
        .oneOf(
            Object.values(PostStatus),
            'Invalid status'
        )
});

export const validatePostInput = async (data: any) => {
    try {
        const validatedData = await postValidationSchema.validate(data, {
            abortEarly: false,
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