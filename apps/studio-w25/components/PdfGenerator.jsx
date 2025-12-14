import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PdfGenerator Component
 * Generates a high-quality A4 PDF for artwork details
 * 
 * @param {Object} props
 * @param {string} props.imageUrl - Full URL to the artwork image
 * @param {string} props.title - Artwork title
 * @param {string} props.artist - Artist name
 * @param {string} props.year - Year of creation
 * @param {string} props.technique - Technique/medium
 * @param {string} props.size - Dimensions
 * @param {string} props.description - Artwork description
 * @param {string} props.contact - Contact information
 * @param {string} props.disclaimer - Legal disclaimer text
 * @param {string} props.buttonClassName - Optional custom button classes
 */
export default function PdfGenerator({
  imageUrl,
  title = 'Untitled',
  artist = '',
  year = '',
  technique = '',
  size = '',
  description = '',
  contact = 'contact@w25.art',
  disclaimer = 'This document is for informational purposes only.',
  buttonClassName = '',
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generatePdf = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Get the template element
      const element = document.getElementById('a4-template');
      
      if (!element) {
        throw new Error('PDF template element not found');
      }

      // Make the template visible temporarily for rendering
      element.style.display = 'block';

      // Generate canvas from HTML with high quality settings
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale = better quality
        useCORS: true, // Enable CORS for external images
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000, // 15s timeout for image loading
      });

      // Hide the template again
      element.style.display = 'none';

      // A4 dimensions in mm
      const a4Width = 210;
      const a4Height = 297;

      // Create PDF with A4 portrait orientation
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Calculate dimensions to fit canvas into A4 while maintaining aspect ratio
      const imgWidth = a4Width;
      const imgHeight = (canvas.height * a4Width) / canvas.width;

      // Get the canvas as image data
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Add image to PDF
      // If image height exceeds A4 height, it will be cropped (or you can scale down)
      if (imgHeight > a4Height) {
        // Scale down to fit A4 height
        const scaledWidth = (canvas.width * a4Height) / canvas.height;
        const xOffset = (a4Width - scaledWidth) / 2; // Center horizontally
        pdf.addImage(imgData, 'JPEG', xOffset, 0, scaledWidth, a4Height);
      } else {
        // Center vertically if shorter than A4
        const yOffset = (a4Height - imgHeight) / 2;
        pdf.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, imgHeight);
      }

      // Generate filename from title (sanitize for filesystem)
      const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;

      // Save the PDF
      pdf.save(filename);

      setIsGenerating(false);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError(err.message || 'Failed to generate PDF. Please try again.');
      setIsGenerating(false);
      
      // Hide template on error
      const element = document.getElementById('a4-template');
      if (element) {
        element.style.display = 'none';
      }
    }
  };

  return (
    <>
      {/* Download Button */}
      <button
        onClick={generatePdf}
        disabled={isGenerating}
        className={
          buttonClassName ||
          'px-6 py-3 bg-black text-white font-medium rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
        }
        aria-label="Download artwork details as PDF"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating PDF...
          </span>
        ) : (
          'Download PDF'
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Hidden A4 Template - 794px x 1123px at 96 DPI */}
      <div
        id="a4-template"
        style={{
          display: 'none',
          width: '794px',
          height: '1123px',
          backgroundColor: '#ffffff',
          padding: '40px',
          boxSizing: 'border-box',
          fontFamily: 'Arial, sans-serif',
          color: '#000000',
          position: 'absolute',
          left: '-9999px',
          top: '0',
        }}
      >
        {/* Artwork Image */}
        <div
          style={{
            width: '100%',
            height: '520px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: '#f5f5f5',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
              crossOrigin="anonymous"
            />
          ) : (
            <div style={{ color: '#999', fontSize: '18px' }}>No image available</div>
          )}
        </div>

        {/* Artwork Details */}
        <div style={{ marginBottom: '30px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '8px',
              lineHeight: '1.3',
            }}
          >
            {title}
          </h1>
          
          {artist && (
            <p style={{ fontSize: '18px', marginBottom: '4px', color: '#333' }}>
              <strong>Artist:</strong> {artist}
            </p>
          )}
          
          <div style={{ fontSize: '16px', color: '#555', marginBottom: '12px' }}>
            {year && <span style={{ marginRight: '16px' }}>{year}</span>}
            {technique && <span style={{ marginRight: '16px' }}>{technique}</span>}
            {size && <span>{size}</span>}
          </div>

          {description && (
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#333',
                marginTop: '16px',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Footer with Contact & Disclaimer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '40px',
            right: '40px',
            borderTop: '1px solid #ddd',
            paddingTop: '20px',
          }}
        >
          {contact && (
            <p style={{ fontSize: '12px', marginBottom: '8px', color: '#666' }}>
              <strong>Contact:</strong> {contact}
            </p>
          )}
          
          {disclaimer && (
            <p style={{ fontSize: '10px', color: '#999', lineHeight: '1.4' }}>
              {disclaimer}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
