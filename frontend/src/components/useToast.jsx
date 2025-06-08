// frontend2/src/components/useToast.jsx
import { Toaster, toast } from 'react-hot-toast';

// Export the toast function directly for use
export const useToast = () => toast;

// Export a component that renders the toasts
export const ToastProvider = ({ children }) => (
    <>
        {children}
        <Toaster
            position="top-right" // Position toasts
            reverseOrder={false}
            toastOptions={{
                // Custom styling for toasts
                style: {
                    border: '1px solid #713200',
                    padding: '16px',
                    color: '#333',
                },
                success: {
                    iconTheme: {
                        primary: '#10B981', // Tailwind green-500
                        secondary: '#FFFFFF',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#EF4444', // Tailwind red-500
                        secondary: '#FFFFFF',
                    },
                },
            }}
        />
    </>
);