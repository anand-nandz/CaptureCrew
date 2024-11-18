import * as Yup from 'yup';
import { PostData, PostStatus, ServiceProvided } from '../../types/postTypes';

// Helper function to count total valid images
const countValidImages = (
    imageFiles: (File | null)[],
    existingImages: string[]
): number => {
    // Count new valid files
    const newValidImages = imageFiles.filter((file): file is File => file instanceof File).length;
    
    // Count existing image URLs
    const existingValidImages = existingImages.filter(url => url && url !== '').length;
    
    // Return total count
    return newValidImages + existingValidImages;
};

// Helper to normalize existing images array
const normalizeExistingImages = (existingImages?: string | string[]): string[] => {
    if (!existingImages) return [];
    return Array.isArray(existingImages) ? existingImages : [existingImages];
};

export const postValidationSchema = (isEditMode: boolean, existingPost?: PostData | null) => {
    return Yup.object().shape({
        caption: Yup.string()
            .required('Caption is required')
            .min(20, 'Caption must be at least 20 characters')
            .max(500, 'Caption must be less than 500 characters')
            .trim(),
            
        location: Yup.string()
            .required('Location is required')
            .min(3, 'Location must be at least 3 characters')
            .max(100, 'Location must be less than 100 characters')
            .trim(),
            
        serviceType: Yup.string()
            .required('Service type is required')
            .oneOf(Object.values(ServiceProvided), 'Please select a valid service type'),
            
        status: Yup.string()
            .required('Status is required')
            .oneOf(Object.values(PostStatus), 'Please select a valid status'),
            
        images: Yup.array()
            .test('image-requirements', function(value) {
                if (!value) return this.createError({ message: 'Images are required' });

                const imageFiles = value as (File | null)[];
                const existingImages = isEditMode && existingPost 
                    ? normalizeExistingImages(existingPost.imageUrl)
                    : [];

                // Get total count of valid images
                const totalImages = countValidImages(imageFiles, existingImages);

                // Validate minimum images
                if (totalImages < 4) {
                    return this.createError({ message: 'Please upload at least 4 images' });
                }

                // Validate maximum images
                if (!isEditMode && totalImages > 6) {
                    return this.createError({ message: 'Maximum 6 images allowed for new posts' });
                }
                
                if (isEditMode && totalImages > 12) {
                    return this.createError({ message: 'Maximum 12 images allowed' });
                }

                // Validate file types and sizes
                const invalidFile = imageFiles.find(file => {
                    if (!file || !(file instanceof File)) return false;
                    
                    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
                    if (!validTypes.includes(file.type)) {
                        return true;
                    }
                    
                    if (file.size > 5 * 1024 * 1024) { // 5MB
                        return true;
                    }
                    
                    return false;
                });

                if (invalidFile) {
                    return this.createError({ 
                        message: 'All images must be JPG, JPEG, PNG, or WebP and less than 5MB'
                    });
                }

                return true;
            })
    });
};

















// import * as Yup from 'yup';
// import { PostData, PostStatus, ServiceProvided } from '../../types/postTypes';

// const MAX_IMAGES = 6;
// const MIN_IMAGES = 4;

// // Helper function to count total valid images
// const countValidImages = (
//     imageFiles: (File | null)[],
//     existingImages: string[]
// ): number => {
//     // Count new valid files
//     const newValidImages = imageFiles.filter((file): file is File => file instanceof File).length;
    
//     // Count existing valid image URLs (excluding blob URLs)
//     const existingValidImages = existingImages.filter(url => 
//         url && url !== '' && !url.startsWith('blob:')
//     ).length;
    
//     return newValidImages + existingValidImages;
// };

// export const postValidationSchema = (isEditMode: boolean, existingPost?: PostData | null) => {
//     return Yup.object().shape({
//         caption: Yup.string()
//             .required('Caption is required')
//             .min(20, 'Caption must be at least 20 characters')
//             .max(500, 'Caption must be less than 500 characters')
//             .trim(),
            
//         location: Yup.string()
//             .required('Location is required')
//             .min(3, 'Location must be at least 3 characters')
//             .max(100, 'Location must be less than 100 characters')
//             .trim(),
            
//         serviceType: Yup.string()
//             .required('Service type is required')
//             .oneOf(Object.values(ServiceProvided), 'Please select a valid service type'),
            
//         status: Yup.string()
//             .required('Status is required')
//             .oneOf(Object.values(PostStatus), 'Please select a valid status'),
            
//         images: Yup.array()
//             .test('image-requirements', function(value) {
//                 if (!value) return this.createError({ message: 'Images are required' });

//                 const imageFiles = value as (File | null)[];
//                 const existingImages = isEditMode && existingPost?.imageUrl 
//                     ? (Array.isArray(existingPost.imageUrl) 
//                         ? existingPost.imageUrl 
//                         : [existingPost.imageUrl])
//                     : [];

//                 const totalImages = countValidImages(imageFiles, existingImages);

//                 if (totalImages < MIN_IMAGES) {
//                     return this.createError({ 
//                         message: `Please upload at least ${MIN_IMAGES} images` 
//                     });
//                 }

//                 if (totalImages > MAX_IMAGES) {
//                     return this.createError({ 
//                         message: `Maximum ${MAX_IMAGES} images allowed` 
//                     });
//                 }

//                 // Validate file types and sizes
//                 const invalidFile = imageFiles.find(file => {
//                     if (!file) return false;
                    
//                     const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//                     return !validTypes.includes(file.type) || file.size > 5 * 1024 * 1024;
//                 });

//                 if (invalidFile) {
//                     return this.createError({ 
//                         message: 'All images must be JPG, JPEG, PNG, or WebP and less than 5MB'
//                     });
//                 }

//                 return true;
//             })
//     });
// };