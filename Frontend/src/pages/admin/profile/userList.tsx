
// import Layout from '../../../layout/admin/layout'
import { SortableTable } from '../../../components/admin/userList/userTable'

const UserList = () => {
  return (
    <>
        {/* <Layout> */}
          <div className='p-4'>
            <SortableTable/>
          </div>
        {/* </Layout>     */}
    </>
  )
}

export default UserList