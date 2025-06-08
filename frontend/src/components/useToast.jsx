import { Toaster, toast } from 'react-hot-toast';

export const useToast = () => toast;

export const ToastProvider = ({ children }) => (
    <>
        {children}
        <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
                style: {
                    border: '1px solid #713200',
                    padding: '16px',
                    color: '#333',
                },
                success: {
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#FFFFFF',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#FFFFFF',
                    },
                },
            }}
        />
    </>
);