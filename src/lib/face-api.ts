import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return;
  
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    console.log('Face-api models loaded successfully');
  } catch (error) {
    console.error('Error loading face-api models:', error);
    throw error;
  }
};

export const getFaceData = async (video: HTMLVideoElement) => {
  const detection = await faceapi
    .detectSingleFace(video)
    .withFaceLandmarks()
    .withFaceDescriptor();
    
  if (!detection) return null;

  const landmarks = detection.landmarks;
  const nose = landmarks.getNose();
  const jaw = landmarks.getJawOutline();
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  // Simple pose estimation
  // Yaw (Left/Right): Nose position relative to jaw width
  const jawLeft = jaw[0];
  const jawRight = jaw[16];
  const noseTip = nose[6];
  const jawWidth = Math.abs(jawRight.x - jawLeft.x);
  const noseRelativeX = (noseTip.x - Math.min(jawLeft.x, jawRight.x)) / jawWidth;
  
  // Pitch (Up/Down): Nose position relative to eye-chin distance
  const eyeCenterY = (leftEye[0].y + rightEye[3].y) / 2;
  const chin = jaw[8];
  const faceHeight = Math.abs(chin.y - eyeCenterY);
  const noseRelativeY = (noseTip.y - eyeCenterY) / faceHeight;

  return {
    descriptor: detection.descriptor,
    pose: {
      yaw: noseRelativeX, // 0.5 is center, < 0.45 is one side, > 0.55 is other
      pitch: noseRelativeY // 0.5 is center, < 0.45 is up, > 0.55 is down
    }
  };
};

export const compareFaces = (descriptor1: Float32Array, descriptor2: Float32Array) => {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  // Euclidean distance: 0 is perfect match, 1 is very different.
  // User wants 25% match threshold.
  // Usually, 0.6 is the default threshold for "same person".
  // A 25% match is quite loose, which would mean a distance of around 0.75 or 0.8.
  // But let's calculate "similarity" as (1 - distance).
  const similarity = 1 - distance;
  return similarity;
};
