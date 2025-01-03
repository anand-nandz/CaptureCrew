import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, CardHeader, Input, Select, SelectItem, Button, Image } from '@nextui-org/react';
import { motion } from 'framer-motion';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Plus, X, Upload } from 'lucide-react';
import { ServiceProvided, PostStatus, PostFormData, PostData } from '../../../types/postTypes';
import { useNavigate } from 'react-router-dom';
import SidebarVendor from '../../../layout/vendor/SidebarProfileVendor';
import { showToastMessage } from '../../../validations/common/toast';
import { axiosInstanceVendor } from '../../../config/api/axiosInstance';
import { VENDOR } from '../../../config/constants/constants';
import { postValidationSchema } from '../../../validations/vendor/postValidationSchema';
import * as Yup from 'yup';

interface CreatePostProps {
    isEditMode?: boolean;
    existingPost?: PostData | null;
    onClose?: () => void;
}

export default function CreatePost({
    isEditMode = false,
    existingPost,
    onClose
}: CreatePostProps) {
    const navigate = useNavigate();
    const MAX_IMAGES = 6;
    const [formData, setFormData] = useState<PostFormData>({
        caption: existingPost?.caption || '',
        location: existingPost?.location || '',
        serviceType: existingPost?.serviceType || '',
        status: existingPost?.status || '',
        images: Array(MAX_IMAGES).fill(null)
    });

    const [existingImages, setExistingImages] = useState<string[]>(() => {
        if (!existingPost?.imageUrl) return Array(MAX_IMAGES).fill('');

        const urls = Array.isArray(existingPost.imageUrl)
            ? existingPost.imageUrl
            : [existingPost.imageUrl];

        const validUrls = urls.slice(0, MAX_IMAGES);
        return [...validUrls, ...Array(MAX_IMAGES - validUrls.length).fill('')];
    });

    const [imageFiles, setImageFiles] = useState<(File | null)[]>(Array(MAX_IMAGES).fill(null));
    const [cropperSrc, setCropperSrc] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const cropperRef = useRef<ReactCropperElement>(null);
    const [deletedImages, setDeletedImages] = useState<string[]>([]);

    const validateField = async (field: string, value: unknown) => {
        try {
            const schema = postValidationSchema(isEditMode, existingPost);
            await schema.validateAt(field, { ...formData, [field]: value });
         
            setErrors(prev => Object.fromEntries(
                Object.entries(prev).filter(([key]) => key !== field)
            ));
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                setErrors(prev => ({
                    ...prev,
                    [field]: error.message
                }));
            }
        }
    };

    const handleInputChange = (field: keyof PostFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => Object.fromEntries(
                Object.entries(prev).filter(([key]) => key !== field)
            ));

        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement> | null, index: number) => {
        const file = event?.target?.files?.[0];
        if (!file) return;

        try {

            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showToastMessage('Please upload only JPG, JPEG or PNG images', 'error');
                return;
            }

            if (file.size > 8 * 1024 * 1024) {
                showToastMessage('Image size should be less than 8MB', 'error');
                return;
            }


            const tempImageFiles = [...imageFiles];
            tempImageFiles[index] = file;


            if (isEditMode && existingImages[index] && !existingImages[index].startsWith('blob:')) {
                setDeletedImages(prev => [...prev, existingImages[index]]);
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setCropperSrc(e.target?.result as string);
                setCurrentImageIndex(index);
                setImageFiles(tempImageFiles);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Image validation error:', error);
        };
    }

    const handleCrop = async () => {
        const cropper = cropperRef.current?.cropper;
        if (!cropper || currentImageIndex === null) return;

        try {
            const croppedCanvas = cropper.getCroppedCanvas({
                maxWidth: 1080,
                maxHeight: 1080,
                imageSmoothingQuality: 'high'
            });

            const blob = await new Promise<Blob>((resolve, reject) => {
                croppedCanvas.toBlob(
                    (b) => b ? resolve(b) : reject(new Error('Failed to create blob')),
                    'image/jpeg',
                    0.9
                );
            });

            const croppedFile = new File([blob], `cropped-image-${currentImageIndex}.jpg`, {
                type: 'image/jpeg'
            });

            setImageFiles(prev => {
                const newFiles = [...prev];
                newFiles[currentImageIndex] = croppedFile;
                return newFiles;
            });

            // Create object URL for preview
            const imageUrl = URL.createObjectURL(croppedFile);
            setExistingImages(prev => {
                const newImages = [...prev];
                newImages[currentImageIndex] = imageUrl;
                return newImages;
            });

            setCropperSrc(null);
            setCurrentImageIndex(null);
        } catch (error) {
            console.error('Cropping error:', error);
            showToastMessage('Failed to process image. Please try again.', 'error');
        }
    };



    const handleRemoveImage = async (index: number) => {

        if (existingImages[index] && !existingImages[index].startsWith('blob:')) {
            setDeletedImages(prev => [...prev, existingImages[index]]);
        }
        // Update existing images
        setExistingImages(prev => {
            const newImages = [...prev];
            newImages[index] = '';
            return newImages;
        });

        setImageFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = null;
            return newFiles;
        });

        const updatedImageFiles = imageFiles.map((file, i) =>
            i === index ? null : file
        );
        await validateField('images', updatedImageFiles);
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {

            const schema = postValidationSchema(isEditMode, existingPost);
            await schema.validate({
                ...formData,
                images: imageFiles
            }, { abortEarly: false });

            setIsSubmitting(true);
            const submitFormData = new FormData();

            submitFormData.append('caption', formData.caption);
            submitFormData.append('location', formData.location);
            submitFormData.append('serviceType', formData.serviceType);
            submitFormData.append('status', formData.status);

            if (isEditMode) {
                const remainingImages = existingImages
                    .filter((url, index) =>
                        url &&
                        !url.startsWith('blob:') &&
                        !deletedImages.includes(url) &&
                        !imageFiles[index]
                    );
                const newImageCount = imageFiles.filter(file => file instanceof File).length;
                const totalImages = remainingImages.length + newImageCount;
                if (totalImages < 4 || totalImages > 6) {
                    throw new Error(`Total images must be between 4 and 6. Current: ${totalImages}`);
                }
                if (remainingImages.length > 0) {
                    submitFormData.append('existingImages', remainingImages.join(','));
                }
                if (deletedImages.length > 0) {
                    submitFormData.append('deletedImages', deletedImages.join(','));
                }
            }

            const validImageFiles = imageFiles.filter((file): file is File => file instanceof File);
            validImageFiles.forEach(file => {
                submitFormData.append('images', file);
            });


            const endpoint = isEditMode && existingPost?._id
                ? `/edit-post/${existingPost._id}`
                : '/add-post';

            const method = isEditMode ? 'put' : 'post';

            const response = await axiosInstanceVendor[method](endpoint, submitFormData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            console.log(response, 'response got');

            showToastMessage(
                isEditMode ? "Post updated successfully!" : "Post created successfully!",
                'success'
            );

            if (isEditMode && onClose) {
                onClose();
                window.dispatchEvent(new CustomEvent('postUpdated'));
            } else {
                navigate(VENDOR.VIEW_POSTS);
            }
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors: Record<string, string> = {};
                error.inner.forEach(err => {
                    if (err.path) {
                        validationErrors[err.path] = err.message;
                    }
                });
                setErrors(validationErrors);
                showToastMessage('Please fix all validation errors', 'error');
                return;
            }
            console.error("Error submitting post:", error);
            showToastMessage('Failed to submit post', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        return () => {
            existingImages.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [existingImages]);

    return (
        <div className="flex">
            {!isEditMode && <div><SidebarVendor /></div>}
            <div className="container mx-auto ">
                <form onSubmit={handleSubmit}>
                    <Card className="w-full max-w-3xl mx-auto my-8">
                        <CardHeader className="flex justify-center bg-black">
                            <h1 className="text-2xl font-bold text-white">
                                {isEditMode ? 'Edit Post' : 'Upload Contents'}
                            </h1>
                        </CardHeader>
                        <CardBody className="gap-4">
                            {/* Form fields remain the same */}
                            <Select
                                key={`serviceType-${formData.serviceType}`}
                                label="Service Type"
                                placeholder="Select service type"
                                // value={formData.serviceType}
                                selectedKeys={formData.serviceType ? [formData.serviceType] : []}
                                onChange={(e) => handleInputChange('serviceType', e.target.value)}
                                errorMessage={errors.serviceType}
                                isInvalid={!!errors.serviceType}
                                isRequired
                            >
                                {Object.values(ServiceProvided).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </Select>

                            <Select
                                key={`status-${formData.status}`}
                                label="Status"
                                placeholder="Select status"
                                // value={formData.status}
                                selectedKeys={formData.status ? [formData.status] : []}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                errorMessage={errors.status}
                                isInvalid={!!errors.status}
                                isRequired
                            >
                                {Object.values(PostStatus)
                                    .filter(status => status !== PostStatus.Blocked)
                                    .map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {status}
                                        </SelectItem>
                                    ))}
                            </Select>

                            <Input
                                label="Caption"
                                placeholder="Enter caption"
                                value={formData.caption}
                                onChange={(e) => handleInputChange('caption', e.target.value)}
                                errorMessage={errors.caption}
                                isInvalid={!!errors.caption}
                                isRequired
                            />

                            <Input
                                label="Location"
                                placeholder="Enter location"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                errorMessage={errors.location}
                                isInvalid={!!errors.location}
                                isRequired
                            />

                            {errors.images && (
                                <div className="text-red-500 text-sm mt-1">{errors.images}</div>
                            )}


                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {Array(6).fill(null).map((_, index) => (
                                    <motion.div
                                        key={index}
                                        className="relative aspect-square cursor-pointer"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {(existingImages[index] || imageFiles[index]) ? (
                                            <>
                                                <Image
                                                    src={existingImages[index]}
                                                    alt={`Image ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <button
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center z-30 justify-center"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveImage(index);
                                                    }}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleImageUpload(e, index)}
                                                />
                                                <Plus size={24} className="text-gray-400" />
                                            </label>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Cropper modal */}
                            {cropperSrc && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                                >
                                    <Card className="w-full max-w-md">
                                        <CardBody>
                                            <Cropper
                                                ref={cropperRef}
                                                src={cropperSrc}
                                                style={{ height: 500, width: '100%' }}
                                                aspectRatio={1}
                                                guides={true}
                                                viewMode={1}
                                                dragMode="move"
                                                background={false}
                                                minCropBoxWidth={70} 
                                                minCropBoxHeight={70}
                                                responsive={true}
                                                restore={true}
                                                zoomable={false}
                                                checkCrossOrigin={false}
                                            />
                                            <div className="flex justify-end mt-4 gap-2">
                                                <Button color="danger" onClick={() => setCropperSrc(null)}>
                                                    Cancel
                                                </Button>
                                                <Button className="bg-black text-white" onClick={handleCrop}>
                                                    Crop & Save
                                                </Button>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                className="mt-4 bg-black text-white"
                                endContent={<Upload size={16} />}
                                isLoading={isSubmitting}
                                isDisabled={isSubmitting}
                            >
                                {isEditMode
                                    ? (isSubmitting ? 'Updating Post...' : 'Update Post')
                                    : (isSubmitting ? 'Creating Post...' : 'Create Post')
                                }
                            </Button>
                        </CardBody>
                    </Card>
                </form>
            </div>
        </div>
    );
}
