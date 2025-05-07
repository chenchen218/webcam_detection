// src/types/index.ts

// Represents the coordinates of the bounding box
export interface BoundingBox {
  topLeft: [number, number]; // [x, y] format
  bottomRight: [number, number]; // [x, y] format
}

// Represents a single detected face with its properties
export interface DetectedFace {
  id: number; // A unique identifier for the face within a frame (e.g., index)
  box: BoundingBox; // The bounding box coordinates on the canvas
  confidence: number; // The detection confidence score (usually 0 to 1)
  name?: string; // Add name property as optional
  age?: number;
  gender: string;
  emotion?: string;

  // --- Potential future enhancements ---
  // These would require additional models/logic:
  //
  // age?: number;        // Requires age estimation model
  // gender?: string;     // Requires gender estimation model
  // emotion?: string;    // Requires emotion detection model
  // landmarks?: Array<[number, number]>; // BlazeFace provides landmarks, could be added here
}

// You can add other shared types here as the application grows.
