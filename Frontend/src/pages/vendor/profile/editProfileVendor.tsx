import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    Grid,
    IconButton,
    Box,
    Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { showToastMessage } from '../../../validations/common/toast';
import { validateProfile } from '../../../validations/vendor/vendorRegVal';
import { ProfileFormData, ValidationErrors, VendorDetails } from '@/utils/interfaces';
import imageCompression from 'browser-image-compression';
import { Loader2 } from 'lucide-react';

const EditProfileModalVendor: React.FC<VendorDetails> = ({ vendor, isOpen, onClose, onSave }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(vendor?.imageUrl || null);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<ProfileFormData>({
        name: vendor?.name || '',
        email: vendor?.email || '',
        contactinfo: vendor?.contactinfo || '',
        companyName: vendor?.companyName || '',
        city: vendor?.city || '',
        isVerified: vendor?.isVerified || true,
        about: vendor?.about || '',
        logo: vendor?.logo || '',
        imageUrl: vendor?.imageUrl || '',
        totalRating: vendor?.totalRating || 0,
        bookedDates: vendor?.bookedDates || [],
        createdAt: vendor?.createdAt || '',
        updatedAt: vendor?.updatedAt || '',
    });

    const [errors, setErrors] = useState<ValidationErrors>({
        name: '',
        contactinfo: '',
        companyName: '',
        city: '',
        about: '',
    })



    useEffect(() => {
        if (vendor) {
            setFormData({
                name: vendor.name || '',
                email: vendor.email || '',
                contactinfo: vendor.contactinfo?.toString() || '',
                companyName: vendor?.companyName || '',
                city: vendor.city || '',
                isVerified: vendor.isVerified || true,
                about: vendor.about || '',
                logo: vendor.logo || '',
                totalRating: vendor.totalRating || 0,
                bookedDates: vendor.bookedDates || [],
                createdAt: vendor.createdAt || '',
                updatedAt: vendor.updatedAt || '',
            });
        }
    }, [vendor]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {

        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };


    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressedImage = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true
                });

                setFormData(prev => ({ ...prev, imageUrl: compressedImage }));
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(compressedImage);
            } catch (error) {
                console.error('Error compressing image', error)
                showToastMessage('Error compressing image', 'error')
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true)
        const validationErrors = validateProfile({
            name: formData.name,
            contactinfo: formData.contactinfo,
            companyName: formData.companyName,
            city: formData.city,
            about: formData.about
        });
        setErrors(validationErrors);

        const hasErrors = Object.values(validationErrors).some(error => error !== '');
        if (!hasErrors) {
            try {
                const token = localStorage.getItem('vendorToken');
                if (!token) {
                    showToastMessage('Authentication required', 'error');
                    return;
                }

                const formDataToSend = new FormData();
                if (formData.name !== vendor?.name) formDataToSend.append('name', formData.name);
                if (formData.contactinfo !== vendor?.contactinfo) formDataToSend.append('contactinfo', formData.contactinfo);
                if (formData.imageUrl) formDataToSend.append('image', formData.imageUrl);
                if (formData.companyName !== vendor?.companyName) formDataToSend.append('companyName', formData.companyName);
                if (formData.city !== vendor?.city) formDataToSend.append('city', formData.city);
                if (formData.about !== vendor?.about) formDataToSend.append('about', formData.about);


                if (
                    formDataToSend.has('name') ||
                    formDataToSend.has('contactinfo') ||
                    formDataToSend.has('image') ||
                    formDataToSend.has('companyName') ||
                    formDataToSend.has('city') ||
                    formDataToSend.has('about')
                ) {
                    await onSave(formDataToSend);
                    onClose();
                } else {
                    showToastMessage('No changes to save', 'error');
                    onClose();
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                showToastMessage('Error updating profile', 'error');
            } finally {
                setIsLoading(false)
            }
        }
    };
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <DialogTitle sx={{ p: 0 }}>Edit Profile</DialogTitle>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 1 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="image-upload"
                                        type="file"
                                        onChange={handleImageChange}
                                    />
                                    <label htmlFor="image-upload">
                                        <Avatar
                                            src={previewUrl || vendor?.imageUrl || "/api/placeholder/128/128"}
                                            sx={{
                                                width: 128,
                                                height: 128,
                                                mb: 2,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    opacity: 0.8
                                                }
                                            }}
                                        />
                                    </label>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Grid item xs={12} sx={{ mb: 2 }}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            error={!!errors.name}
                                            helperText={errors.name}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                        />
                                    </Grid>
                                </Box>
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Company Name"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            error={!!errors.companyName}
                                            helperText={errors.companyName}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Contact Info"
                                            name="contactinfo"
                                            value={formData.contactinfo}
                                            onChange={handleChange}
                                            error={!!errors.contactinfo}
                                            helperText={errors.contactinfo}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="City"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            error={!!errors.city}
                                            helperText={errors.city}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="About"
                                            name="about"
                                            value={formData.about}
                                            onChange={handleChange}
                                            error={!!errors.about}
                                            helperText={errors.about}
                                            multiline
                                            rows={4}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                sx={{ backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: 'black', color: 'white' } }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={isLoading}
                                sx={{ backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333' } }}
                            >
                               {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 bg-black text-white" size={16} />
                                        Saving...
                                    </>
                                ) : 'Save Changes'}
                            </Button>

                        </Box>
                    </DialogContent>
                </form>
            </Box>
        </Dialog>
    );
};

export default EditProfileModalVendor;