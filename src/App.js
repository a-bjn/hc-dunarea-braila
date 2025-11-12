import React, { useState, useMemo } from "react";

function App() {
  // Hardcoded file type mapping for each slider
  const fileTypeMap = {
    1: "pptx", // slider-1 only has PPTX
    2: "pdf",  // slider-2 has PDF (preferred if both exist)
    // Add more mappings as needed
  };

  // Generate list of all files (1-38)
  const slideFiles = useMemo(() => {
    if (typeof window === "undefined") return [];

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

      const pptxOfficeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        pptxFileUrl
      )}`;
      const pptxGoogleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
        pptxFileUrl
      )}&embedded=true`;
      const pdfJsViewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html`;

      files.push({
        pdfFileName,
        pptxFileName,
        pdfFileUrl,
        pptxFileUrl,
        pdfJsViewerUrl,
        pptxOfficeViewerUrl,
        pptxGoogleViewerUrl,
      });
    }

    return files;
  }, []);

  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [useOfficeViewer, setUseOfficeViewer] = useState(true);

  // Detect mobile devices
  const isMobile = useMemo(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined")
      return false;

    const isSmallScreen = window.innerWidth <= 768;
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    return isSmallScreen || isMobileUserAgent;
  }, []);

  // Get file type for a slide
  const getFileType = (index) => {
    const slideNumber = index + 1;
    return fileTypeMap[slideNumber] || "pdf";
  };

  // Get URL for a slide
  const getFileUrl = (index) => {
    const fileType = getFileType(index);
    const file = slideFiles[index];

    if (fileType === "pdf") {
      // Use PDF.js with no toolbar, no sidebar, zoom fit
      return `${file.pdfJsViewerUrl}?file=${encodeURIComponent(
        file.pdfFileUrl
      )}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`;
    } else {
      // PPTX: Office Viewer preferred, fallback to Google Viewer
      return useOfficeViewer
        ? file.pptxOfficeViewerUrl
        : file.pptxGoogleViewerUrl;
    }
  };

  const getCurrentFileUrl = () => getFileUrl(currentFileIndex);

  const handlePrevFile = () => {
    if (currentFileIndex > 0) setCurrentFileIndex(currentFileIndex - 1);
  };

  const handleNextFile = () => {
    if (currentFileIndex < slideFiles.length - 1)
      setCurrentFileIndex(currentFileIndex + 1);
  };

  return (
    <div
      style={{
        width: "100%",
        height: isMobile ? "auto" : "100vh",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        overflow: isMobile ? "visible" : "hidden",
        backgroundColor: "#000",
        display: isMobile ? "block" : "flex",
        flexDirection: "column",
        position: "relative",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {isMobile ? (
        <div style={{ width: "100%", display: "block", position: "relative" }}>
          {slideFiles.map((file, index) => (
            <SlideItem
              key={index}
              index={index}
              file={file}
              getFileType={getFileType}
              useOfficeViewer={useOfficeViewer}
              setUseOfficeViewer={setUseOfficeViewer}
              isMobile={isMobile}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Navigation */}
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
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
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
              }}
            >
              ← Previous
            </button>
            <span
              style={{
                color: "white",
                minWidth: "80px",
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
              }}
            >
              Next →
            </button>
          </div>

          {/* Viewer */}
          <iframe
            key={`${currentFileIndex}-${getFileType(currentFileIndex)}-${useOfficeViewer}`}
            src={getCurrentFileUrl()}
            title={`Slide ${currentFileIndex + 1}`}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            style={{ border: "none", backgroundColor: "#000" }}
            onError={() => {
              // fallback for PPTX
              if (useOfficeViewer && getFileType(currentFileIndex) === "pptx") {
                setUseOfficeViewer(false);
              }
            }}
          />
        </>
      )}
    </div>
  );
}

const SlideItem = ({
  index,
  file,
  getFileType,
  useOfficeViewer,
  setUseOfficeViewer,
  isMobile,
}) => {
  const fileType = getFileType(index);

  const fileUrl =
    fileType === "pdf"
      ? `${file.pdfJsViewerUrl}?file=${encodeURIComponent(
          file.pdfFileUrl
        )}#toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`
      : useOfficeViewer
      ? file.pptxOfficeViewerUrl
      : file.pptxGoogleViewerUrl;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        minHeight: "100vh",
        position: "relative",
        borderBottom: "2px solid #333",
        flexShrink: 0,
        touchAction: "pan-y",
      }}
    >
      <iframe
        key={`${index}-${fileType}-${useOfficeViewer}`}
        src={fileUrl}
        title={`Slide ${index + 1}`}
        width="100%"
        height="100%"
        allowFullScreen
        scrolling="no"
        style={{
          border: "none",
          backgroundColor: "#000",
          display: "block",
          position: "relative",
          zIndex: 0,
          pointerEvents: "auto",
          WebkitOverflowScrolling: "touch",
        }}
        onError={() => {
          if (useOfficeViewer && fileType === "pptx") {
            setUseOfficeViewer(false);
          }
        }}
      />
    </div>
  );
};

export default App;
