/**
 * Drowsiness Detection Module
 * Calculates drowsiness level based on multiple factors
 */

export interface DrowsinessResult {
  drowsinessLevel: number;
  isDrowsy: boolean;
  factors: {
    eyeClosureContribution: number;
    lowMovementContribution: number;
    highMovementContribution: number;
  };
}

export class DrowsinessDetector {
  private readonly DROWSY_THRESHOLD = 50;

  /**
   * Calculates drowsiness level
   * @param eyeClosureRate - Rate of eye closure (0-1)
   * @param headMovement - Head movement intensity (0-100)
   */
  calculateDrowsiness(eyeClosureRate: number, headMovement: number): DrowsinessResult {
    let drowsiness = 0;
    
    // Eye closure contributes 70% to drowsiness
    const eyeClosureContribution = eyeClosureRate * 70;
    drowsiness += eyeClosureContribution;
    
    // Low head movement (< 10%) suggests drowsiness
    let lowMovementContribution = 0;
    if (headMovement < 10) {
      lowMovementContribution = 20;
      drowsiness += lowMovementContribution;
    }
    
    // High head movement (> 40%) might indicate nodding off
    let highMovementContribution = 0;
    if (headMovement > 40) {
      highMovementContribution = 10;
      drowsiness += highMovementContribution;
    }
    
    const drowsinessLevel = Math.min(100, Math.round(drowsiness));
    const isDrowsy = drowsinessLevel > this.DROWSY_THRESHOLD;

    return {
      drowsinessLevel,
      isDrowsy,
      factors: {
        eyeClosureContribution,
        lowMovementContribution,
        highMovementContribution,
      },
    };
  }
}
