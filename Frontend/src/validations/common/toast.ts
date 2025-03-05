import { toast, ToastOptions } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const toastStyles = `
.Toastify__toast {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
  border: 2px solid #000000;
  border-radius: 4px;
}

.Toastify__toast-icon {
  width: 20px;
  height: 20px;
}

.Toastify__close-button {
  color: #ffffff !important;
  opacity: 0.7;
}

.Toastify__close-button:hover {
  opacity: 1;
}

.Toastify__progress-bar {
  background: #404040 !important;
}

.Toastify__toast--success .Toastify__progress-bar {
  background: #2f855a !important;
}

.Toastify__toast--error .Toastify__progress-bar {
  background: #c53030 !important;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = toastStyles;
document.head.appendChild(styleSheet);

export const showToastMessage = (message: string, type: 'success' | 'error') => {
  const options: ToastOptions = {
    position: "top-right",
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    rtl: false,
    pauseOnFocusLoss: false,
    draggable: true,
    pauseOnHover: true,
    theme: "dark",
    style: {
      fontSize: '14px',
      padding: '2px 15px',
      minHeight: '45px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      border: '2px solid #000000',
    },
    progressStyle: {
      background: type === 'error' ? '#c53030' : '#2f855a'
    },
    // Remove the custom icon property - let react-toastify handle icons
  };

  if (type === 'error') {
    toast.error(message, options);
  } else if (type === 'success') {
    toast.success(message, options);
  }
};