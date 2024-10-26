
import { Typography } from "@material-tailwind/react";
import { Camera, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
 
const LINKS = [
  {
    title: "Services",
    items: ["Photography", "Videography", "Event Coverage", "Workshops"],
  },
  {
    title: "Company",
    items: ["About Us", "Our Team", "Portfolio", "Testimonials"],
  },
  {
    title: "Resources",
    items: ["Booking", "Pricing", "FAQs", "Contact"],
  },
];
 
const currentYear = new Date().getFullYear();
 
export default function Footer() {
  return (
    <footer className="relative w-full bg-gray-300">
      <div className="mx-auto w-full max-w-7xl px-8 py-12">
        <div className="grid grid-cols-1 justify-between gap-4 md:grid-cols-2">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-blue-500" />
              <Typography variant="h5" className="font-bold text-gray-900" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                Capture Crew
              </Typography>
            </div>
            <Typography className="mt-4 text-gray-600" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
              Capturing your precious moments with creativity and precision.
            </Typography>
          </div>
          <div className="grid grid-cols-3 justify-between gap-4">
            {LINKS.map(({ title, items }) => (
              <ul key={title}>
                <Typography
                  variant="small"
                  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                  className="mb-3 font-medium text-gray-900"
                >
                  {title}
                </Typography>
                {items.map((link) => (
                  <li key={link}>
                    <Typography
                      as="a"
                      href="#"
                      placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
                      className="py-1.5 font-normal text-gray-600 transition-colors hover:text-blue-500"
                    >
                      {link}
                    </Typography>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <div className="mt-12 flex w-full flex-col items-center justify-center border-t border-gray-200 py-4 md:flex-row md:justify-between">
          <Typography
            variant="small"
            placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
            className="mb-4 text-center font-normal text-gray-600 md:mb-0"
          >
            &copy; {currentYear} <span className="font-medium">Capture Crew</span>. All
            Rights Reserved.
          </Typography>
          <div className="flex gap-4 text-gray-600">
            <a href="#" className="opacity-80 transition-opacity hover:opacity-100">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="opacity-80 transition-opacity hover:opacity-100">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="opacity-80 transition-opacity hover:opacity-100">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="opacity-80 transition-opacity hover:opacity-100">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}