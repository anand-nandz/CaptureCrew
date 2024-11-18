import UserNavbar from '../../../layout/user/navbar'
import Footer from '../../../layout/user/footer'
import HeroBanner from '../../../components/user/HeroBanner'
import ShowAllPosts from '../../../components/user/ShowAllPosts'

const Posts = () => {
  return (
    <div>
      <UserNavbar/>
      <HeroBanner/>
      <ShowAllPosts/>
      <Footer/>
    </div>
  )
}

export default Posts