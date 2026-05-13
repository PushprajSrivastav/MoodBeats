import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

let faceLandmarker = null;

// ✅ INIT
export const initFaceDetection = async (videoRef) => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
    },
    runningMode: "IMAGE",
    outputFaceBlendshapes: true,
    numFaces: 1,
  });

  // 🎥 Start camera
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  videoRef.current.srcObject = stream;
  await videoRef.current.play();
};

// ✅ DETECT
export const detectExpression = async (videoRef, canvasRef) => {
  if (!faceLandmarker || !videoRef.current) return "❌ Model not loaded";

  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const results = await faceLandmarker.detect(canvas);

  if (results.faceBlendshapes?.length > 0) {
    const blendShapes = results.faceBlendshapes[0].categories;

    const getScore = (name) =>
      blendShapes.find((b) => b.categoryName === name)?.score || 0;

    const smile =
      getScore("mouthSmileLeft") + getScore("mouthSmileRight");

    const mouthOpen = getScore("jawOpen");

    const sad =
      getScore("mouthFrownLeft") +
      getScore("mouthFrownRight") +
      getScore("mouthLowerDownLeft") +
      getScore("mouthLowerDownRight");

    const angry =
      getScore("browDownLeft") +
      getScore("browDownRight") +
      getScore("eyeSquintLeft") +
      getScore("eyeSquintRight");

    const eyeBlink =
      getScore("eyeBlinkLeft") + getScore("eyeBlinkRight");

    if (eyeBlink > 0.8) return "😴 Drowsy";
    if (smile > 0.6) return "😊 Happy";
    if (sad > 0.8) return "😢 Sad";
    if (angry > 0.7) return "😡 Angry";
    if (mouthOpen > 0.5) return "😲 Surprised";

    return "😐 Neutral";
  }

  return "❌ No Face Detected";
};