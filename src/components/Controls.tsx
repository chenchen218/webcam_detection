// src/components/Controls.tsx
import React from "react";
import { Button, Spinner } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../store/store"; // Use typed hooks
import { setWebcamRunning } from "../features/faceDetectSlice"; // Import action creator

const Controls: React.FC = () => {
  // Use typed hooks for dispatch and selector
  const dispatch = useAppDispatch();
  const { isWebcamRunning, isModelLoading, modelError } = useAppSelector(
    (state) => state.faceDetect
  );

  // Handler for the button click
  const handleToggleWebcam = () => {
    // Dispatch the action to toggle the webcam state
    dispatch(setWebcamRunning(!isWebcamRunning));
  };

  // Determine button text and state
  const buttonText = isWebcamRunning ? "Stop Webcam" : "Start Webcam";
  const buttonVariant = isWebcamRunning ? "danger" : "primary";

  // Disable button if model is loading or if there was a model loading error
  const isDisabled = isModelLoading || !!modelError;

  return (
    <div className="my-3 text-center">
      <Button
        variant={buttonVariant}
        onClick={handleToggleWebcam}
        disabled={isDisabled}
        size="lg" // Make button slightly larger
      >
        {/* Show spinner only when model is initially loading */}
        {isModelLoading && (
          <Spinner animation="border" size="sm" className="me-2" />
        )}
        {buttonText}
      </Button>
      {isModelLoading && (
        <p className="text-muted mt-2">Loading detection model...</p>
      )}
    </div>
  );
};

export default Controls;
