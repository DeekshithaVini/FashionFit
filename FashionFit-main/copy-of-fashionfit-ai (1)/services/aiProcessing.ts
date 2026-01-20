
declare const Pose: any;
declare const FaceMesh: any;

export interface Landmarks {
  pose: any[];
  face: any[];
}

export class AIService {
  private poseDetector: any;
  private faceMesh: any;

  constructor() {
    this.poseDetector = new Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });
    this.poseDetector.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.faceMesh = new FaceMesh({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });
    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  }

  async detectLandmarks(imageElement: HTMLImageElement | HTMLVideoElement): Promise<Landmarks> {
    let poseLandmarks: any[] = [];
    let faceLandmarks: any[] = [];

    this.poseDetector.onResults((results: any) => {
      poseLandmarks = results.poseLandmarks || [];
    });
    await this.poseDetector.send({ image: imageElement });

    this.faceMesh.onResults((results: any) => {
      faceLandmarks = results.multiFaceLandmarks?.[0] || [];
    });
    await this.faceMesh.send({ image: imageElement });

    return { pose: poseLandmarks, face: faceLandmarks };
  }

  /**
   * Merges user photo with dress and hairstyle
   */
  async mergeImages(
    userImg: HTMLImageElement,
    dressImg: HTMLImageElement,
    hairstyleImg: HTMLImageElement | null,
    landmarks: Landmarks,
    canvas: HTMLCanvasElement
  ): Promise<string> {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = userImg.width;
    canvas.height = userImg.height;

    // 1. Draw base user image
    ctx.drawImage(userImg, 0, 0);

    // 2. Align and draw dress (using shoulders)
    // Landmarks 11 (Left Shoulder), 12 (Right Shoulder)
    if (landmarks.pose && landmarks.pose.length > 12) {
      const ls = landmarks.pose[11];
      const rs = landmarks.pose[12];
      const hipL = landmarks.pose[23];
      const hipR = landmarks.pose[24];

      const shoulderWidth = Math.abs(rs.x - ls.x) * canvas.width;
      const torsoHeight = Math.abs((hipL.y + hipR.y) / 2 - (ls.y + rs.y) / 2) * canvas.height;
      
      const centerX = ((ls.x + rs.x) / 2) * canvas.width;
      const centerY = ((ls.y + rs.y) / 2) * canvas.height;

      const dressWidth = shoulderWidth * 2.2; // Scaling factor
      const dressHeight = torsoHeight * 2.5;
      
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.drawImage(
        dressImg,
        centerX - dressWidth / 2,
        centerY - dressHeight * 0.1, // Offset up slightly to shoulder line
        dressWidth,
        dressHeight
      );
      ctx.restore();
    }

    // 3. Align and draw hairstyle (using face mesh top head)
    if (hairstyleImg && landmarks.face && landmarks.face.length > 0) {
      // Landmark 10 is top of forehead, 152 is chin
      const topHead = landmarks.face[10];
      const chin = landmarks.face[152];
      const faceWidth = Math.abs(landmarks.face[234].x - landmarks.face[454].x) * canvas.width;
      
      const headHeight = Math.abs(chin.y - topHead.y) * canvas.height;
      const hScale = 1.8;
      const hWidth = faceWidth * hScale;
      const hHeight = headHeight * hScale;

      ctx.drawImage(
        hairstyleImg,
        (topHead.x * canvas.width) - (hWidth / 2),
        (topHead.y * canvas.height) - (hHeight * 0.4),
        hWidth,
        hHeight
      );
    }

    return canvas.toDataURL('image/png');
  }
}

export const aiService = new AIService();
