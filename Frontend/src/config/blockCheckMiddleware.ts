
// middleware/blockCheckMiddleware.ts
// import Swal from 'sweetalert2';
import { logout as userLogout } from '../redux/slices/UserSlice';
import { logout as vendorLogout } from '../redux/slices/VendorSlice';

export const createBlockCheckMiddleware = () => {
    return (store: any) => (next: any) => async (action: any) => {
        // Check if the action contains an API error response indicating blocked status
        if (action?.error?.response?.status === 403 && 
            action?.error?.response?.data?.message === 'Blocked by Admin') {
            const state = store.getState();

            // const result = await Swal.fire({
            //     title: 'Account Blocked',
            //     text: 'Your account has been blocked by the administrator.',
            //     icon: 'error',
            //     confirmButtonText: 'OK',
            //     allowOutsideClick: false,
            //     allowEscapeKey: false
            // });
            
            if (state.user.isUserSignedIn ) {
                store.dispatch(userLogout());
            } else if (state.vendor.isVendorSignedIn ) {
                store.dispatch(vendorLogout());
            }
        }
        return next(action);
    };
};