import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux"
import AdminRootState from "../../redux/rootstate/AdminState"
import { ToastContainer } from "react-toastify";
import { Layout } from "lucide-react";
import Loader from "../../components/common/Loader";
import { Outlet } from "react-router-dom";

const AdminCheck: React.FC = () => {
    const isAdminSignedIn = useSelector((state: AdminRootState) => state.admin.isAdminSignedIn);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        setTimeout(() => setLoading(false), 1000);
    }, []);

    return (
        <>
            <ToastContainer />
            {
                isAdminSignedIn ? (
                    <Layout>
                        {loading ? <Loader /> : <Outlet />}
                    </Layout>
                ) : (
                    <div className="mainContent flex-1 ml-50">
                        <Outlet />
                    </div>
                )
            }
        </>
    )
}

export default AdminCheck