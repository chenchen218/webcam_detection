// src/components/FaceInfo.tsx
import React from "react";
import { Card, ListGroup, Alert } from "react-bootstrap";
import { useAppSelector } from "../store/store"; // Use typed hook

const FaceInfo: React.FC = () => {
  // Select the necessary state using the typed hook
  const { detectedFaces, isWebcamRunning, detectionError } = useAppSelector(
    (state) => state.faceDetect
  );

  // Determine what to display based on state
  const showInfo = isWebcamRunning && detectedFaces.length > 0;
  const showNoFacesMessage =
    isWebcamRunning && detectedFaces.length === 0 && !detectionError;
  const showStoppedMessage = !isWebcamRunning;

  return (
    <div className="mt-3 face-info-container">
      {/* Show detection errors if any */}
      {isWebcamRunning && detectionError && (
        <Alert variant="warning" className="text-center small">
          Detection Issue: {detectionError}
        </Alert>
      )}

      {/* Show info cards if faces are detected */}
      {showInfo && (
        <>
          <h5 className="text-center mb-3 text-secondary fw-light">
            Detected Faces ({detectedFaces.length})
          </h5>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {detectedFaces.map((face) => (
              <Card key={face.id} className="mb-2" style={{ width: "18rem" }}>
                {" "}
                {/* Example fixed width */}
                <Card.Header className="py-1 px-2 small">
                  Face #{face.id + 1}
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item className="py-1 px-2 small">
                    Confidence:{" "}
                    <span className="fw-bold">
                      {Math.round(face.confidence * 100)}%
                    </span>
                  </ListGroup.Item>
                  {/* Placeholder text for future features */}
                  <ListGroup.Item className="py-1 px-2 small text-muted fst-italic">
                    (Name/Age/Gender require additional models)
                  </ListGroup.Item>
                  {/*
                                      <ListGroup.Item>Age: ...</ListGroup.Item>
                                      <ListGroup.Item>Gender: ...</ListGroup.Item>
                                      <ListGroup.Item>Emotion: ...</ListGroup.Item>
                                      */}
                </ListGroup>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Show message when webcam is running but no faces are detected */}
      {showNoFacesMessage && (
        <p className="text-center text-muted mt-3">Scanning for faces...</p>
      )}

      {/* Show message when webcam is stopped */}
      {showStoppedMessage && (
        <p className="text-center text-muted mt-3">
          Webcam stopped. Start webcam to detect faces.
        </p>
      )}
    </div>
  );
};

export default FaceInfo;
