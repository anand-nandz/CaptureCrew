import React, { useState } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    Select,
    SelectItem,
    Button,
    Textarea,
} from '@nextui-org/react';
import { Plus, Minus, Save } from 'lucide-react';
import { ServiceProvided } from '../../../types/postTypes';
import { PackageFormData, PackageData, FormErrors,CustomizationOptionPackage } from '../../../types/packageTypes';
import { axiosInstanceVendor } from '../../../config/api/axiosInstance';
import { showToastMessage } from '../../../validations/common/toast';
import SidebarVendor from '../../../layout/vendor/SidebarProfileVendor';
import axios, { AxiosError } from 'axios';
import { ErrorResponse } from '../../../hooks/user/useLoginUser';
import { useNavigate } from 'react-router-dom';
import { CustomizationForm } from '@/components/vendor/CustomizationForm';

interface AddEditPackageProps {
    isEditMode?: boolean;
    existingPackage?: PackageData | null;
    onClose?: () => void;
    onPackageUpdated?: () => void;
}

const AddEditPackage: React.FC<AddEditPackageProps> = ({
    isEditMode = false,
    existingPackage,
    onClose,
    onPackageUpdated
}) => {
    const [formData, setFormData] = useState<PackageFormData>({
        serviceType: existingPackage?.serviceType || '',
        price: existingPackage?.price || 0,
        description: existingPackage?.description || '',
        duration: existingPackage?.duration || 1,
        photographerCount: existingPackage?.photographerCount || 1,
        videographerCount: existingPackage?.videographerCount || 0,
        features: existingPackage?.features || [''],
        customizationOptions: existingPackage?.customizationOptions || []

    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate()
    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.serviceType) {
            newErrors.serviceType = 'Service type is required';
        }

        if (formData.price <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        if (!formData.description) {
            newErrors.description = 'Description is required';
        }

        if (formData.duration <= 0) {
            newErrors.duration = 'Duration must be greater than 0';
        }

        if (formData.photographerCount < 0) {
            newErrors.photographerCount = 'Photographer count cannot be negative';
        }

        if (formData.videographerCount < 0) {
            newErrors.videographerCount = 'Videographer count cannot be negative';
        }

        if (formData.features.some(feature => !feature.trim())) {
            newErrors.features = 'All features must be filled';
        }

        if (formData.customizationOptions.length > 0) {
            const optionErrors = formData.customizationOptions.map(option => {
                const errors: Record<string, string> = {};
                if (!option.type) errors.type = 'Type is required';
                if (!option.description) errors.description = 'Description is required';
                if (option.price <= 0) errors.price = 'Price must be greater than 0';
                return Object.keys(errors).length > 0 ? errors : undefined;
            });
    
            if (optionErrors.some(error => error !== undefined)) {
                newErrors.optionErrors = optionErrors.map(error => error || {});
                newErrors.customizationOptions = 'Please fix all customization option errors';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const handleInputChange = (field: keyof PackageFormData, value: string | number | CustomizationOption[]) => {
    //     setFormData(prev => ({ ...prev, [field]: value }));
    //     if (errors[field]) {
    //         setErrors(prev => {
    //             const { [field]: _, ...rest } = prev;
    //             return rest;
    //         });
    //     }
    // };
    
    const handleInputChange = (field: keyof PackageFormData, value: string | number | CustomizationOptionPackage[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => Object.fromEntries(
                Object.entries(prev).filter(([key]) => key !== field)
            ));
        }
    };

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeature = (index: number) => {
        if (formData.features.length > 1) {
            setFormData(prev => ({
                ...prev,
                features: prev.features.filter((_, i) => i !== index)
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!validateForm()) {
            showToastMessage('Please fix all validation errors', 'error');
            return;
        }

        try {
            setIsSubmitting(true);

            const endpoint = isEditMode && existingPackage?._id
                ? `/edit-package/${existingPackage._id}`
                : '/add-package';

            const method = isEditMode ? 'put' : 'post';

            await axiosInstanceVendor[method](endpoint, formData);

            if (!isEditMode) {
                navigate('/vendor/view-packages');
            }
            showToastMessage(
                isEditMode ? 'Package updated successfully!' : 'Package created successfully!',
                'success'
            );

            if (onClose) {
                onClose();
            }

            if (onPackageUpdated) {
                onPackageUpdated();
            }
        } catch (error) {
            console.error('Error submitting package:', error);
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<ErrorResponse>;
                const errorMessage = axiosError.response?.data?.message ||
                    axiosError.response?.data?.error ||
                    axiosError.message ||
                    "Failed to submit package";
                showToastMessage(errorMessage, "error");
            } else {
                // This is an unknown error
                console.error('An unexpected error occurred:', error);
                showToastMessage("An unexpected error occurred", "error");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (

        <div className="flex">
            {!isEditMode && <div><SidebarVendor /></div>}
            <div className="container mx-auto">
                <form onSubmit={handleSubmit}>
                    <Card className="w-full max-w-4xl mx-auto my-8">
                        <CardHeader className="flex justify-center bg-black">
                            <h1 className="text-2xl font-bold text-white">
                                {isEditMode ? 'Edit Package' : 'Add Package'}
                            </h1>
                        </CardHeader>
                        <CardBody className="gap-4">
                            <Select
                                label="Service Type"
                                placeholder="Select service type"
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

                            <Input
                                type="number"
                                label="Price"
                                placeholder="Enter price"
                                value={formData.price.toString()}
                                onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                                errorMessage={errors.price}
                                isInvalid={!!errors.price}
                                isRequired
                            />

                            <Textarea
                                label="Description"
                                placeholder="Enter package description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                errorMessage={errors.description}
                                isInvalid={!!errors.description}
                                isRequired
                            />

                            <Input
                                type="number"
                                label="Duration (hours)"
                                placeholder="Enter duration"
                                value={formData.duration.toString()}
                                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                                errorMessage={errors.duration}
                                isInvalid={!!errors.duration}
                                isRequired
                            />

                            <div className="flex gap-4">
                                <Input
                                    type="number"
                                    label="Photographers"
                                    placeholder="Number of photographers"
                                    value={formData.photographerCount?.toString()}
                                    onChange={(e) => handleInputChange('photographerCount', parseInt(e.target.value))}
                                    errorMessage={errors.photographerCount}
                                    isInvalid={!!errors.photographerCount}
                                />

                                <Input
                                    type="number"
                                    label="Videographers"
                                    placeholder="Number of videographers"
                                    value={formData.videographerCount?.toString()}
                                    onChange={(e) => handleInputChange('videographerCount', parseInt(e.target.value))}
                                    errorMessage={errors.videographerCount}
                                    isInvalid={!!errors.videographerCount}
                                />
                            </div>
                            

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Features</label>
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            placeholder="Enter feature"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            errorMessage={index === 0 && errors.features}
                                            isInvalid={!!errors.features}
                                        />
                                        <Button
                                            type="button"
                                            isIconOnly
                                            color="danger"
                                            onClick={() => removeFeature(index)}
                                            disabled={formData.features.length === 1}
                                        >
                                            <Minus size={16} />
                                        </Button>
                                    </div>
                                ))}
                                {formData.features.length < 5 && (
                                    <Button
                                    type="button"
                                    onClick={addFeature}
                                    startContent={<Plus size={16} />}
                                    className="mt-4"
                                    disabled={formData.features.length >= 5}
                                >
                                    Add Feature
                                </Button>
                                ) }
                            </div>
                            <div className='flex justify-between mt-2'>
                                <CustomizationForm
                                    options={formData.customizationOptions}
                                    onChange={(options) => handleInputChange('customizationOptions', options)}
                                    errors={errors}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 bg-black text-white"
                                endContent={<Save size={16} />}
                                isLoading={isSubmitting}
                                isDisabled={isSubmitting}
                            >
                                {isEditMode
                                    ? (isSubmitting ? 'Updating Package...' : 'Update Package')
                                    : (isSubmitting ? 'Creating Package...' : 'Create Package')
                                }
                            </Button>
                        </CardBody>
                    </Card>
                </form>
            </div>
        </div>
    );
};

export default AddEditPackage;