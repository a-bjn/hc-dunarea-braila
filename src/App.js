import React, { useState, useMemo } from "react";

function App() {
  // Hardcoded file type mapping for each slider
  // 'pptx' = only PPTX available, 'pdf' = PDF available (preferred if both exist)
  const fileTypeMap = {
    1: 'pptx',  // slider-1 only has PPTX
    2: 'pdf',   // slider-2 has both PDF and PPTX, prefer PDF
    // Add more mappings as needed
    // 3: 'pdf',
    // 4: 'pptx',
    // ... etc
    // Default to 'pdf' if not specified
  };

  // Generate list of all files (1-38)
  const slideFiles = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const files = [];
    const baseUrl = process.env.PUBLIC_URL || "";
    const origin = window.location?.origin || "";
    const normalizedBaseUrl =
      baseUrl && baseUrl !== "/" ? `${baseUrl.replace(/\/$/, "")}` : "";
    for (let i = 1; i <= 38; i++) {
      const pdfFileName = `slider-${i}.pdf`;
      const pptxFileName = `slider-${i}.pptx`;
      const pdfFileUrl = `${origin}${normalizedBaseUrl}/${pdfFileName}`;
      const pptxFileUrl = `${origin}${normalizedBaseUrl}/${pptxFileName}`;
      
      // For PPTX, use Office Online Viewer
      const pptxOfficeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(pptxFileUrl)}`;
      const pptxGoogleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pptxFileUrl)}&embedded=true`;
      const pdfGoogleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfFileUrl)}&embedded=true`;
      const pdfJsViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfFileUrl)}`;
      
      files.push({
        pdfFileName,
        pptxFileName,
        pdfFileUrl,
        pptxFileUrl,
        pdfGoogleViewerUrl,
        pdfJsViewerUrl,
        pptxOfficeViewerUrl,
        pptxGoogleViewerUrl,
      });
    }
    return files;
  }, []);

  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [useOfficeViewer, setUseOfficeViewer] = useState(true); // For PPTX viewer

  // Detect if device is mobile
  const isMobile = useMemo(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return false;
    }
    // Check screen width
    const isSmallScreen = window.innerWidth <= 768;
    // Check user agent for mobile devices
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    return isSmallScreen || isMobileUserAgent;
  }, []);

  // Get file type for a specific slide index (0-based)
  const getFileType = (index) => {
    // Use the mapping (same for mobile and desktop)
    // PDF is preferred when available, PPTX otherwise
    const slideNumber = index + 1; // Convert to 1-based
    return fileTypeMap[slideNumber] || 'pdf'; // Default to 'pdf' if not specified
  };

  // Get file URL for a specific slide index
  const getFileUrl = (index) => {
    const fileType = getFileType(index);
    const file = slideFiles[index];

    if (fileType === 'pdf') {
      // Add parameters to force inline viewing - remove scrollbar=0 to allow scrolling
      return `${file?.pdfFileUrl}#toolbar=0&navpanes=0&view=FitH`;
    } else {
      // Use Office Viewer for PPTX
      return useOfficeViewer
        ? file?.pptxOfficeViewerUrl
        : file?.pptxGoogleViewerUrl;
    }
  };

  // Get current file URL based on file type (for desktop)
  const getCurrentFileUrl = () => {
    return getFileUrl(currentFileIndex);
  };

  const handlePrevFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  const handleNextFile = () => {
    if (currentFileIndex < slideFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: isMobile ? "auto" : "100vh",
        minHeight: isMobile ? "100vh" : "100vh",
        margin: 0,
        padding: 0,
        overflow: isMobile ? "visible" : "hidden",
        backgroundColor: "#000",
        display: isMobile ? "block" : "flex",
        flexDirection: isMobile ? "column" : "column",
        position: "relative",
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
      }}
    >
      {isMobile ? (
        /* Mobile: Scrollable list of all slides with lazy loading */
        <div
          style={{
            width: "100%",
            display: "block",
            position: "relative",
          }}
        >
          {slideFiles.map((file, index) => (
            <SlideItem
              key={index}
              index={index}
              file={file}
              getFileType={getFileType}
              getFileUrl={getFileUrl}
              useOfficeViewer={useOfficeViewer}
              setUseOfficeViewer={setUseOfficeViewer}
              isMobile={isMobile}
            />
          ))}
        </div>
      ) : (
        /* Desktop: Single slide view with navigation */
        <>
          {/* Navigation Controls */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10000,
              display: "flex",
              gap: "10px",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              padding: "10px 20px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <button
              onClick={handlePrevFile}
              disabled={currentFileIndex === 0}
              style={{
                padding: "8px 16px",
                backgroundColor: currentFileIndex === 0 ? "#555" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: currentFileIndex === 0 ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              ← Previous
            </button>
            <span
              style={{
                color: "white",
                fontSize: "14px",
                minWidth: "120px",
                textAlign: "center",
              }}
            >
              {currentFileIndex + 1} / {slideFiles.length}
            </span>
            <button
              onClick={handleNextFile}
              disabled={currentFileIndex === slideFiles.length - 1}
              style={{
                padding: "8px 16px",
                backgroundColor:
                  currentFileIndex === slideFiles.length - 1 ? "#555" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor:
                  currentFileIndex === slideFiles.length - 1
                    ? "not-allowed"
                    : "pointer",
                fontSize: "14px",
              }}
            >
              Next →
            </button>
          </div>

          {/* Document Viewer */}
          <div
            style={{
              width: "100%",
              height: "100%",
              flex: 1,
              position: "relative",
            }}
          >
            <iframe
              key={`${currentFileIndex}-${getFileType(currentFileIndex)}-${useOfficeViewer}`}
              src={getCurrentFileUrl()}
              title={`Presentation ${currentFileIndex + 1}`}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              style={{
                border: "none",
                backgroundColor: "#000",
              }}
              onError={() => {
                // If Office Viewer fails, try Google Viewer as fallback
                if (useOfficeViewer && getFileType(currentFileIndex) === 'pptx') {
                  setUseOfficeViewer(false);
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

const SlideItem = ({
  index,
  file,
  getFileType,
  getFileUrl,
  useOfficeViewer,
  setUseOfficeViewer,
  isMobile,
}) => {
  const fileType = getFileType(index);
  const baseFileUrl = getFileUrl(index);
  const fileUrl =
    fileType === 'pdf' && isMobile
      ? file?.pdfJsViewerUrl || file?.pdfGoogleViewerUrl || baseFileUrl
      : baseFileUrl;

  const shouldShowScrollOverlay = !(isMobile && fileType === 'pptx');

  return (
    <div
      style={{
        width: "100%",
        minHeight: isMobile ? "70vh" : "100vh",
        height: isMobile ? "auto" : "100vh",
        position: "relative",
        borderBottom: "2px solid #333",
        flexShrink: 0,
        touchAction: "pan-y",
      }}
    >
      {shouldShowScrollOverlay && (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "30px",
              height: "100%",
              zIndex: 10,
              touchAction: "pan-y",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "30px",
              height: "100%",
              zIndex: 10,
              touchAction: "pan-y",
            }}
          />
        </>
      )}
      {fileType === 'pdf' ? (
        // Use iframe for PDFs with proper attributes for inline display
        <iframe
          key={`${index}-pdf`}
          src={fileUrl}
          title={`Presentation ${index + 1}`}
          width="100%"
          height={isMobile ? "95vh" : "100%"}
          frameBorder="0"
          allowFullScreen
          scrolling="yes"
        style={{
          border: "none",
          backgroundColor: "transparent",
          display: "block",
          position: "relative",
          zIndex: 0,
          pointerEvents: "auto", // Allow interactions for videos
          WebkitOverflowScrolling: "touch",
          transform: isMobile && fileType === 'pdf' ? "scale(1.05)" : "none",
          transformOrigin: "top center",
        }}
        />
      ) : (
        <iframe
          key={`${index}-${fileType}-${useOfficeViewer}`}
          src={fileUrl}
          title={`Presentation ${index + 1}`}
          width="100%"
          height={isMobile ? "95vh" : "100%"}
          frameBorder="0"
          allowFullScreen
          scrolling="yes"
          allow="autoplay; fullscreen"
          style={{
            border: "none",
            backgroundColor: "transparent",
            display: "block",
            position: "relative",
            zIndex: 0,
            pointerEvents:
              isMobile && fileType === 'pptx' ? "none" : "auto", // Allow mobile scrolling without overlay
            WebkitOverflowScrolling: "touch",
            transform: isMobile && fileType === 'pdf' ? "scale(1.05)" : "none",
            transformOrigin: "top center",
          }}
          onError={() => {
            // If Office Viewer fails, try Google Viewer as fallback
            if (useOfficeViewer && fileType === 'pptx') {
              setUseOfficeViewer(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default App;
