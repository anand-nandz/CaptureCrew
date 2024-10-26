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
import { UserData } from '../../../types/userTypes';
import { validateProfile } from '../../../validations/user/userVal';
import { showToastMessage } from '../../../validations/common/toast';

interface UserDetails {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    onSave: (data: Partial<FormData>) => Promise<void>

}
interface FormData {
    name: string;
    email: string;
    contactinfo: string;
    isGoogleUser?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface ValidationErrors {
    name: string;
    contactinfo: string;
}

const EditProfileModal: React.FC<UserDetails> = ({ user, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<FormData>({
        name: user?.name || '',
        email: user?.email || '',
        contactinfo: user?.contactinfo || '' ,
        isGoogleUser: user?.isGoogleUser || false,
        createdAt: user?.createdAt || '',
        updatedAt: user?.updatedAt || '',
    });

    const [errors, setErrors] = useState<ValidationErrors>({
        name: '',
        contactinfo: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                contactinfo: user.contactinfo || '',
                isGoogleUser: user.isGoogleUser || false,
                createdAt: user.createdAt || '',
                updatedAt: user.updatedAt || '',
            });
        }
    }, [user]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateProfile({
            name: formData.name,
            contactinfo: formData.contactinfo
        });
        setErrors(validationErrors);

        if (!validationErrors.name && !validationErrors.contactinfo) {
            try {
                const token = localStorage.getItem('userToken');
                if (!token) {
                    showToastMessage('Authentication required', 'error');
                    return;
                }
                const updates: Partial<FormData> = {};
                if (formData.name !== user?.name) updates.name = formData.name;
                if (formData.contactinfo !== user?.contactinfo) updates.contactinfo = formData.contactinfo;

               if (Object.keys(updates).length > 0) {
                    await onSave(updates as Partial<UserData>);
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
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
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
                            </Grid>
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{ backgroundColor: 'white', color: 'black', '&:hover': {backgroundColor: 'black', color: 'white' } }}
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

export default EditProfileModal;