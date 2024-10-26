
import { SortableTableVendor } from '../../../components/admin/vendorList/vendortable'
// import Layout from '../../../layout/admin/layout'


const VendorList = () => {
  return (
    <>
        {/* <Layout> */}
          <div className='p-4'>
            <SortableTableVendor/>
          </div>
        {/* </Layout>     */}
    </>
  )
}

export default VendorList