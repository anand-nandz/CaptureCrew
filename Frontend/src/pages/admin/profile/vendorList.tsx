
import { SortableTableVendor } from '../../../components/admin/vendorList/vendortable'
// import Layout from '../../../layout/admin/layout'


const VendorList = () => {
  return (
    <>        
          <div className='p-4'>
            <SortableTableVendor/>
          </div>
    </>
  )
}

export default VendorList