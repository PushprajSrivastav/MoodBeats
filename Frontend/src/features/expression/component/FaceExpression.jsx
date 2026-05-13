import React, { useEffect, useRef, useState } from "react";
import { initFaceDetection, detectExpression } from "../utils/utils";

const FaceExpression = ({ onMoodDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [expression, setExpression] = useState("None");
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let streamRef = null;

    if (isCameraActive) {
      initFaceDetection(videoRef).then(() => {
        if (videoRef.current && videoRef.current.srcObject) {
          streamRef = videoRef.current.srcObject;
        }
        
        let lastMood = "Neutral";

        // Start polling for expression
        intervalRef.current = setInterval(async () => {
          const result = await detectExpression(videoRef, canvasRef);
          if (result && !result.includes("❌")) {
            const cleanMood = result.split(" ")[1] || "Neutral"; // extract text part e.g. "Happy"
            lastMood = cleanMood;
            setExpression(cleanMood);
          }
        }, 500); // Poll slightly faster for better responsiveness

        // Stop scanning automatically after 4 seconds
        timeoutRef.current = setTimeout(() => {
          setIsCameraActive(false);
          setExpression(lastMood);
          if (onMoodDetected) onMoodDetected(lastMood);
        }, 4000);
      });
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (streamRef) {
        streamRef.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  return (
    <div className="camera-section">
      <div className={`camera-view ${isCameraActive ? 'active' : ''}`}>
        {!isCameraActive ? (
          <div className="camera-placeholder">
            <span className="camera-icon">📷</span>
            <p>Camera is off</p>
            <button 
              className="start-camera-btn"
              onClick={() => setIsCameraActive(true)}
            >
              Enable Camera
            </button>
          </div>
        ) : (
          <div className="camera-active">
            <video 
              ref={videoRef} 
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, zIndex: 1, borderRadius: "8px" }}
              muted
            />
            <div className="face-scanner-overlay" style={{ zIndex: 3, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Modern Corner Brackets */}
                <path d="M80 80V50H110" stroke="#00c6ff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
                <path d="M290 50H320V80" stroke="#00c6ff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
                <path d="M320 320V350H290" stroke="#00c6ff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
                <path d="M110 350H80V320" stroke="#00c6ff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
                
                {/* Elegant Head/Face Outline */}
                <path d="M200 60C140 60 90 110 90 190C90 270 140 340 200 340C260 340 310 270 310 190C310 110 260 60 200 60Z" 
                      stroke="#00c6ff" stroke-width="1.5" stroke-dasharray="10 6" opacity="0.4">
                  <animate attributeName="stroke-dashoffset" from="0" to="100" dur="10s" repeatCount="indefinite" />
                </path>

                {/* Eye Targets */}
                <circle cx="150" cy="160" r="3" fill="#00c6ff" opacity="0.6">
                    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="250" cy="160" r="3" fill="#00c6ff" opacity="0.6">
                    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite" />
                </circle>

                {/* Scanning Beam */}
                <rect x="90" y="100" width="220" height="40" fill="url(#beamGradient)" opacity="0.3">
                  <animate attributeName="y" values="60;300;60" dur="4s" repeatCount="indefinite" />
                </rect>

                <defs>
                  <linearGradient id="beamGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#00c6ff" stop-opacity="0" />
                    <stop offset="50%" stop-color="#00c6ff" stop-opacity="1" />
                    <stop offset="100%" stop-color="#00c6ff" stop-opacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <p className="status-text" style={{ zIndex: 4, position: 'absolute', bottom: '70px', background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '16px' }}>Analyzing expression...</p>
            <button 
              className="stop-camera-btn"
              style={{ zIndex: 4, position: "absolute", bottom: "20px" }}
              onClick={() => setIsCameraActive(false)}
            >
              Stop Camera
            </button>
          </div>
        )}
      </div>

      <div className="mood-result">
        <h3>Current Mood Detected:</h3>
        <div className="mood-badge">
          {expression}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default FaceExpression;