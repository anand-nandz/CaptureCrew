import {
  Box,
  Grid,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Container,

} from '@mui/material';
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faStar,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  CardFooter,
  Input
} from "@material-tailwind/react";
import { useCallback, useEffect, useState } from 'react';
import { AcceptanceStatus, VendorData, VendorResponse } from '../../types/vendorTypes';
import { axiosInstance } from '../../config/api/axiosInstance';
import Loader from '../common/Loader';
import Modal from '@mui/material/Modal'
import IconButton from '@mui/material/IconButton'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { useNavigate } from 'react-router-dom';
import { USER } from '../../config/constants/constants';
import { ReportModal } from '../common/ReportModal';
import { showToastMessage } from '@/validations/common/toast';


const ListedVendors = () => {
  const [vendors, setVendors] = useState<VendorData[]>([])
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);


  const navigate = useNavigate()

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get<VendorResponse>('/vendors', {
        params: {
          page: currentPage,
          limit: 3,
          search: searchTerm,

        }
      })
      console.log(response.data.vendors);


      const transformedVendors: VendorData[] = response.data.vendors.map((vendor) => ({
        ...vendor._doc,
        imageUrl: vendor.imageUrl
      }));

      setVendors(transformedVendors);

      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm])

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleShowDetails = (vendor: VendorData) => {
    setSelectedVendor(vendor)
    setModalOpen(true)
  }

  const viewPorfolio = (vendorId: string) => {
    navigate(`${USER.PORTFOLIO}/${vendorId}`)
  }

  const handleReport = (vendorId: string) => {
    const vendorToReport = vendors.find(v => v._id === vendorId);
    setSelectedVendor(vendorToReport || null);
    setIsReportModalOpen(true);
  }

  const handleReportSubmit = async (vendorId: string | undefined, reportData: { reason: string; additionalDetails?: string }) => {
    if (!vendorId) {
      showToastMessage('Vendor ID is missing', 'error');
      return;
    }
  
    try {
      await axiosInstance.post('/reports', {
        itemId: vendorId,
        type: 'Vendor',
        reason: reportData.reason,
        additionalDetails: reportData.additionalDetails
      });
  
      showToastMessage('Vendor reported successfully', 'success');
    } catch (error) {
      showToastMessage('Failed to submit report', 'error');
      throw error;
    }
  };
  

  const PostModal = () => {
    if (!selectedVendor || !modalOpen) return null;

    return (
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        className="flex items-center justify-center"
      >
        <Box className="relative bg-white dark:bg-gray-900 w-full max-w-6xl mx-4 rounded-lg overflow-hidden flex flex-col md:flex-row md:h-[80vh]">
          <div className="relative w-full md:w-[60%] h -full bg-black flex items-center justify-center">
            <IconButton
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 z-20 text-white hover:text-gray-300 md:hidden"
            >
              <FontAwesomeIcon icon={faTimes} />
            </IconButton>

            <div className="relative w-full h-full">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
                wheel={{ step: 0.1 }}
              >
                <TransformComponent
                  wrapperClass="w-full h-full"
                  contentClass="w-full h-full flex items-center justify-center"
                >
                  <img
                    src={selectedVendor.imageUrl || '/images/p5.jpg'}
                    alt={selectedVendor.name}
                    className="max-w-full max-h-full object-fill"
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          </div>

          {/* Right side - Details */}
          <div className="w-full md:w-[40%] flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedVendor.name}</h2>

                <p className="text-sm text-gray-500 mt-1">{selectedVendor.companyName}</p>

              </div>
              <IconButton
                onClick={() => setModalOpen(false)}
                className="hidden md:flex"
              >
                <FontAwesomeIcon icon={faTimes} />
              </IconButton>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* About Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-gray-600">{selectedVendor.about}</p>
                </div>

                {/* Contact Information */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  {selectedVendor.email && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                      <span>{selectedVendor.email}</span>
                    </div>
                  )}
                  {selectedVendor.contactinfo && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <FontAwesomeIcon icon={faPhone} className="mr-2" />
                      <span>{selectedVendor.contactinfo}</span>
                    </div>
                  )}
                  {selectedVendor.city && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                      <span>{selectedVendor.city}</span>
                    </div>
                  )}

                </div>

                {/* Rating Section */}
                <div className="border-t pt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-2" />
                    <span className="font-semibold">
                      Rating: {selectedVendor.totalRating?.toFixed(1) || '0.0'}
                    </span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    );
  };


  return (
    <Container sx={{ py: 2 }}>
      <div className="flex flex-col items-center py-5 md:py-20">
        <h2 className="text-4xl font-light tracking-[0.3em] text-[#B8860B] uppercase text-center mb-5">
          Vendors LIST
        </h2>
        <div className="w-full lg:w-1/3 md:w-1/2 sm:w-full">
          <Input
            label="Search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search vendors..."
            crossOrigin={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
            className="!border !border-gray-300 bg-white text-gray-900 shadow-lg shadow-gray-900/5 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-gray-900 focus:!border-t-gray-900 focus:ring-gray-900/10 rounded-xl"
            labelProps={{
              className: "hidden",
            }}
            containerProps={{
              className: "min-w-[100px] relative",
            }}
          />
        </div>
      </div>

      <Box sx={{ flexGrow: 1 }}>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          sx={{ padding: { xs: 2, sm: 3, md: 4 } }}
        >
          {isLoading ? (
            <tr><td colSpan={6} className="text-center p-4"><Loader /></td></tr>
          ) : vendors.length === 0 ? (
            <tr><td colSpan={6} className="text-center p-4">No vendors found</td></tr>
          ) : (

            vendors.map((vendor) => (

              <>
                {vendor.isActive && vendor.isVerified && vendor.isAccepted === AcceptanceStatus.Accepted && (
                  <Grid item xs={4} sm={4} md={4} key={vendor._id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'translateY(-4px)',
                          transition: 'all 0.3s ease-in-out'
                        }
                      }}
                    >


                      <CardMedia
                        sx={{ height: 300 }}
                        image={vendor.imageUrl || '/images/p5.jpg'}
                        title={vendor.name}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5" component="div">
                          {vendor?.name}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {vendor?.about}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small"
                          onClick={() => viewPorfolio(vendor._id)}
                        >View Porfolio</Button>
                      </CardActions>
                      <CardActions>
                        <Button size="small"
                          onClick={() => handleShowDetails(vendor)}
                        >View Details</Button>
                      </CardActions>
                      <CardActions>
                        <Button
                          size="small"
                          // startContent={<FontAwesomeIcon icon={faFlag} />}
                          onClick={() => handleReport(vendor._id)}
                        >
                          Report Vendor
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                )}


              </>



            ))

          )}

        </Grid>
        <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4" placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}>
          <Typography color="blue-gray" className="font-normal" component="span">
            Page {currentPage} of {totalPages}
          </Typography>
          <div className="flex gap-2">
            <Button variant="outlined" size="small" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button variant="outlined" size="small" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </CardFooter>
      </Box>

      <PostModal />
      <ReportModal
        isOpen={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        type= 'Vendor'
        onReportSubmit={(reportData) => handleReportSubmit(selectedVendor?._id, reportData)} 
        />

    </Container>
  );
};

export default ListedVendors;