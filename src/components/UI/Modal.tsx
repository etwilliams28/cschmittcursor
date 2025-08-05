import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md' 
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md mx-4 sm:mx-auto',
    md: 'max-w-lg mx-4 sm:mx-auto',
    lg: 'max-w-2xl mx-4 sm:mx-auto',
    xl: 'max-w-4xl mx-4 sm:mx-auto'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className={`relative inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full ${sizeClasses[size]} max-h-[90vh] sm:max-h-[85vh]`}>
          {title && (
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 sm:px-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl leading-6 font-medium text-gray-900 pr-8">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>
          )}
          
          <div className={`overflow-y-auto ${title ? 'px-4 pb-4 sm:px-6 sm:pb-6' : 'p-4 sm:p-6'} ${title ? 'max-h-[calc(90vh-80px)] sm:max-h-[calc(85vh-80px)]' : 'max-h-[90vh] sm:max-h-[85vh]'}`}>
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;