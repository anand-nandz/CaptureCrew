

import Footer from '../../../layout/user/footer'
import UserNavbar from '../../../layout/user/navbar'
import HeroSection from '../../../components/user/HeroSection'
import ShowAllPosts from '../../../components/user/ShowAllPosts'
import DynamicBackground from '@/components/common/DynamicBackground'

const Home = () => {
  return (
    <div >
          <UserNavbar />
          <HeroSection/>
          <ShowAllPosts/>
          <DynamicBackground
                filepath="/images/homebg1.jpg"
                height="h-[500px]"
                type="image"
                className="w-full"
            />
          <Footer/>
    </div>
  )
}

export default Home

