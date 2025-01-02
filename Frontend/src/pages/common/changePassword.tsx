import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Button,
    IconButton,
    Box,
    Alert,
} from '@mui/material';
import { Eye, EyeOff } from 'lucide-react';
import CloseIcon from '@mui/icons-material/Close';
import { showToastMessage } from '../../validations/common/toast';
import { validatePassword } from '../../validations/user/userVal';
import { useUserSignUp } from '../../hooks/user/useUserSignup';
import axios from 'axios';

interface PasswordChangeDetails {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: PasswordFormData) => Promise<void>;
}

const initialValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
}

export interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ValidationErrors {
    password?: string;
    confirmPassword?: string;
    currentPassword?: string;
}

const ChangePasswordModal: React.FC<PasswordChangeDetails> = ({ isOpen, onClose, onSave }) => {
    const { 
        showPassword, 
        togglePasswordVisibility, 
        showPassword1, 
        togglePasswordVisibility1, 
        showPassword2, 
        togglePasswordVisibility2 
    } = useUserSignUp();

    const [formData, setFormData] = useState<PasswordFormData>(initialValues);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [apiError, setApiError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
        setApiError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError(null);

        // Validate passwords
        const validationErrors = validatePassword({
            password: formData.newPassword,
            confirmPassword: formData.confirmPassword
        });

        const allErrors = {
            ...validationErrors,
            currentPassword: !formData.currentPassword ? 'Current password is required' : ''
        };

        setErrors(allErrors);

        if (!Object.values(allErrors).some(error => error !== '')) {
            try {
                await onSave(formData);
                handleClose();
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const errorMessage = error.response?.data?.message || 
                                         error.response?.data?.error || 
                                         'Error changing password';
                    
                    setApiError(errorMessage);
                    
                    showToastMessage(errorMessage, 'error');
                } else {
                    const unexpectedError = error instanceof Error 
                        ? error.message 
                        : 'Unexpected error occurred';
                    
                    setApiError(unexpectedError);
                    showToastMessage(unexpectedError, 'error');
                }
            }
        }
    };

    const handleClose = () => {
        setFormData(initialValues); 
        setErrors({});
        setApiError(null);                
        onClose();                     
    };

    useEffect(() => {
        if (!isOpen) {
            setFormData(initialValues); 
            setErrors({});
            setApiError(null);                
        }
    }, [isOpen]);

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <DialogTitle sx={{ p: 0 }}>Change Password</DialogTitle>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {apiError && (
                    <Box sx={{ mb: 2 }}>
                        <Alert severity="error">{apiError}</Alert>
                    </Box>
                )}

                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 1 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <div className="relative">
                                <TextField
                                    fullWidth
                                    label="Current Password"
                                    name="currentPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    error={!!errors.currentPassword}
                                    helperText={errors.currentPassword}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                            <div className="relative">
                                <TextField
                                    fullWidth
                                    label="New Password"
                                    name="newPassword"
                                    type={showPassword1 ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    error={!!errors.password}
                                    helperText={errors.password}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    onClick={togglePasswordVisibility1}
                                >
                                    {showPassword1 ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                            <div className="relative">
                                <TextField
                                    fullWidth
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    type={showPassword2 ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    onClick={togglePasswordVisibility2}
                                >
                                    {showPassword2 ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                sx={{
                                    backgroundColor: 'white',
                                    color: 'black',
                                    '&:hover': {
                                        backgroundColor: 'black',
                                        color: 'white'
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                                sx={{
                                    backgroundColor: 'black',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#333'
                                    }
                                }}
                            >
                                Change Password
                            </Button>
                        </Box>
                    </DialogContent>
                </form>
            </Box>
        </Dialog>
    );
};

export default ChangePasswordModal;