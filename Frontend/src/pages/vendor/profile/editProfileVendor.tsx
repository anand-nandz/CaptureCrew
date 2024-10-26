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
import { VendorData } from '../../../types/vendorTypes';
import { validateProfile } from '../../../validations/vendor/vendorRegVal';

interface VendorDetails {
    isOpen: boolean;
    onClose: () => void;
    vendor: VendorData | null;
    onSave: (data: Partial<FormData>) => Promise<void>

}
interface FormData {
    name: string;
    email: string;
    contactinfo: string;
    companyName: string;
    city: string;
    about: string;
    isVerified: boolean;
    logo: string;
    profilepic: string;
    bookedDates: Array<string>;
    totalRating: number;
    createdAt?: string;
    updatedAt?: string;
}


interface ValidationErrors {
    name: string;
    contactinfo: string;
    companyName: string;
    city: string,
    about: string,
}

const EditProfileModalVendor: React.FC<VendorDetails> = ({ vendor, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<FormData>({
        name: vendor?.name || '',
        email: vendor?.email || '',
        contactinfo: vendor?.contactinfo || '',
        companyName: vendor?.companyName || '',
        city: vendor?.city || '',
        isVerified: vendor?.isVerified || true,
        about: vendor?.about || '',
        logo: vendor?.logo || '',
        profilepic: vendor?.profilepic || '',
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
                profilepic: vendor.profilepic || '',
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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
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
                const updates: Partial<FormData> = {};
                if (formData.name !== vendor?.name) updates.name = formData.name;
                if (formData.contactinfo !== vendor?.contactinfo) updates.contactinfo = formData.contactinfo;
                if (formData.companyName !== vendor?.companyName) updates.companyName = formData.companyName;
                if (formData.city !== vendor?.city) updates.city = formData.city;
                if (formData.about !== vendor?.about) updates.about = formData.about;

                if (Object.keys(updates).length > 0) {
                    await onSave(updates);
                    onClose();
                } else {
                    showToastMessage('No changes to save', 'error');
                    onClose();
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                showToastMessage('Error updating profile', 'error');
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
                                    <Avatar
                                        src="/api/placeholder/128/128"
                                        sx={{ width: 128, height: 128, mb: 2 }}
                                    />
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
                                sx={{ backgroundColor: 'black', color: 'white', '&:hover': { backgroundColor: '#333' } }}
                            >
                                Save Changes
                            </Button>

                        </Box>
                    </DialogContent>
                </form>
            </Box>
        </Dialog>
    );
};

export default EditProfileModalVendor;