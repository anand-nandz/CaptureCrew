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
import { validateProfile } from '../../../validations/user/userVal';
import { showToastMessage } from '../../../validations/common/toast';
import { IProfileFormData, IUserDetails, IValidationErrors } from '@/utils/interfaces';
import imageCompression from 'browser-image-compression';
import { Loader } from 'lucide-react';


const EditProfileModal: React.FC<IUserDetails> = ({ user, isOpen, onClose, onSave }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.imageUrl || null);
    const [formData, setFormData] = useState<IProfileFormData>({
        name: user?.name || '',
        email: user?.email || '',
        contactinfo: user?.contactinfo || '',
        image: user?.image || undefined,
        isGoogleUser: user?.isGoogleUser || false,
        createdAt: user?.createdAt || '',
        updatedAt: user?.updatedAt || '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const [errors, setErrors] = useState<IValidationErrors>({
        name: '',
        contactinfo: ''
    })

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            try {
                const compressedImage = await imageCompression(file, {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true
                });

                setFormData(prev => ({ ...prev, image: compressedImage }));
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewUrl(reader.result as string);
                };
                reader.readAsDataURL(compressedImage);
            } catch (error) {
                console.error('Error compressing image:', error);
                showToastMessage('Error compressing image', 'error');
            }
        }
    };


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
        setIsLoading(true);

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

                const formDataToSend = new FormData();
                if (formData.name !== user?.name) formDataToSend.append('name', formData.name);
                if (formData.contactinfo !== user?.contactinfo) formDataToSend.append('contactinfo', formData.contactinfo);
                if (formData.image) formDataToSend.append('image', formData.image);
                if (formDataToSend.has('name') || formDataToSend.has('contactinfo') || formDataToSend.has('image')) {
                    await onSave(formDataToSend);
                    onClose();
                } else {
                    showToastMessage('No changes to save', 'error');
                    onClose();
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                showToastMessage('Error updating profile', 'error');
            }
            finally {
                setIsLoading(false);
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
                                            src={previewUrl || user?.imageUrl || "/api/placeholder/128/128"}
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
                                    {/* <Button
                                        component="span"
                                        variant="outlined"
                                        size="small"
                                        sx={{ mb: 2 }}
                                    >
                                        Change Photo
                                    </Button> */}
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
                                        <Loader className="animate-spin mr-2 bg-black text-white" size={16} />
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

export default EditProfileModal;