import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/UserSlice';


export const useAuthCheck = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            dispatch(logout());
        }
    }, [dispatch]);
};