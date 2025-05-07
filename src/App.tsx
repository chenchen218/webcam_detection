// src/App.tsx
import React from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import Controls from "./components/Controls";
import WebcamFeed from "./components/WebcamFeed";
import FaceInfo from "./components/FaceInfo";
import { useAppSelector } from "./store/store"; // Use the typed hook

import "./App.css"; // Import component-specific styles (optional)

function App() {
  // Select relevant state parts if needed at this top level (e.g., global errors)
  const { modelError } = useAppSelector((state) => state.faceDetect);

  return (
    <Container fluid className="app-container py-3 py-md-4">
      <Row className="justify-content-center">
        {/* Adjust column width for different screen sizes */}
        <Col xs={12} sm={11} md={10} lg={9} xl={8}>
          <Card className="shadow-sm">
            <Card.Header as="h2" className="text-center fw-light">
              Webcam Facial Detection Demo
            </Card.Header>
            <Card.Body>
              {/* Display critical model errors prominently */}
              {modelError && (
                <Alert variant="danger" className="text-center">
                  <b>Fatal Error:</b> {modelError}. Please try refreshing the
                  page or ensure your browser is up to date.
                </Alert>
              )}

              {/* Only show controls and feed if the model didn't fail to load */}
              {!modelError && (
                <>
                  <Controls />
                  <hr /> {/* Optional separator */}
                  <WebcamFeed />
                  <hr /> {/* Optional separator */}
                  <FaceInfo />
                </>
              )}

              {/* Placeholder area for Bonus features like image upload */}
              {/*
                            <hr />
                            <Row className="mt-3">
                                <Col>
                                    <ImageUploadComponent />
                                </Col>
                             </Row>
                            */}
            </Card.Body>
            <Card.Footer className="text-muted text-center small">
              Tech Stack: React | TypeScript | Redux Toolkit | Bootstrap |
              TensorFlow.js (BlazeFace)
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
