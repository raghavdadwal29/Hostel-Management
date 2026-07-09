import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} card p-6 max-h-[90vh] overflow-y-auto animate-[fadeIn_0.15s_ease-out]`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-display">{title}</h3>
          <button onClick={onClose} className="btn-ghost !p-2 rounded-full">
            <FiX size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
