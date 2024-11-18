
import { motion } from 'framer-motion'
import { Card, CardBody, CardFooter } from '@nextui-org/react'
import { PackageData } from '../../types/packageTypes';

interface ServicePackageProps {
  packages: PackageData[];
}

export default function Servicepackage({ packages }: ServicePackageProps) {

  if (!packages || packages.length === 0) {
    return (
      <div className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl text-center font-light tracking-[0.2em] text-[#B8860B] mb-8">
              SERVICE PACKAGES
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <p className="text-2xl text-gray-600 font-light mb-4">No Packages Available</p>
              <p className="text-gray-500">The vendor hasn't added any service packages yet.</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 px-4">
      <div className="max-w-6xl mx-auto">

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl text-center font-light tracking-[0.2em] text-[#B8860B] mb-20" >
            SERVICE PACKAGES
          </h1>
         
        </motion.h1>

        <div className="max-w-9xl mx-auto grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4 md:gap-4">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.serviceType}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.2,
                ease: [0.25, 0.25, 0, 1]
              }}
              className="flex"
            >
              <Card className="border border-gray-200 bg-white hover:shadow-lg max-w-96transition-shadow duration-300">
                
                <CardBody className="gap-4 px-6 pt-8 pb-4 text-center">
                  <h3 className="font-serif italic text-2xl mb-2">{pkg.serviceType}</h3>
                  <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                  <div className="w-16 h-px bg-gray-300 mx-auto mb-6"></div>
                  {pkg.features.map((feature, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: (index * 0.2) + (i * 0.1)
                      }}
                      className="text-sm text-gray-700"
                    >
                      {feature}
                    </motion.p>
                  ))}
                </CardBody>
                <CardFooter className="flex flex-col gap-2 px-6 pb-8 pt-4">
                  <div className="w-full text-center">
                    <p className="text-sm uppercase tracking-wider text-gray-500 mb-2">Starting at</p>
                    <p className="text-3xl font-light tracking-wide text-[#333]">{pkg.price}</p>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}