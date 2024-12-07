export const USER ={
    SIGNUP: '/signup',
    LOGIN : '/login',
    VERIFY :'/verify',
    FORGOT_PWDMAIL: "/forgot-password/:token",

    HOME : '/',
    PROFILE : '/profile',
    VENDORLIST : '/vendorList',
    BOOKING : '/bookings',
    POST : '/viewPosts',
    PORTFOLIO : '/portfolio',
    SERVICE_AVAILABILTY : '/serviceAvailabilty',
    PAYMENT_SUCCESS : '/paymentSuccess',
    PAYMENT_FAILURE :`/paymentFailed`,
    WALLET: '/wallet',
    CHAT: '/chat',
    ABOUT_US:'/aboutus'

}


export const VENDOR ={
    VENDOR : '/vendor',
    SIGNUP: '/vendor/signup',
    LOGIN : '/vendor/login',
    VERIFY :'/vendor/verify-email',
    PROFILE : '/vendor/profile',
    FORGOT_PWDMAIL: "/forgot-password/:token",

    DASHBOARD : '/vendor/dashboard',
    VIEW_POSTS : '/vendor/view-posts',
    ADD_POST : '/vendor/add-post',
    VIEW_PACKAGES : `/vendor/view-packages`,
    ADD_PACKAGE : '/vendor/add-package',
    DATE_AVAILABILTY : '/vendor/dateAvailabilty',
    REQUEST_BOOKING : '/vendor/requestBookings',
    WALLET: '/vendor/wallet',
    CHAT: '/vendor/chat',
    REVIEW: '/vendor/review',
    STATS: '/vendor/stats',

}


export const ADMIN ={
    LOGIN : '/',
    DASHBOARD : '/dashboard',
    USERS : '/users' ,
    VENDORS : '/vendors',
    POST : '/view-all-posts',
    ALLBOOKINGS: '/all-bookingsReqs',
    REPORT: '/client-report'
}



