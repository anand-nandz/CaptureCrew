import React, { useState } from 'react';
import { Card, CardBody, Button, Image } from "@nextui-org/react";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Post {
  serviceType: string;
  imageUrl: string[];
  caption: string;
}

interface VendorData {
  companyName: string;
  posts: Post[];
}

interface GroupedImage {
  imageUrl: string;
  caption: string;
}

type GroupedPosts = {
  [key: string]: GroupedImage[];
};

interface ImageCarouselProps {
  vendorData: VendorData;
}

const ImageMasonry: React.FC<ImageCarouselProps> = ({ vendorData }) => {
  const [activeService, setActiveService] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const groupedPosts = vendorData.posts.reduce<GroupedPosts>((acc, post) => {
    if (!acc[post.serviceType]) {
      acc[post.serviceType] = [];
    }
    post.imageUrl.forEach((img) => {
      acc[post.serviceType].push({
        imageUrl: img,
        caption: post.caption,
      });
    });
    return acc;
  }, {});

  React.useEffect(() => {
    if (!activeService && Object.keys(groupedPosts).length > 0) {
      setActiveService(Object.keys(groupedPosts)[0]);
    }
  }, [groupedPosts, activeService]);

  const currentImages = activeService ? groupedPosts[activeService] : [];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === currentImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? currentImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        {vendorData.companyName} Gallery
      </h2>

      {/* Service Type Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {Object.keys(groupedPosts).map((serviceType) => (
          <Button
            key={serviceType}
            color={activeService === serviceType ? "default" : "default"}
            variant={activeService === serviceType ? "solid" : "bordered"}
            radius="full"
            onClick={() => {
              setActiveService(serviceType);
              setCurrentIndex(0);
            }}
          >
            {serviceType}
          </Button>
        ))}
      </div>

      {activeService && currentImages.length > 0 ? (
        <>
          {/* Carousel */}
          <Card className="w-full">
            <CardBody className="p-0 aspect-[4/3] relative overflow-hidden">
              <Image
                src={currentImages[currentIndex].imageUrl.startsWith('http')
                  ? currentImages[currentIndex].imageUrl
                  : `https://capturecrew.s3.ap-south-1.amazonaws.com/captureCrew/vendor/post/${currentImages[currentIndex].imageUrl}`
                }
                alt={`${activeService} image ${currentIndex + 1}`}
                classNames={{
                  img: "w-full h-full object-cover align-"
                }}
              />

              {/* Navigation Buttons */}
              <Button
                isIconOnly
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/75 z-30"
                radius="full"
                variant="flat"
              >
                <ChevronLeft size={24} />
              </Button>
              <Button
                isIconOnly
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/75 z-30"
                radius="full"
                variant="flat"
              >
                <ChevronRight size={24} />
              </Button>
            </CardBody>
          </Card>

          {/* Thumbnail Navigation */}
          <div className="mt-4 grid grid-cols-5 gap-2">
            {currentImages.map((image, index) => (
              <Button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`p-0 min-w-0 h-20 ${
                  currentIndex === index ? 'ring-2 ring-black' : ''
                }`}
                variant="flat"
              >
                <Image
                  src={image.imageUrl.startsWith('http')
                    ? image.imageUrl
                    : `https://capturecrew.s3.ap-south-1.amazonaws.com/captureCrew/vendor/post/${image.imageUrl}`
                  }
                  alt={`Thumbnail ${index + 1}`}
                  classNames={{
                    img: "w-full h-full object-cover"
                  }}
                />
              </Button>
            ))}
          </div>
        </>
      ) : (
        <Card className="w-full">
          <CardBody>
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No posts found </p>
              <p className="text-gray-500 mt-2">Add new Posts</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ImageMasonry;