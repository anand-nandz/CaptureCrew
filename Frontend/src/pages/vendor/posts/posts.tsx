












import { useCallback, useEffect, useState } from "react"
import { Badge } from "@material-tailwind/react"
import { Button, Modal, ModalBody, ModalContent, ModalHeader, Pagination } from "@nextui-org/react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTrash, faMapMarkerAlt, faHeart, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import SidebarVendor from "../../../layout/vendor/SidebarProfileVendor"
import { axiosInstanceVendor } from "../../../config/api/axiosInstance"
import { showToastMessage } from "../../../validations/common/toast"
import { VENDOR } from "../../../config/constants/constants"
import { PostData, PostStatus, ServiceProvided } from "../../../types/postTypes"
import CreatePost from "./createPost"

export default function EnhancedPosts() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceProvided>(ServiceProvided.Engagement)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})
  const [selectedPostForEdit, setSelectedPostForEdit] = useState<PostData | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const POSTS_PER_PAGE = 2

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('vendorToken')
      const response = await axiosInstanceVendor.get('/posts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log(response.data.data.posts);

      const publishedPosts = response.data.data.posts

      if (Array.isArray(publishedPosts)) {
        setPosts(publishedPosts)
        publishedPosts.forEach(post => {
          console.log('Post service type:', post.serviceType)
        })
      } else {
        console.error('Published posts is not an array:', publishedPosts)
      }

    } catch (error) {
      console.error("Error fetching posts:", error)
      if (error instanceof Error) {
        showToastMessage(error.message || 'Failed to fetch posts', 'error')
      } else {
        showToastMessage('An unknown error occurred', 'error')
      }
      navigate(VENDOR.LOGIN)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => post.serviceType === selectedService)

  const totalPosts = filteredPosts.length
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE))
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const currentPosts = filteredPosts.slice(startIndex, endIndex)


  const handleServiceChange = (service: ServiceProvided) => {
    setSelectedService(service)
    setCurrentPage(1)
  }
  const handleEditClick = (post: PostData) => {
    setSelectedPostForEdit(post);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedPostForEdit(null);
    setIsEditModalOpen(false);
  };


  useEffect(() => {
    const imageIntervals: { [key: string]: NodeJS.Timeout } = {}
    posts.forEach(post => {
      if (Array.isArray(post.imageUrl)) {
        imageIntervals[post._id] = setInterval(() => {
          setCurrentImageIndex(prev => ({
            ...prev,
            [post._id]: ((prev[post._id] || 0) + 1) % post.imageUrl!.length
          }))
        }, 3000)
      }
    })
    return () => {
      Object.values(imageIntervals).forEach(clearInterval)
    }
  }, [posts])

  const handleAddClick = () => {
    navigate('/vendor/add-post')
  }

  const handleLike = useCallback((postId: string) => {
    console.log(`Liked post: ${postId}`)
  }, [])

  const toggleExpandPost = useCallback((postId: string) => {
    setExpandedPost(prev => prev === postId ? null : postId)
  }, [])

  const getStatusColor = (status?: PostStatus) => {
    switch (status) {
      case PostStatus.Published:
        return "green"
      case PostStatus.Draft:
        return "blue"
      case PostStatus.Archived:
        return "gray"
      case PostStatus.Blocked:
        return "red"
      default:
        return "blue"
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="shadow-xl">
        <SidebarVendor />
      </div>
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center">Your Posts</h1>
          <Button
            onClick={handleAddClick}
            className="bg-black text-white hover:bg-gray-800"
          >
            Upload New Post
          </Button>
        </div>

        <div className="flex space-x-12 mb-8 justify-center overflow-x-auto pb-2 ">
          {Object.values(ServiceProvided).map((service) => (
            <Button
              key={service}
              onClick={() => handleServiceChange(service)}
              className={`px-6 py-2 rounded-full whitespace-nowrap md:space-x-3 md:text-xs ${selectedService === service
                ? 'bg-black text-white md:text-xs sm:text-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 md:text-xs sm:text-xs'
                }`}
            >
              {service}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : currentPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No posts found for {selectedService}</p>
            <p className="text-gray-500 my-3">Check back later for updates</p>
            <Button
              onClick={handleAddClick}
              className="bg-black text-white hover:bg-gray-800"
            >
              Upload New Post
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {currentPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden mb-6"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 relative">
                    <motion.img
                      key={currentImageIndex[post._id]}
                      src={Array.isArray(post.imageUrl) ? post.imageUrl[currentImageIndex[post._id] || 0] : post.imageUrl}
                      alt="Post image"
                      className="w-full h-64 object-cover animate-slideIn"

                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"

                        className="bg-white bg-opacity-75 hover:bg-opacity-100"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge color={getStatusColor(post.status)} className="mb-2">
                          {post.status}
                        </Badge>
                        <h2 className="text-xl font-bold text-gray-800">{post.serviceType}</h2>
                      </div>
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        onClick={() => { handleLike(post._id) }}
                      >
                        <FontAwesomeIcon icon={faHeart} />
                      </Button>
                    </div>
                    <p className="text-gray-600 mb-4">{post.caption}</p>
                    {post.location && (
                      <div className="flex items-center text-gray-500 mb-4">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                        <span>{post.location}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Likes: {post.likesCount || 0}
                      </span>
                      {post.status !== PostStatus.Blocked ?
                        (<Button
                          onClick={() => handleEditClick(post)}
                        >
                          Edit Details
                        </Button>
                        ) : (
                          <div></div>
                        )

                      }


                      <Button
                        color="default"
                        variant="light"
                        onClick={() => toggleExpandPost(post._id)}
                        endContent={
                          <FontAwesomeIcon
                            icon={expandedPost === post._id ? faChevronUp : faChevronDown}
                          />
                        }
                      >
                        {expandedPost === post._id ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                  </div>
                </div>
                {expandedPost === post._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 border-t border-gray-200 bg-gray-50"
                  >
                    <div className="flex overflow-x-auto space-x-4 pb-4">
                      {Array.isArray(post.imageUrl) ? (
                        post.imageUrl.map((img, index) => (
                          <img
                            key={index}
                            src={img}
                            alt={`Post image ${index + 1}`}
                            className="w-40 h-40 object-cover rounded-lg shadow-md flex-shrink-0"
                          />
                        ))
                      ) : (
                        <img
                          src={post.imageUrl}
                          alt="Post image"
                          className="w-40 h-40 object-cover rounded-lg shadow-md"
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>

            ))}


          </AnimatePresence>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              total={totalPages}
              initialPage={1}
              page={currentPage}
              onChange={setCurrentPage}
              showControls
              color="primary"
            />
          </div>
        )}

        <Modal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          size="xl"
         
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="bg-black text-white">
                  Edit Post
                </ModalHeader>
                <ModalBody>
                  <CreatePost
                    isEditMode={true}
                    existingPost={selectedPostForEdit}
                    onClose={onClose}
                  />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>

      </main>
    </div>

  )
}

