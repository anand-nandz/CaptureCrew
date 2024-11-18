import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';


interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const location = useLocation();
  
  const errorGot = useRouteError();
  let errorMessage = error?.message || 'Something went wrong. Please try again later.';

  if (isRouteErrorResponse(errorGot)) {
    if (errorGot.status === 404) {
      errorMessage = 'Page not found (404). Please check the URL.';
    } else if (errorGot.status === 500) {
      errorMessage = 'Internal Server Error (500). Please try again later.';
    }else{
      errorMessage = errorGot.statusText;

    }
 }
  
  let errorTitle = 'Oops!';
  let errorImage = "/images/error.jpg"; 

  if (location.pathname !== '/' && !error) {
    errorTitle = '404 - Not Found';
    errorMessage = `The page "${location.pathname}" doesn't exist.`;
    errorImage = "/images/error404.jpg";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8 text-center">
        <img 
          src={errorImage} 
          alt="Error Illustration" 
          className="w-64 h-64 mx-auto mb-8"
        />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{errorTitle}</h1>
        <p className="text-gray-600 mb-8">{errorMessage}</p>
        <div className="flex justify-center space-x-4">
          <Link 
            to="/" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go Home
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;







// import React from 'react';
// import { useRouteError, isRouteErrorResponse, Link, useLocation } from 'react-router-dom';

// const ErrorBoundary: React.FC = () => {
//   const error = useRouteError();
//   const location = useLocation();
  
//   let errorMessage = 'Something went wrong. Please try again later.';
//   let errorTitle = 'Oops!';
//   let errorImage = "/images/error.jpg"; 

//   if (isRouteErrorResponse(error)) {
//     if (error.status === 404) {
//       errorTitle = '404 - Not Found';
//       errorMessage = `The page you're looking for doesn't exist.`;
//       errorImage = "/images/error404.jpg"; 
//     } else if (error.status === 500) {
//       errorTitle = '500 - Server Error';
//       errorMessage = 'Internal Server Error. Please try again later.';
//     } else {
//       errorMessage = error.statusText || errorMessage;
//     }
//   } else if (error instanceof Error) {
//     errorMessage = error.message;
//   } else if (location.pathname !== '/') {
//     // This handles the case when no route matches (404)
//     errorTitle = '404 - Not Found';
//     errorMessage = `The page "${location.pathname}" doesn't exist.`;
//     errorImage = "/images/error404.jpg";
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
//       <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8 text-center">
//         <img 
//           src={errorImage} 
//           alt="Error Illustration" 
//           className="w-64 h-64 mx-auto mb-8"
//         />
//         <h1 className="text-2xl font-bold text-gray-800 mb-2">{errorTitle}</h1>
//         <p className="text-gray-600 mb-8">{errorMessage}</p>
//         <div className="flex justify-center space-x-4">
//           <Link 
//             to="/" 
//             className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
//           >
//             Go Home
//           </Link>
//           <button 
//             onClick={() => window.history.back()} 
//             className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ErrorBoundary;