import { useRef } from "react";
import { Button } from "@nextui-org/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ServiceTabsProps {
  services: string[];
  selectedService: string;
  onServiceChange: (service: string) => void;
  className?: string;
}

export const ServiceTabs = ({
  services,
  selectedService,
  onServiceChange,
  className = "",
}: ServiceTabsProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 200;
      const maxScroll = container.scrollWidth - container.clientWidth;

      const newScrollPosition =
        direction === "left"
          ? Math.max(0, container.scrollLeft - scrollAmount)
          : Math.min(maxScroll, container.scrollLeft + scrollAmount);

      container.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={`relative max-w-6xl mx-auto px-4 my-4 ${className}`}>
      {/* Left Scroll Button */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          isIconOnly
          variant="light"
          className="bg-white/80 backdrop-blur-sm shadow-md h-8 w-8"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex space-x-3 overflow-x-auto scrollbar-hide scroll-smooth py-3 px-8 snap-x w-full"
      >
        {services.map((service) => (
          <Button
            key={service}
            onClick={() => onServiceChange(service)}
            className={`px-4 sm:px-6 py-2 rounded-full whitespace-nowrap ${
              selectedService === service
                ? "bg-black text-white"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {service.split(' ')[0]}
          </Button>
        ))}
      </div>

      {/* Right Scroll Button */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <Button
          isIconOnly
          variant="light"
          className="bg-white/80 backdrop-blur-sm shadow-md h-8 w-8"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
