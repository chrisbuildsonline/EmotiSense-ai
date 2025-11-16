/**
 * Face Detection Module
 * Handles basic face detection and facial feature extraction
 */

export interface FaceFeature {
  bounds?: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  frame?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  rollAngle?: number;
  yawAngle?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  smilingProbability?: number;
  leftEyeOpenProbability?: number;
  rightEyeOpenProbability?: number;
  landmarks?: {
    mouthLeft?: { position: { x: number; y: number } };
    mouthRight?: { position: { x: number; y: number } };
    mouthBottom?: { position: { x: number; y: number } };
  };
  leftMouthPosition?: { x: number; y: number };
  rightMouthPosition?: { x: number; y: number };
  bottomMouthPosition?: { x: number; y: number };
  faceID?: number;
}

export interface FaceDetectionResult {
  faceDetected: boolean;
  faceBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

export class FaceDetector {
  /**
   * Detects if a face is present in the frame
   */
  static detectFace(faces: FaceFeature[]): FaceDetectionResult {
    if (!faces || faces.length === 0) {
      return {
        faceDetected: false,
        confidence: 0,
      };
    }

    const face = faces[0];
    let faceBounds;

    if (face.bounds) {
      faceBounds = {
        x: face.bounds.origin.x,
        y: face.bounds.origin.y,
        width: face.bounds.size.width,
        height: face.bounds.size.height,
      };
    } else if (face.frame) {
      faceBounds = {
        x: face.frame.left,
        y: face.frame.top,
        width: face.frame.width,
        height: face.frame.height,
      };
    }

    return {
      faceDetected: true,
      faceBounds,
      confidence: 95,
    };
  }

  /**
   * Extracts facial features from detected face
   */
  static extractFeatures(face: FaceFeature) {
    return {
      smileProbability: face.smilingProbability ?? 0,
      leftEyeOpen: face.leftEyeOpenProbability ?? 0.8,
      rightEyeOpen: face.rightEyeOpenProbability ?? 0.8,
      rollAngle: face.rotationZ ?? face.rollAngle ?? 0,
      pitchAngle: face.rotationX ?? 0,
      yawAngle: face.rotationY ?? face.yawAngle ?? 0,
    };
  }
}
