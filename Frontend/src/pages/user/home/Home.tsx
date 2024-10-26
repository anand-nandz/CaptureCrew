

import Footer from '../../../layout/user/footer'
import UserNavbar from '../../../layout/user/navbar'
import { PhotoGalleryWithTabs } from '../../common/sampleText'
import HeroSection from '../../../components/user/HeroSection'

const Home = () => {
  return (
    <div >
          <UserNavbar />
          <HeroSection/>
          <PhotoGalleryWithTabs/>
          <Footer/>
    </div>
  )
}

export default Home

