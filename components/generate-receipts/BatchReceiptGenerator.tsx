
   import React, { useState } from 'react';

   interface BatchReceiptGeneratorProps {
     donorId?: string;
     className?: string;
   }

   export default function BatchReceiptGenerator({
     donorId,
     className = '',
   }: BatchReceiptGeneratorProps) {
     const [startDate, setStartDate] = useState('');
     const [endDate, setEndDate] = useState('');
     const [isLoading, setIsLoading] = useState(false);
     const [error, setError] = useState('');

     const handleGenerateReceipts = () => {
       if (!startDate || !endDate) {
         setError('Please select both start and end dates');
         return;
       }

       setError('');
       setIsLoading(true);

       // Construct URL with query parameters
       let url = `/api/generate-receipts?startDate=${startDate}&endDate=${endDate}`;
       
       // Add donor ID if available
       if (donorId) {
         url += `&donorId=${donorId}`;
       }

       // Open in new tab for download
       window.open(url, '_blank');
       setIsLoading(false);
     };

     return (
       <div className={`p-4 border rounded-md ${className}`}>
         <h3 className="text-lg font-semibold mb-4">Generate Batch Receipts</h3>
         
         <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
           <div className="flex flex-col">
             <label htmlFor="startDate" className="mb-1 text-sm">
               Start Date
             </label>
             <input
               type="date"
               id="startDate"
               value={startDate}
               onChange={(e) => setStartDate(e.target.value)}
               className="px-3 py-2 border rounded-md"
             />
           </div>
           
           <div className="flex flex-col">
             <label htmlFor="endDate" className="mb-1 text-sm">
               End Date
             </label>
             <input
               type="date"
               id="endDate"
               value={endDate}
               onChange={(e) => setEndDate(e.target.value)}
               className="px-3 py-2 border rounded-md"
             />
           </div>
         </div>
         
         {error && <p className="text-red-500 mt-2">{error}</p>}
         
         <button
           onClick={handleGenerateReceipts}
           disabled={isLoading || !startDate || !endDate}
           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
         >
           {isLoading ? 'Generating...' : 'Generate Receipts'}
         </button>
       </div>
     );
   }