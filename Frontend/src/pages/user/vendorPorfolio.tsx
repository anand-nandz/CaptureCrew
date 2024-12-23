import UserNavbar from '../../layout/user/navbar'
import VendorDetails from '../../components/common/vendorDetails'
import Footer from '../../layout/user/footer'
import { useEffect, useState } from 'react';
import { PostData, PostStatus, ServiceProvided } from '../../types/postTypes';
import { axiosInstance } from '../../config/api/axiosInstance';
import { useParams } from 'react-router-dom';
import { Button, Pagination } from '@nextui-org/react'
import { PostCard } from '../../components/user/PostCard';
import { PostModal } from '../../components/user/PostModal';
import Servicepackage from '../../components/vendor/ServicePackage';
import { VendorData } from '../../types/vendorTypes';
import { AxiosError } from 'axios';
import { showToastMessage } from '@/validations/common/toast';
import VendorReviews from '@/components/common/ReviewCard';
import { VendorReview } from '@/types/extraTypes';


const VendorPorfolio = () => {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [reviews, setReviews] = useState<VendorReview[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
    const [selectedService, setSelectedService] = useState<ServiceProvided>(ServiceProvided.Engagement)
    const [packages, setPackages] = useState([]);
    const [vendor, setVendor] = useState<VendorData | null>(null)
    const POSTS_PER_PAGE = 3
    const { vendorId } = useParams()


    useEffect(() => {
        fetchPosts()
    }, [vendorId])

    const fetchPosts = async () => {
        setIsLoading(true)
        try {
            const response = await axiosInstance.get(`/portfolio/${vendorId}`)
            console.log(response.data.data);
            
            const publishedPosts = response.data.data.post.filter(
                (post: PostData) => post.status === PostStatus.Published
            )

            if (Array.isArray(publishedPosts)) {
                setPosts(publishedPosts)
            } else {
                console.error('Published posts is not an array:', publishedPosts)
            }

            if (Array.isArray(response.data.data.package)) {
                setPackages(response.data.data.package);
            }
            if (Array.isArray(response.data.data.review)) {
                setReviews(response.data.data.review);
            }
            if (response.data.data.vendor) {
                setVendor(response.data.data.vendor);
            }            

        } catch (error) {
            console.error('Error fetching posts:', error)
            if (error instanceof AxiosError) {
                showToastMessage(error.response?.data.message, 'error')
            } else {
                showToastMessage('failed to load post', 'error')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const filteredPosts = posts.filter(post => post.serviceType === selectedService);
    const totalFilteredPosts = filteredPosts.length;
    const totalPages = Math.max(1, Math.ceil(totalFilteredPosts / POSTS_PER_PAGE));
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const currentPosts = filteredPosts.slice(startIndex, endIndex);


    const handleServiceChange = (service: ServiceProvided) => {
        setSelectedService(service)
        setCurrentPage(1)
    }


    const handleShowDetails = (post: PostData) => {
        setSelectedPost(post);
        setModalOpen(true);
    };

    return (
        <>
            <UserNavbar />
            {vendor && <VendorDetails isVendor={false} vendorDetails={vendor} />}

            <Servicepackage packages={packages} />
            <div className="max-w-7xl mx-auto px-4 py-10">
                <h1 className="text-4xl font-light tracking-[0.3em] text-[#B8860B] text-center mb-12 uppercase">
                    My Collections
                </h1>

                <div className="flex space-x-12 mb-8 justify-center overflow-x-auto pb-2">
                    {Object.values(ServiceProvided).map((service) => (
                        <Button
                            key={service}
                            onClick={() => handleServiceChange(service)}
                            className={`px-6 py-2 rounded-full whitespace-nowrap ${selectedService === service
                                ? 'bg-black text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {service}
                        </Button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                    </div>
                ) : currentPosts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600">No posts found for {selectedService}</p>
                        <p className="text-gray-500 mt-2">Check back later for updates</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentPosts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onShowDetails={handleShowDetails}
                            />
                        ))}
                    </div>
                )}

                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <Pagination
                            total={totalPages}
                            initialPage={1}
                            page={currentPage}
                            onChange={setCurrentPage}
                            showControls
                            color='default'
                        />
                    </div>
                )}
            </div>
            <VendorReviews vendorId={`${vendorId}`} reviews={reviews}/>
            <PostModal
                post={selectedPost}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            />
            <Footer />
        </>
    )
}

export default VendorPorfolio