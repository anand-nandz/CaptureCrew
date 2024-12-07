import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <div className="bg-gradient-to-br from-black to-cyan-900 min-h-screen flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-auto transform transition-all animate-fadeIn">
        {/* Success Icon with Animation */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-green-50 animate-" />
          </div>
          <CheckCircle className="h-24 w-24 text-green-500 mx-auto relative animate-drip-expand" />
        </div>

        {/* Content */}
        <div className="text-center mt-8 space-y-4">
          <h3 className="text-2xl font-bold text-gray-800">
            Payment Successful!
          </h3>
          
          <div className="space-y-2">
            <p className="text-gray-600">
              Thank you for your payment. Your transaction has been completed.
            </p>
            {/* <p className="text-gray-500 text-sm">
              Transaction ID: #SK2398XJAK
            </p> */}
          </div>

          {/* Amount */}
          {/* <div className="bg-gray-50 rounded-xl p-4 my-6">
            <p className="text-gray-400 text-sm">Amount Paid</p>
            <p className="text-3xl font-bold text-gray-800">$149.99</p>
          </div> */}

          {/* Action Buttons */}
          <div className="space-y-4 mt-8">
            {/* <button className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-black-700 font-medium py-3 px-4 rounded-xl transition duration-300">
              <Download className="h-5 w-5" />
              Download Receipt
            </button> */}

            <Link 
              to="/" 
              className="w-full flex items-center justify-center gap-2 bg-cyan-950 hover:bg-cyan-800 text-white font-medium py-3 px-4 rounded-xl transition duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-center text-gray-500 text-sm">
            Need help? Contact our support at capturecrew.connect@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;