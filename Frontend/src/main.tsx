import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import '../public/css/animation.css'
import { Provider } from 'react-redux'
import { persistor, store } from './redux/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import VendorApp from './pages/VendorApp.js'



const router =  createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path='/*' element={<App/>}>
        <Route path='/*' element={<App/>}/>
      </Route>

      <Route path='/vendor/*' element={<VendorApp/>}/>

    </>
  )
)


createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <StrictMode>
        <ToastContainer/>
          <RouterProvider router={router}/>  
      </StrictMode>,
    </PersistGate>
  </Provider>
)
