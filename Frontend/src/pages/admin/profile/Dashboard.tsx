import RevenueChart from "@/components/admin/dashboard/RevenueChart"
import DashboardDetails from "../../../components/admin/dashboard/DashboardDetails"
import { Role } from "@/utils/enums"

const Dashboard = () => {
  return (
    <>

      <DashboardDetails />
      <RevenueChart role={Role.Admin}/>

    </>
  )
}

export default Dashboard