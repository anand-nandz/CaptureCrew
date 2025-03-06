import React, { useEffect, useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faTimes, faChevronLeft, faChevronRight, faStar, faUser } from '@fortawesome/free-solid-svg-icons';
import {
    faEnvelope,
    faPhone,
} from '@fortawesome/free-solid-svg-icons';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { PostModalProps } from '../../types/postTypes';

export const PostModal = React.memo(({ post, isOpen, onClose }: PostModalProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    useEffect(() => {
        if (!isOpen) {
            setCurrentImageIndex(0);
        }
    }, [isOpen, post]);

    if (!post || !isOpen) return null;

    const images = Array.isArray(post.imageUrl) ? post.imageUrl : [post.imageUrl];

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleClose = () => {
        setCurrentImageIndex(0);
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onClose={handleClose}
            className="flex items-center justify-center"
        >
            <Box className="relative bg-white dark:bg-gray-900 w-full max-w-5xl mx-4 rounded-lg overflow-hidden flex flex-col md:flex-row md:h-[80vh]">
                <div className="relative w-full h-full">
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

                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-20">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-[50%] flex flex-col h-full">
                    <div className="p-4 border-b flex items-center justify-between">
                        <h2 className="text-xl font-semibold">{post.serviceType}</h2>
                        <IconButton
                            onClick={onClose}
                            className="hidden md:flex"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </IconButton>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 space-y-4">
                            <div className="flex items-center space-x-2">
                                {post.location && (
                                    <div className="flex items-center text-gray-500">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                                        <span>{post.location}</span>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-600">{post.caption}</p>

                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold mb-3">Vendor Information</h3>
                                {post?.vendor?.name && (
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                                        <span>{post?.vendor?.name}</span>
                                    </div>
                                )}
                                {post?.vendor?.email && (
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                                        <span>{post?.vendor?.email}</span>
                                    </div>
                                )}
                                {post?.vendor?.contactinfo && (
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <FontAwesomeIcon icon={faPhone} className="mr-2" />
                                        <span>{post?.vendor?.contactinfo}</span>
                                    </div>
                                )}
                                {post?.vendor?.city && (
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                        <span>{post?.vendor?.city}</span>
                                    </div>
                                )}
                                 <div className="flex items-center">
                                    <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-2" />
                                    <span className="font-semibold">
                                        Rating: {post?.vendor?.totalRating?.toFixed(1) || '0.0'}
                                    </span>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    );
});