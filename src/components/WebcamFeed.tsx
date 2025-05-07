// src/components/WebcamFeed.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
// import * as tf from "@tensorflow/tfjs";
import * as faceapi from "face-api.js";
// import * as blazeface from "@tensorflow-models/blazeface";
import { RootState, AppDispatch } from "../store/store";

import {
  setWebcamRunning,
  setModelLoading,
  setModelError,
  setDetectionError,
  updateDetectedFaces,
} from "../features/faceDetectSlice";
import { Alert } from "react-bootstrap";
import { DetectedFace } from "../types";
import "./WebcamFeed.css"; // For styling

const WebcamFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelRef = useRef<boolean>(false); // Add modelRef
  const modelsLoadedRef = useRef<boolean>(false);
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null); // To cancel animation loop

  const dispatch: AppDispatch = useDispatch();
  const { isWebcamRunning, modelError, detectionError, isModelLoading } =
    useSelector((state: RootState) => state.faceDetect);

  const [videoDimensions, setVideoDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 640, height: 480 });

  // --- Model Loading ---
  useEffect(() => {
    const loadModelsAndMatcher = async () => {
      const MODEL_URL = "/models"; // Path to your models in the public folder
      dispatch(setModelLoading(true));
      dispatch(setModelError(null));
      try {
        // dispatch(setModelLoading(true));
        // dispatch(setModelError(null));
        console.log("Loading face-api.js models...");
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL), // Or use tinyFaceDetector: faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL), // For face recognition
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL), // For age & gender
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL), // For emotions
        ]);
        modelsLoadedRef.current = true;
        modelRef.current = true; // Set modelRef when models are loaded
        console.log("face-api.js models loaded.");

        // --- Basic Face Recognition Setup (Example with placeholder) ---
        // In a real app, you'd load images of known people and create descriptors
        console.log("Setting up FaceMatcher...");
        const labeledFaceDescriptors = await loadLabeledImages(); // Implement this function
        if (labeledFaceDescriptors.length > 0) {
          faceMatcherRef.current = new faceapi.FaceMatcher(
            labeledFaceDescriptors,
            0.6
          ); // 0.6 is a common distance threshold
          console.log("FaceMatcher setup complete.");
        } else {
          console.log(
            "No labeled images found for FaceMatcher or setup failed."
          );
        }
        // --- End Face Recognition Setup ---
      } catch (err) {
        console.error(
          "Error loading face-api.js models or setting up matcher:",
          err
        );
        dispatch(
          setModelError(
            `Failed to load face-api models: ${
              err instanceof Error ? err.message : String(err)
            }`
          )
        );
      } finally {
        dispatch(setModelLoading(false));
      }
    };
    // Inside WebcamFeed.tsx

    async function loadLabeledImages() {
      // 1. Update the labels array to match your folder names
      const labels = ["chen", "james"];

      try {
        const descriptors = await Promise.all(
          labels.map(async (label) => {
            const descriptionsForThisLabel = [];

            // 2. Update the image path logic to match your structure
            // Each person has one image named after them in their folder
            const imgUrl = `/images/${label}/${label}.jpg`; // e.g., /images/chen/chen.jpg

            try {
              const img = await faceapi.fetchImage(imgUrl); // Fetches from public/images/label/label.jpg
              const detection = await faceapi
                .detectSingleFace(img)
                .withFaceLandmarks()
                .withFaceDescriptor();

              if (detection) {
                descriptionsForThisLabel.push(detection.descriptor);
              } else {
                console.warn(`No face detected for ${label} in ${imgUrl}`);
              }
            } catch (e) {
              console.warn(`Could not load image ${imgUrl} for ${label}:`, e);
            }

            if (descriptionsForThisLabel.length === 0) {
              console.warn(
                `No descriptors generated for label: ${label}. This person might not be recognized.`
              );
              return null;
            }
            return new faceapi.LabeledFaceDescriptors(
              label,
              descriptionsForThisLabel
            );
          })
        );
        // Filter out any labels for which no descriptors could be generated
        return descriptors.filter(
          (d) => d !== null
        ) as faceapi.LabeledFaceDescriptors[];
      } catch (error) {
        console.error("Error loading labeled images for recognition:", error);
        return []; // Return empty array on error
      }
    }

    loadModelsAndMatcher();
  }, [dispatch]);

  // --- Detection Loop ---
  const runDetection = useCallback(async () => {
    if (
      !modelsLoadedRef.current || // Check if face-api models are loaded
      !videoRef.current ||
      videoRef.current.readyState < 3
    ) {
      animationFrameId.current = requestAnimationFrame(runDetection);
      return;
    }

    const videoEl = videoRef.current; // For convenience

    try {
      // Use face-api.js for detection
      const fullFaceDescriptions = await faceapi
        .detectAllFaces(
          videoEl,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
        ) // Adjust options as needed
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
        .withFaceDescriptors(); // Important for recognition

      dispatch(setDetectionError(null));

      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Aspect ratio scaling (same as before)
        const videoWidth = videoEl.videoWidth;
        const videoHeight = videoEl.videoHeight;
        const scale = Math.min(
          canvasWidth / videoWidth,
          canvasHeight / videoHeight
        );
        const drawWidth = videoWidth * scale;
        const drawHeight = videoHeight * scale;
        const offsetX = (canvasWidth - drawWidth) / 2;
        const offsetY = (canvasHeight - drawHeight) / 2;
        ctx.drawImage(videoEl, offsetX, offsetY, drawWidth, drawHeight);

        const facesForRedux: DetectedFace[] = [];

        // Resize results to match scaled display size on canvas
        const resizedResults = faceapi.resizeResults(fullFaceDescriptions, {
          width: videoWidth,
          height: videoHeight,
        });

        resizedResults.forEach((result, i) => {
          const { detection, expressions, age, gender, descriptor } = result;
          const box = detection.box; // This is the bounding box from face-api.js

          // Scale the box coordinates to the canvas
          const scaledBoxX = box.x * scale + offsetX;
          const scaledBoxY = box.y * scale + offsetY;
          const scaledBoxWidth = box.width * scale;
          const scaledBoxHeight = box.height * scale;

          ctx.strokeStyle = "#00FF00";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            scaledBoxX,
            scaledBoxY,
            scaledBoxWidth,
            scaledBoxHeight
          );

          // Prepare info to display
          const infoToDisplay: string[] = [];
          let recognizedName = "Unknown";

          if (faceMatcherRef.current && descriptor) {
            const bestMatch = faceMatcherRef.current.findBestMatch(descriptor);
            recognizedName =
              bestMatch.label === "unknown" ? "Unknown" : bestMatch.label;
            // infoToDisplay.push(`<span class="math-inline">\{recognizedName\} \(</span>{bestMatch.distance.toFixed(2)})`); // Name and distance
            infoToDisplay.push(`${recognizedName}`);
          } else {
            infoToDisplay.push(recognizedName);
          }

          if (age) infoToDisplay.push(`Age: ${Math.round(age)}`);
          if (gender)
            infoToDisplay.push(
              `Gender: ${gender} (${Math.round(
                result.genderProbability! * 100
              )}%)`
            );

          let primaryEmotion = "";
          if (expressions) {
            let maxConfidence = 0;
            for (const [emotion, confidence] of Object.entries(expressions)) {
              if ((confidence as number) > maxConfidence) {
                maxConfidence = confidence as number;
                primaryEmotion = emotion;
              }
            }
            if (primaryEmotion)
              infoToDisplay.push(`Emotion: ${primaryEmotion}`);
          }

          // Draw the info text above the box
          ctx.fillStyle = "#00FF00";
          ctx.font = "14px Arial";
          let textY =
            scaledBoxY > 20
              ? scaledBoxY - 5
              : scaledBoxY + scaledBoxHeight + 15;
          for (let j = infoToDisplay.length - 1; j >= 0; j--) {
            // Draw from bottom up
            ctx.fillText(infoToDisplay[j], scaledBoxX, textY);
            textY -= 18; // Move up for the next line
          }

          facesForRedux.push({
            id: i,
            box: {
              topLeft: [scaledBoxX, scaledBoxY],
              bottomRight: [
                scaledBoxX + scaledBoxWidth,
                scaledBoxY + scaledBoxHeight,
              ],
            },
            confidence: detection.score,
            name:
              recognizedName !== "Unknown"
                ? recognizedName.split(" (")[0]
                : undefined, // Clean up name if distance is included
            age: Math.round(age),
            gender: gender,
            emotion: primaryEmotion,
          });
        });
        dispatch(updateDetectedFaces(facesForRedux));
      }
    } catch (err) {
      console.error("Error during face-api.js detection:", err);
      dispatch(
        setDetectionError(
          `Error detecting faces: ${
            err instanceof Error ? err.message : String(err)
          }`
        )
      );
    }

    animationFrameId.current = requestAnimationFrame(runDetection);
  }, [dispatch]); // Add other dependencies if needed, e.g., videoDimensions if they affect drawing scale directly in here

  // --- Webcam Start/Stop Logic ---
  useEffect(() => {
    const startWebcam = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        dispatch(setWebcamRunning(false));
        dispatch(
          setDetectionError("getUserMedia() is not supported by your browser.")
        );
        return;
      }

      try {
        dispatch(setDetectionError(null)); // Clear previous errors
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: {
            width: videoDimensions.width,
            height: videoDimensions.height,
          },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          await videoRef.current.play(); // Wait for play to start

          // Set canvas dimensions once video metadata is loaded
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              const track = streamRef.current?.getVideoTracks()[0];
              const settings = track?.getSettings();
              const vw = settings?.width ?? videoDimensions.width;
              const vh = settings?.height ?? videoDimensions.height;
              setVideoDimensions({ width: vw, height: vh }); // Update state if needed
              if (canvasRef.current) {
                // Set canvas size to match video aspect ratio container
                const aspectRatio = vw / vh;
                const containerWidth =
                  canvasRef.current.parentElement?.clientWidth ?? vw;
                canvasRef.current.width = containerWidth;
                canvasRef.current.height = containerWidth / aspectRatio;
              }
            }
          };

          // Start detection loop only *after* model is loaded and webcam is running
          if (modelsLoadedRef.current) {
            animationFrameId.current = requestAnimationFrame(runDetection);
          } else {
            console.log(
              "Waiting for model to load before starting detection loop..."
            );
            // The loop will start naturally when the model loads if isWebcamRunning is true
          }
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        dispatch(
          setDetectionError(
            `Failed to access webcam: ${
              err instanceof Error ? err.message : String(err)
            }`
          )
        );
        dispatch(setWebcamRunning(false));
      }
    };

    const stopWebcam = () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      // Clear canvas
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      // Redux state (isWebcamRunning, detectedFaces) is reset via the setWebcamRunning(false) action
    };

    if (isWebcamRunning) {
      // Check if model is loaded before starting webcam & detection
      if (!isModelLoading && modelsLoadedRef.current) {
        startWebcam();
      } else if (!isModelLoading && !modelsLoadedRef.current && !modelError) {
        // Model hasn't loaded yet, wait. Detection loop will start when model is ready.
        console.log("Webcam started, waiting for model load...");
      } else if (modelError) {
        console.error("Cannot start webcam - model loading failed.");
        dispatch(setWebcamRunning(false)); // Ensure state reflects reality
      }
    } else {
      stopWebcam();
    }

    // Cleanup function
    return () => {
      stopWebcam();
    };
    // Ensure runDetection is stable or included if it changes based on external state
  }, [
    isWebcamRunning,
    isModelLoading,
    modelError,
    dispatch,
    runDetection,
    videoDimensions.width,
    videoDimensions.height,
  ]);

  // Add effect to start detection loop if webcam is already running when model finishes loading
  useEffect(() => {
    if (
      isWebcamRunning &&
      !isModelLoading &&
      modelsLoadedRef.current &&
      !animationFrameId.current
    ) {
      console.log(
        "Model loaded while webcam was running. Starting detection loop."
      );
      animationFrameId.current = requestAnimationFrame(runDetection);
    }
  }, [isWebcamRunning, isModelLoading, runDetection]);

  return (
    <div className="webcam-container">
      {modelError && <Alert variant="danger">Model Error: {modelError}</Alert>}
      {detectionError && (
        <Alert variant="warning">Detection Error: {detectionError}</Alert>
      )}

      <div
        className="video-canvas-wrapper"
        style={{
          position: "relative",
          maxWidth: `${videoDimensions.width}px`,
          margin: "0 auto",
        }}
      >
        {/* Video element (can be hidden visually, but needed for input) */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted // Mute to avoid feedback loops if audio was requested
          style={{ display: "none", width: "100%", height: "auto" }} // Hide the video element itself
        />
        {/* Canvas for drawing video and overlays */}
        <canvas
          ref={canvasRef}
          className="overlay-canvas" // Add class for potential styling
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            background: "#333",
          }} // Canvas visible
        />
        {isWebcamRunning && !modelsLoadedRef.current && isModelLoading && (
          <div className="loading-overlay">Loading Model...</div>
        )}
      </div>
    </div>
  );
};

export default WebcamFeed;

// Add some basic CSS (e.g., src/components/WebcamFeed.css)
/*
.webcam-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.video-canvas-wrapper {
    position: relative;
    width: 100%;
    max-width: 640px; // Or dynamically set based on video
}

.overlay-canvas {
    display: block;
    width: 100%;
    height: auto; // Maintain aspect ratio
    background-color: #eee; // Background while loading/stopped
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
}
*/
