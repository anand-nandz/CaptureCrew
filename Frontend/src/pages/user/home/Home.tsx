

import Footer from '../../../layout/user/footer'
import UserNavbar from '../../../layout/user/navbar'
import HeroSection from '../../../components/user/HeroSection'
import ShowAllPosts from '../../../components/user/ShowAllPosts'

const Home = () => {
  return (
    <div >
          <UserNavbar />
          <HeroSection/>
          <ShowAllPosts/>
          <Footer/>
    </div>
  )
}

export default Home

