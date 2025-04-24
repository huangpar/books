import { jsQR } from 'jsqr';
import { useEffect, useRef} from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Access webcam
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        const video = videoRef.current;
        if (video) {
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // Required for iOS
        video.addEventListener('loadmetadata', () => {
          video.play();
          requestAnimationFrame(tick);
        });
      }
      })

    function tick() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          console.log("QR Code Data:", code.data);
          // Optionally draw box or highlight
        }
      }

      requestAnimationFrame(tick);
    }
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ width: '100%' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;

// function App() {
//   const scannerRef = useRef(null);
//   const [error, setError] = useState(null);
//   const [barcode, setBarcode] = useState(null);
//   const [scanning, setScanning] = useState(true);
//   const [bookInfo, setBookInfo] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [processing, setProcessing] = useState(false);
//   const isValidISBN13 = (isbn) => {
//     if (!/^\d{13}$/.test(isbn)) return false;
//     let sum = 0;
//     for (let i = 0; i < 12; i++) {
//       const num = parseInt(isbn[i], 10);
//       sum += (i % 2 === 0) ? num : num * 3;
//     }
//     const check = (10 - (sum % 10)) % 10;
//     return check === parseInt(isbn[12], 10);
//   };
//   const handleDetected = useCallback(async (result) => {
//     console.log("Detected barcode result:", result);
//     console.log("Detected varcode:", result);
//     if (processing) return;
//     setProcessing(true);

//     const codeResult = result.codeResult;
//   if (codeResult) {
//     const code = codeResult.code;
//     console.log('Barcode detected:', code, 'Format:', codeResult.format);

//     // Check if the detected format is EAN-13 or EAN-8
//     if (codeResult.format !== 'ean_13' && codeResult.format !== 'ean_8') {
//       console.warn('Detected barcode is not EAN-13 or EAN-8:', codeResult.format);
//       return;
//     }

//     // Validate ISBN-13
//     if (codeResult.format === 'ean_13' && !isValidISBN13(code)) {
//       console.warn('Invalid ISBN-13 detected:', code);
//       setError('Scanned barcode is not a valid ISBN-13.');
//       return;
//     }
    
//     setBarcode(code);
//     setScanning(false);
//     Quagga.stop();
//     setLoading(true);

//     try {
//       const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${code}`);
//       if (!response.ok) {
//         throw new Error('Network response not ok');
//       }
//       const data = await response.json();
//       if (data.totalItems > 0) {
//         const book = data.items[0].volumeInfo;
//         setBookInfo(book);
//         console.log(book)
//       } else {
//         setError('No book found for the scanned barcode.');
//       }
//     } catch (err) {
//       console.error('Error fetching book data:', err);
//       setError('Failed to fetch book information. Please try again.');
//     } finally {
//       setLoading(false);
//       setProcessing(false);
//     }
//   }}, [processing]);

//   useEffect(() => {
//     console.log("initializing Quagga...")
//     if (scannerRef.current) {
//       Quagga.init({
//         inputStream: {
//           name: "Live",
//           type: "LiveStream",
//           target: scannerRef.current,
//           constraints: {
//             facingMode: "environment",
//           },
//         },

//         decoder: {
//           readers: ["code_128_reader",
//                     "ean_reader",
//                     "ean_8_reader",
//                     "code_39_reader",
//                     "code_39_vin_reader",
//                     "codabar_reader",
//                     "upc_reader",
//                     "upc_e_reader",
//                     "i2of5_reader"
//           ],
//         },
//       }, function(err) {
//         if (err) {
//           console.error("Quagga initialization error:", err);
//           setError("Failed to access the camera. Please allow camera permissions.")
//           return;
//         }
//         if (scanning) {
//           console.log("quagga initialized successfully. starting quagga...")
//           Quagga.start();
//         }
//       });

//       Quagga.onProcessed(function(result) {
//   var drawingCtx = Quagga.canvas.ctx.overlay,
//       drawingCanvas = Quagga.canvas.dom.overlay;

//   if (result) {
//     if (result.boxes) {
//       drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
//       result.boxes.filter(function (box) {
//         return box !== result.box;
//       }).forEach(function (box) {
//         Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
//       });
//     }

//     if (result.box) {
//       Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
//     }

//     if (result.codeResult && result.codeResult.code) {
//       Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
//     }
//   }
// });
//       Quagga.onDetected(handleDetected);

//       return () => {
//         console.log("Cleaning up Quagga...");
//         Quagga.offDetected(handleDetected);
//         Quagga.stop();
//       };
//     }
//   }, [handleDetected, scanning]);

//   // useEffect(() => {
//   //     if (scanning) {
//   //       console.log("Starting Quagga for scanning...");
//   //       Quagga.start();
//   //     } else {
//   //       console.log("Stopping Quagga...");
//   //       Quagga.stop();
//   //     }
//   // }, [scanning]);

//   const handleScanAgain = () => {
//     if (!scanning) {
//       setBarcode(null);
//       setBookInfo(null);
//       setError(null);
//       setProcessing(false);
//       setLoading(false);
//       setScanning(true);

//       Quagga.stop(() => {
//         Quagga.start();
//         setScanning(true);
//       })
//     }
//   };

//   return (
//     <div className="App">
//       <h1>Barcode Scanner</h1>
//       {error && <p className="error">{error}</p>}
//       {barcode ? (
//         <div className="result">
//           {loading ? (
//             <p>Fetching book information...</p>
//           ) : bookInfo ? (
//             <div className="book-info">
//               <h2>{bookInfo.title}</h2>
//               {bookInfo.authors && <p><strong>Author(s):</strong> {bookInfo.authors.join(', ')}</p>}
//               {bookInfo.publisher && <p><strong>Publisher:</strong> {bookInfo.publisher}</p>}
//               {bookInfo.publishedDate && <p><strong>Published Date:</strong> {bookInfo.publishedDate}</p>}
//               {bookInfo.description && <p><strong>Description:</strong> {bookInfo.description}</p>}
//               {bookInfo.imageLinks && bookInfo.imageLinks.thumbnail ? (
//                 <img src={bookInfo.imageLinks.thumbnail} alt={`${bookInfo.title} cover`} />
//               ) : (
//                 <img src="/placeholder.png" alt="No cover available" />
//               )}
//             </div>
            
//           ) : (
//             <p>No book information available.</p>
//           )}
//           <button onClick={handleScanAgain}>Scan Again</button>
//         </div>
//       ) : (
//         <div className="scanner">
//           <div ref={scannerRef} className="scanner-container" />
//           {scanning && <p>Scanning for barcodes...</p>}
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
