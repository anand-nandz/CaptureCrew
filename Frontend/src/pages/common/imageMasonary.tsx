"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardBody, Button, Image, Modal, ModalContent, ModalBody, useDisclosure, Chip } from "@nextui-org/react"
import { Maximize2, Grid, Columns } from "lucide-react"
import { IVendorDetails } from "@/types/vendorTypes"

interface GroupedImage {
  imageUrl: string
  caption: string
}

type GroupedPosts = {
  [key: string]: GroupedImage[]
}

interface ImageGalleryProps {
  vendorDetails: IVendorDetails
}

type ViewMode = "grid" | "masonry"

const ImageGallery: React.FC<ImageGalleryProps> = ({ vendorDetails }) => {

  const [activeService, setActiveService] = useState<string>("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [fullscreenImage, setFullscreenImage] = useState<string>("")

  // Modified to safely handle undefined imageUrl and convert single string to array
  const groupedPosts = vendorDetails.posts.reduce<GroupedPosts>((acc, post) => {
    if (!acc[post.serviceType]) {
      acc[post.serviceType] = []
    }
    
    // Skip if imageUrl is undefined
    if (!post.imageUrl) return acc;
    
    // Handle both string and string[] cases
    const imageUrls = Array.isArray(post.imageUrl) 
      ? post.imageUrl 
      : [post.imageUrl];
    
    imageUrls.forEach((img) => {
      acc[post.serviceType].push({
        imageUrl: img,
        caption: post.caption,
      })
    })
    
    return acc;
  }, {})

  useEffect(() => {
    if (!activeService && Object.keys(groupedPosts).length > 0) {
      setActiveService(Object.keys(groupedPosts)[0])
    }
  }, [groupedPosts, activeService])

  const currentImages = activeService ? groupedPosts[activeService] : []

  const openFullscreen = (imageUrl: string) => {
    setFullscreenImage(imageUrl)
    onOpen()
  }

  const getImageUrl = (imageUrl: string) => {
    return imageUrl.startsWith("http")
      ? imageUrl
      : `https://capturecrew.s3.ap-south-1.amazonaws.com/captureCrew/vendor/post/${imageUrl}`
  }

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {currentImages.map((image, index) => (
        <Card key={index} isPressable onPress={() => openFullscreen(image.imageUrl)} className="overflow-hidden">
          <CardBody className="p-0 aspect-square">
            <Image
              src={getImageUrl(image.imageUrl) || "/placeholder.svg"}
              alt={`${activeService} image ${index + 1}`}
              classNames={{
                img: "w-full h-full object-cover",
              }}
            />
          </CardBody>
        </Card>
      ))}
    </div>
  )

  const renderMasonryView = () => (
    <div className="columns-2 md:columns-4 lg:columns-4 gap-4 space-y-4">
      {currentImages.map((image, index) => (
        <div
          key={index}
          className="break-inside-avoid mb-4 cursor-pointer"
          onClick={() => openFullscreen(image.imageUrl)}
        >
          <Card className="overflow-hidden h-full">
            <CardBody className="p-0 h-full flex flex-col">
              <div className="relative flex-grow">
                <Image
                  src={getImageUrl(image.imageUrl) || "/placeholder.svg"}
                  alt={`${activeService} image ${index + 1}`}
                  classNames={{
                    img: "w-full h-full object-cover",
                  }}
                />
              </div>
              {image.caption && (
                <div className="p-2 bg-default-50 w-full">
                  <p className="text-sm line-clamp-2">{image.caption}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      ))}
    </div>
  )

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">{vendorDetails.vendor.companyName} Gallery</h2>

        <div className="flex gap-2">
          <Button
            isIconOnly
            variant={viewMode === "grid" ? "solid" : "flat"}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            size="sm"
          >
            <Grid size={18} />
          </Button>
          <Button
            isIconOnly
            variant={viewMode === "masonry" ? "solid" : "flat"}
            onClick={() => setViewMode("masonry")}
            aria-label="Masonry view"
            size="sm"
          >
            <Columns size={18} />
          </Button>
        </div>
      </div>

      {/* Service Type Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {Object.keys(groupedPosts).map((serviceType) => (
          <Chip
            key={serviceType}
            color="default"
            variant={activeService === serviceType ? "solid" : "bordered"}
            radius="full"
            onClick={() => {
              setActiveService(serviceType)
            }}
            className="cursor-pointer"
          >
            {serviceType}
          </Chip>
        ))}
      </div>

      {activeService && currentImages.length > 0 ? (
        <>
          {viewMode === "grid" && renderGridView()}
          {viewMode === "masonry" && renderMasonryView()}
        </>
      ) : (
        <Card className="w-full">
          <CardBody>
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No posts found</p>
              <p className="text-gray-500 mt-2">Add new Posts</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Fullscreen Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="full"
        hideCloseButton
        classNames={{
          backdrop: "bg-black/90",
        }}
      >
        <ModalContent>
          <ModalBody className="p-0 flex items-center justify-center min-h-screen">
            <Button
              isIconOnly
              onClick={onClose}
              className="absolute top-4 right-4 z-50 bg-black/50 text-white"
              radius="full"
              variant="flat"
            >
              <Maximize2 size={24} />
            </Button>

            <div className="max-h-screen max-w-screen-lg mx-auto">
              <Image
                src={getImageUrl(fullscreenImage) || "/placeholder.svg"}
                alt="Fullscreen image"
                classNames={{
                  img: "max-h-screen object-contain",
                }}
              />
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default ImageGallery