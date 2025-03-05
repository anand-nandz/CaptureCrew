
import DynamicBackground from '@/components/common/DynamicBackground'
import Footer from '../../../layout/user/footer'
import VendorNavbar from '../../../layout/vendor/VendorNavbar'
import HeroBannerVendor from './HeroBannerVendor'
import MainSectionVendor from './MainSectionVendor'


const Dashboard = () => {
  return (
    <>
      <VendorNavbar />
      <HeroBannerVendor />
      <MainSectionVendor />
      <DynamicBackground
        filepath="/images/vendor1.jpg"
        height="h-[550px]"
        type="image"
        className="w-full"
      >
      </DynamicBackground>
      <Footer />

    </>
  )
}

export default Dashboard