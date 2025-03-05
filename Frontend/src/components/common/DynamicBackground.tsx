import { ExtendedDynamicBackgroundProps } from "@/types/extraTypes"


const DynamicBackground = ({ 
  filepath, 
  type = 'video',
  height = 'h-full',
  width = 'w-full',
  imageData = null,
  className = '',
  text,
  textClassName="text-3xl font-bold  rounded px-6 py-3",
  children
}: ExtendedDynamicBackgroundProps) => {
  const baseClasses = `relative object-cover ${height} ${width} ${className}`

  return (
    <div className={`relative ${width} ${height}`}>
      {type === 'image' ? (
        <img
          src={imageData || filepath}
          alt="Background"
          className={baseClasses}
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          className={baseClasses}
        >
          <source src={filepath} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      
      {(text || children) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-center text-white p-4 ${textClassName}`}>
            {text && <p>{text}</p>}
            {children}
          </div>
        </div>
      )}
    </div>
  )
  }
  
  export default DynamicBackground