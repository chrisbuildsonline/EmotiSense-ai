/**
 * Head Movement Detection Module
 * Handles head pose tracking and nodding detection
 */

import type { FaceFeature } from './FaceDetector';

export interface HeadMovementResult {
  headMovement: number;
  isNodding: boolean;
  pitchAngle: number;
  yawAngle: number;
  rollAngle: number;
  pitchRange: number;
  yawRange: number;
}

export class HeadMovementDetector {
  private headPoseHistory: { pitch: number; yaw: number; timestamp: number }[] = [];
  private readonly HEAD_POSE_HISTORY_SIZE = 10;
  private readonly NODDING_THRESHOLD = 30;

  /**
   * Analyzes head movement and detects nodding
   */
  analyzeHeadMovement(face: FaceFeature, timestamp: number): HeadMovementResult {
    const pitchAngle = face.rotationX ?? 0;
    const yawAngle = face.rotationY ?? face.yawAngle ?? 0;
    const rollAngle = face.rotationZ ?? face.rollAngle ?? 0;
    
    // Add to history
    this.headPoseHistory.push({ pitch: pitchAngle, yaw: yawAngle, timestamp });
    if (this.headPoseHistory.length > this.HEAD_POSE_HISTORY_SIZE) {
      this.headPoseHistory.shift();
    }
    
    if (this.headPoseHistory.length < 3) {
      return {
        headMovement: 0,
        isNodding: false,
        pitchAngle,
        yawAngle,
        rollAngle,
        pitchRange: 0,
        yawRange: 0,
      };
    }
    
    // Calculate movement ranges
    const pitchAngles = this.headPoseHistory.map(h => h.pitch);
    const yawAngles = this.headPoseHistory.map(h => h.yaw);
    
    const pitchRange = Math.max(...pitchAngles) - Math.min(...pitchAngles);
    const yawRange = Math.max(...yawAngles) - Math.min(...yawAngles);
    
    const totalMovement = (pitchRange + yawRange) / 2;
    const headMovement = Math.min(100, totalMovement * 2);
    const isNodding = headMovement > this.NODDING_THRESHOLD;
    
    return {
      headMovement,
      isNodding,
      pitchAngle,
      yawAngle,
      rollAngle,
      pitchRange,
      yawRange,
    };
  }

  /**
   * Resets head movement history
   */
  reset(): void {
    this.headPoseHistory = [];
  }
}
