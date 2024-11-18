import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faHeart, faChevronUp, faExpand } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@nextui-org/react';
import { PostCardProps } from '../../types/postTypes';

export const PostCard = ({ post, onShowDetails }: PostCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{post.serviceType}</h2>
                </div>
            </div>

            <div
                className="relative aspect-square cursor-pointer group"
                onClick={() => onShowDetails(post)}
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
                        startContent={<FontAwesomeIcon icon={faHeart} />}
                    >
                        {post.likesCount || 0}
                    </Button>
                    <Button
                        variant="light"
                        onClick={() => onShowDetails(post)}
                        endContent={<FontAwesomeIcon icon={faChevronUp} />}
                    >
                        Show Details
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};