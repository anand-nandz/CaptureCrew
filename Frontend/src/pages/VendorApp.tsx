import Loader from '../components/common/Loader'
import { useEffect, useState } from "react"
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import VendorSignUp from "./vendor/auth/VendorSignUp";
import VendorLogin from './vendor/auth/VendorLogin';
import VerifyEmail from './common/VerifyEmail';
import Dashboard from './vendor/Dashboard';

const VendorApp = () => {
    const [loading,setLoading] = useState<boolean>(true) ;
    const {pathname} = useLocation() ;

    useEffect(()=>{
        window.scrollTo(0,0);
    },[pathname])
    useEffect(()=>{
        setTimeout(()=>setLoading(false),1000);
    },[]) ;

  return loading ? (
    <Loader/>
  ) : (
    <>
        <ToastContainer/>
        <Routes>
            <Route path="/signup" element={<VendorSignUp/>}/>
            <Route path="/login" element={<VendorLogin/>}/>
            <Route path="/verify" element={<VerifyEmail/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
        </Routes>
        
    </>
  )
}

export default VendorApp