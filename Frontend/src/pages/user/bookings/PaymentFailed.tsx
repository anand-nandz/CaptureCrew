import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentFailed = () => {
  return (
    <div className="bg-gradient-to-br from-black to-red-900 min-h-screen flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto transform transition-all animate-fadeIn">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-red-50 animate-pulse" />
          </div>
          <XCircle className="h-24 w-24 text-red-500 mx-auto relative" />
        </div>

        <div className="text-center mt-8 space-y-4">
          <h3 className="text-2xl font-bold text-gray-800">
            Payment Failed
          </h3>
          
          <div className="space-y-2">
            <p className="text-gray-600">
              We were unable to process your payment. Please try again or contact support.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            <Link 
              to="/bookings" 
              className="w-full flex items-center justify-center gap-2 bg-red-950 hover:bg-red-800 text-white font-medium py-3 px-4 rounded-xl transition duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              Retry Payment
            </Link>

            <Link 
              to="/" 
              className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-xl transition duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-gray-500 text-sm">
            Need assistance? Contact our support at capturecrew.connect@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;