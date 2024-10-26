
import Footer from '../../layout/user/footer'
import VendorNavbar from '../../layout/vendor/VendorNavbar'
import { ImageMasonry } from '../common/imageMasonary'
import HeroSectionVendor from '../user/home/Descp'


const Dashboard = () => {
  return (
    <>
      <VendorNavbar/>
      <HeroSectionVendor/>
      <ImageMasonry/>
      <Footer/>
      
    </>
  )
}

export default Dashboard