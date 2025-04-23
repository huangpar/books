import logo from './logo.svg';
import Quagga from 'quagga';
import { useEffect, useRef} from 'react';
import './App.css';

function App() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current
        },

        decoder: {
          readers: ["code_128_reader"]
        }
      }, function(err) {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.start()
      });

      return () => {
        Quagga.stop();
      };
    }
  }, []);

  return (
    <div className="App">
       <video ref={videoRef} autoPlay playsInline></video>
    </div>
  );
}

export default App;
