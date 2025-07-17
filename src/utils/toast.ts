import toast from 'react-hot-toast';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#16a34a', // green-600
      color: '#fff',
      fontWeight: 'bold',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#16a34a',
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-center',
    style: {
      background: '#dc2626', // red-600
      color: '#fff',
      fontWeight: 'bold',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#dc2626',
    },
  });
};

export const showInfoToast = (message: string) => {
  toast(message, {
    duration: 3000,
    position: 'top-center',
    style: {
      background: '#4b5563', // gray-700
      color: '#fff',
      fontWeight: 'bold',
    },
  });
};