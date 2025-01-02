
import { useState, useEffect } from 'react'
import { Button, Pagination } from '@nextui-org/react'
import { PostData, ServiceProvided, PostStatus } from '../../types/postTypes'
import { axiosInstance } from '../../config/api/axiosInstance'
import { PostCard } from './PostCard'
import { PostModal } from './PostModal'


export default function ShowAllPosts() {
    const [allPosts, setAllPosts] = useState<PostData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedService, setSelectedService] = useState<ServiceProvided>(ServiceProvided.Engagement)
    const [currentPage, setCurrentPage] = useState(1)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedPost, setSelectedPost] = useState<PostData | null>(null)

    const POSTS_PER_PAGE = 3

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('userToken')
            const response = await axiosInstance.get('/viewposts', {
                headers: { Authorization: `Bearer ${token}` },
            })

            const publishedPosts = response.data.data.posts.filter(
                (post : PostData) => post.status === PostStatus.Published
            )


            if (Array.isArray(publishedPosts)) {
                setAllPosts(publishedPosts)
                // publishedPosts.forEach(post => {
                //     console.log('Post service type:', post.serviceType)
                // })
            } else {
                console.error('Published posts is not an array:', publishedPosts)
            }
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setIsLoading(false)
        }
    }

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
        setModalOpen(true)
    }

    

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-light tracking-[0.3em] text-[#B8860B] text-center mb-12 uppercase">
                    All Posts
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
                <PostModal
                    post={selectedPost}
                    isOpen= {modalOpen}
                    onClose={()=>setModalOpen(false)}
                />
        </div>
    )
}