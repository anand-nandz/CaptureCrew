
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapMarkerAlt, faHeart, faChevronUp, faTimes, faExpand, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { Button, Pagination } from '@nextui-org/react'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { PostData, PostStatus, ServiceProvided } from '../../../types/postTypes'
import { axiosInstanceAdmin } from '../../../config/api/axiosInstance'
import { Switch } from '@material-tailwind/react'
import Swal from 'sweetalert2'
import { showToastMessage } from '../../../validations/common/toast'
import { FlagIcon } from 'lucide-react'
import { ServiceTabs } from '@/components/common/ServiceTabs'

export default function PostListingAdmin() {
    const [allPosts, setAllPosts] = useState<PostData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedService, setSelectedService] = useState<ServiceProvided>(ServiceProvided.Engagement)
    const [currentPage, setCurrentPage] = useState(1)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedPost, setSelectedPost] = useState<PostData | null>(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const POSTS_PER_PAGE = 3

    const fetchPosts = useCallback(async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('adminToken')
            const response = await axiosInstanceAdmin.get('/view-all-posts', {

                headers: { Authorization: `Bearer ${token}` }
            })

            const publishedPosts = response.data.data.posts.filter(
                (post: PostData) => post.status === PostStatus.Published || PostStatus.Blocked
            )

            if (Array.isArray(publishedPosts)) {
                setAllPosts(publishedPosts)
            } else {
                console.error('Published posts is not an array:', publishedPosts)
            }
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const filteredPosts = allPosts.filter(post => post.serviceType === selectedService)

    const totalPosts = filteredPosts.length
    const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE))
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE
    const endIndex = startIndex + POSTS_PER_PAGE
    const currentPosts = filteredPosts.slice(startIndex, endIndex)

    const handleServiceChange = (service: ServiceProvided) => {
        setSelectedService(service)
        setCurrentPage(1)
    }

    const handleShowDetails = (post: PostData) => {
        setSelectedPost(post)
        setCurrentImageIndex(0)
        setModalOpen(true)
    }

    const nextImage = () => {
        if (selectedPost && Array.isArray(selectedPost.imageUrl)) {
            setCurrentImageIndex((prev) =>
                prev === selectedPost.imageUrl!.length - 1 ? 0 : prev + 1
            )
        }
    }

    const prevImage = () => {
        if (selectedPost && Array.isArray(selectedPost.imageUrl)) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? selectedPost.imageUrl!.length - 1 : prev - 1
            )
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])


    const handleBlockUnblock = async (postId: string, currentStatus: PostStatus) => {
        const isCurrentlyBlocked = currentStatus === PostStatus.Blocked;
        const action = isCurrentlyBlocked ? 'unblock' : 'block';
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `Do you want to ${action} this post?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: currentStatus ? '#d33' : '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Yes, ${action} post!`
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosInstanceAdmin.patch(`/blockp-unblockp?postId=${postId}`);
                setAllPosts(prevPosts =>
                    prevPosts.map(post =>
                        post._id === postId
                            ? {
                                ...post,
                                status: post.status === PostStatus.Blocked
                                    ? PostStatus.Published
                                    : PostStatus.Blocked
                            }
                            : post
                    )
                );

                showToastMessage(response.data.message, 'success');
                Swal.fire(
                    'Success!',
                    response.data.message,
                    'success'
                );

            } catch (error) {
                Swal.fire(
                    'Error',
                    'Failed to update user status',
                    'error'
                );
                console.error('Error while blocking/unblocking post', error);
            }
        }
    };



    const PostModal = () => {
        if (!selectedPost || !modalOpen) return null;

        const images = Array.isArray(selectedPost.imageUrl) ? selectedPost.imageUrl : [selectedPost.imageUrl];

        return (
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                className="flex items-center justify-center"
            >
                <Box className="relative bg-white dark:bg-gray-900 w-full max-w-5xl mx-4 rounded-lg overflow-hidden flex flex-col md:flex-row md:h-[80vh]">

                    <div className="relative w-full h-full ">

                        <div className="relative w-full h-full items-center justify-center">
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
                                        src={images[currentImageIndex]}
                                        alt={`Post image ${currentImageIndex + 1}`}
                                        className="max-w-full max-h-full object-contain"
                                        style={{ width: 'auto', height: 'auto' }}
                                    />
                                </TransformComponent>
                            </TransformWrapper>

                            <div className="absolute inset-0 pointer-events-none">
                                <div className="relative w-full h-full flex items-center justify-between px-7">
                                    <IconButton
                                        onClick={prevImage}
                                        className="pointer-events-auto bg-black/50 text-white hover:bg-black/75 z-20"
                                    >
                                        <FontAwesomeIcon icon={faChevronLeft} className="text-xl text-white" />
                                    </IconButton>

                                    <IconButton
                                        onClick={nextImage}
                                        className="pointer-events-auto bg-black/50 text-white hover:bg-black/75 z-20"
                                    >
                                        <FontAwesomeIcon icon={faChevronRight} className="text-xl text-white" />
                                    </IconButton>
                                </div>
                            </div>

                            {/* Image counter */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side - Details */}
                    <div className="w-full md:w-[50%] flex flex-col h-full">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="text-xl font-semibold">{selectedPost.serviceType}</h2>
                            <IconButton
                                onClick={() => setModalOpen(false)}
                                className="hidden md:flex"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </IconButton>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4 space-y-4">
                                {/* Post Details */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Post Details</h3>
                                    <p className="text-gray-600">{selectedPost.caption}</p>
                                    {selectedPost.location && (
                                        <div className="flex items-center text-gray-500 mt-2">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                                            <span>{selectedPost.location}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Vendor Details */}
                                {selectedPost && selectedPost.vendor && (
                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-semibold mb-3">Vendor Details</h3>
                                        <div className="space-y-2">
                                            <p><span className="font-medium">Name:</span> {selectedPost.vendor.name}</p>
                                            <p><span className="font-medium">Company:</span> {selectedPost.vendor.companyName}</p>
                                            <p><span className="font-medium">City:</span> {selectedPost.vendor.city}</p>
                                            {selectedPost.vendor.contactinfo && (
                                                <p><span className="font-medium">Contact:</span> {selectedPost.vendor.contactinfo}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t">
                                    <Button color="danger" variant="light" startContent={<FontAwesomeIcon icon={faHeart} />}>
                                        {selectedPost.likesCount || 0} likes
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </div>
                </Box>
            </Modal>
        );
    };

    return (
        <div className="min-h-screen ">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-light tracking-[0.3em] text-[#B8860B] text-center mb-12 uppercase">
                    All Posts
                </h1>
                <ServiceTabs
                    services={Object.values(ServiceProvided)}
                    selectedService={selectedService}
                    onServiceChange={(service) => handleServiceChange(service as ServiceProvided)}
                />


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
                        {currentPosts.map((post, index) => (
                            <motion.div
                                key={post._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white rounded-lg shadow-lg overflow-hidden"
                            >
                                <div className="p-4 border-b">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold">{post.serviceType}</h2>
                                        <div className="w-max flex justify-center items-center">
                                            <Switch
                                                id={`switch-${post._id}`}
                                                ripple={false}
                                                color={post.status !== PostStatus.Blocked ? "green" : "red"}
                                                checked={post.status !== PostStatus.Blocked}
                                                onChange={() => {
                                                    if (post.status) {
                                                        handleBlockUnblock(post._id, post.status)
                                                    }
                                                }}
                                                crossOrigin={undefined}
                                                placeholder={undefined}
                                                onPointerEnterCapture={undefined}
                                                onPointerLeaveCapture={undefined}
                                                className={`h-6 w-12 ${post.status !== PostStatus.Blocked ? 'bg-green-500' : 'bg-red-500'}`}
                                                containerProps={{
                                                    className: "relative inline-block w-12 h-6",
                                                }}
                                                circleProps={{
                                                    className: `absolute left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ease-in-out ${post.status !== PostStatus.Blocked ? 'translate-x-6' : ''
                                                        }`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                </div>

                                <div
                                    className="relative aspect-square cursor-pointer group"
                                    onClick={() => handleShowDetails(post)}
                                >
                                    <img
                                        src={Array.isArray(post.imageUrl) ? post.imageUrl[0] : post.imageUrl}
                                        alt="Post"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <FontAwesomeIcon icon={faExpand} className="text-white text-2xl opacity-0 group-hover:opacity-100" />
                                    </div>
                                </div>

                                <div className="p-4">
                                    <p className="text-gray-600 line-clamp-2 mb-4">{post.caption}</p>
                                    {post.location && (
                                        <div className="flex items-center text-gray-500 mb-4">
                                            <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                            <span>{post.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <Button
                                            color="danger"
                                            variant="light"
                                            startContent={<FlagIcon />}
                                        >
                                            {post.reportCount || 0}
                                        </Button>

                                        <Button

                                            variant="light"
                                            onClick={() => handleShowDetails(post)}
                                            endContent={<FontAwesomeIcon icon={faChevronUp} />}
                                        >
                                            Show Details
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
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

            <PostModal />
        </div>
    )
}