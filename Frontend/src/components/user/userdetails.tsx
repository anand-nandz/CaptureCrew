
import { Star, StarHalf } from 'lucide-react'

export default function Component() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      
      <main>
        {/* About Us Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-8">
              <div className="w-full md:w-1/2">
                <img
                  src="/images/p1.webp?height=300&width=300"
                  alt="Founder"
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                />
              </div>
              <div className="w-full md:w-1/2 text-center md:text-left my-5 mx-3">
                <h2 className="text-3xl font-bold mb-4">About us</h2>
                <p className="mb-4 text-gray-600">
                  Life can be crazy, shy, silly, glowing, sensual, teasing, flirting, quiet or playful and we are passionate about
                  documenting spontaneous mood in an editorially style, while carefully creating authentic images that matter.
                  We want to take pictures of you the way you are.Life can be crazy, shy, silly, glowing, sensual, teasing, flirting, quiet or playful and we are passionate about
                  documenting spontaneous mood in an editorially style, while carefully creating authentic images that matter.
                  We want to take pictures of you the way you are.
                </p>
                <p className="font-semibold mb-1">Pranav</p>
                <p className="text-sm text-gray-500 mb-4">FOUNDER</p>
                <div className="flex justify-center md:justify-start mb-4">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <Star className="w-5 h-5 text-yellow-400" />
                  <StarHalf className="w-5 h-5 text-yellow-400" />
                </div>
                <button className="bg-red-800 text-white px-6 py-2 rounded-full hover:bg-red-700 transition duration-300">
                  Message Us
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}