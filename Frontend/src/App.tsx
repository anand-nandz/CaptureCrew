import React, { useEffect, useState } from 'react'
import UserSignUp from './pages/user/auth/SignUp'
import Loader from './components/common/Loader'
import { NextUIProvider } from '@nextui-org/react'
import { Route, Routes } from 'react-router-dom';
import { USER } from './config/constants/constants';
import './index.css'
import UserLogin from './pages/user/auth/Login';
import VerifyEmail from './pages/common/VerifyEmail';
import Home from './pages/home/Home';



const App:React.FC = () => {
  const [loading,setLoading] = useState<boolean>(true) ;
   useEffect(()=>{
    setTimeout(()=>setLoading(false),1000);
   },[])

   return (
    <NextUIProvider>
      {loading ? (
        <Loader/>
      ) : (
        <Routes>
          <Route path={USER.HOME} element={<Home/>} />
          <Route path={USER.SIGNUP} element={<UserSignUp/>} />
          <Route path={USER.LOGIN} element={<UserLogin/>} />
          <Route path={USER.VERIFY} element={<VerifyEmail/>} />
        </Routes>
      )}
    </NextUIProvider>
  )
}

export default App