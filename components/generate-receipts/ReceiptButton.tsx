import React from 'react';

   interface ReceiptButtonProps {
     orderId: string;
     className?: string;
   }

   export default function ReceiptButton({ orderId, className = '' }: ReceiptButtonProps) {
     const handleGenerateReceipt = () => {
       window.open(`/api/generate-receipt?id=${orderId}`, '_blank');
     };

     return (
       <button
         onClick={handleGenerateReceipt}
         disabled={!orderId}
         className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
       >
         Generate Receipt
       </button>
     );
   }