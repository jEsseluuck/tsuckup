"use client";

import React, { useState, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ReceiptApp() {
  const [formData, setFormData] = useState({
    trackingNumber: '',
    date: '',
    name: '',
    amount: '',
    MyWU: ''
  });
  
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate 1% of the amount dynamically.
  const calculatedPoints = useMemo(() => {
    if (!formData.amount) return 30; // Default fallback
    // Remove any non-numeric characters (like '$' or ',') before calculating
    const numericAmount = parseFloat(formData.amount.replace(/[^0-9.]/g, ''));
    if (isNaN(numericAmount)) return 30;
    
    return Math.floor(numericAmount * 0.01);
  }, [formData.amount]);

  const downloadPDF = async () => {
    try {
      const element = receiptRef.current;
      if (!element) {
        console.error('Receipt element not found');
        return;
      }

      // Capture the element as canvas
      const canvas = await html2canvas(element, {
        scale: 2, 
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: true
      });

      // Get canvas dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      let heightLeft = imgHeight;
      let position = 0;

      const imgData = canvas.toDataURL('image/png');
      
      // Add image to PDF, handling multiple pages if needed
      while (heightLeft >= 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
        heightLeft -= pageHeight;
        position = heightLeft;
        if (heightLeft > 0) {
          pdf.addPage();
        }
      }

      pdf.save('WU_Receipt.pdf');
      console.log('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please check the browser console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-8 flex flex-col md:flex-row gap-12 justify-center items-start font-sans">
      
      {/* INPUT FORM */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3 border border-gray-300">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Receipt Data Entry</h2>
        <form className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tracking Number (MTCN)</label>
            <input
              type="text"
              name="trackingNumber"
              placeholder="e.g. 228-109-2494"
              value={formData.trackingNumber}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
            <input
              type="text"
              name="date"
              placeholder="e.g. 07/15/2026"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
            <input
              type="text"
              name="amount"
              placeholder="$0.00"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black"
            />
          </div>
        </form>
        <button
          onClick={downloadPDF}
          className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded hover:bg-blue-700 transition shadow-sm"
        >
          Download PDF
        </button>
      </div>

      {/* RECEIPT PREVIEW */}
      <div className="bg-white p-8 shadow-2xl w-full max-w-[400px] flex justify-center border-t-4 border-gray-100">
        
        {/* Receipt content with monospace font and reduced text size (text-xs) */}
        <div 
          ref={receiptRef} 
          className="w-full max-w-[320px] bg-white text-black font-mono text-xs leading-snug pb-8 border-2 border-gray-500 p-5"
        >
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-6">
            <img 
              src="/logo.png" 
              alt="Western Union Logo" 
              className="w-[200px] h-auto mb-1" 
            />
          </div>
          
          <div className="text-center mb-6">
            <p>RECEIPT/RECIBO</p>
            <p>Thank you/Gracias</p>
          </div>

          <div className="mb-4">
            <p>TRACKING NUMBER (MTCN)/ NO. DE CONTROL</p>
            <p>DEL ENVIO:</p>
            <p className="mt-1">{formData.trackingNumber || '228-109-2494'}</p>
          </div>

          <div className="mb-4">
            <p>For Customer Service, please call</p>
            <p className="mt-1">1-800-325-6000</p>
          </div>

          <div className="mb-4">
            <p>Para comunicarse con el servicio de atención al cliente, llame al</p>
            <p className="mt-1">1-800-325-6000</p>
          </div>
          

          {/* INJECTED INPUT FIELDS (Date, Name, Amount) */}
          {(formData.date || formData.name || formData.amount) && (
            <div className="mb-4 mt-2">
              {formData.date && <p>DATE/FECHA: {formData.date}</p>}
              {formData.name && <p>NAME/NOMBRE: {formData.name}</p>}
              {formData.amount && <p>AMOUNT/CANTIDAD: {formData.amount}</p>}
            </div>
          )}

          <div className="mt-4">
            <div className="leading-none">
              <div className="mb-3">______________________________________</div>
              <p className="my-0">My WU® #: {formData.MyWU || '730155826'}</p>
              <p className="my-0">Total Points/Puntos totales: {calculatedPoints}</p>
              <div style={{ marginTop: '1px' }}>______________________________________</div>
            </div>
          </div>

          <div className="mt-6">
            <p>CC948</p>
            <p>179-08 HILLSIDE AVENUE</p>
            <p>San Francisco, CA</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
