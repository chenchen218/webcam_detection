// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store"; // Import the configured store
import App from "./App"; // Import the main App component
import reportWebVitals from "./reportWebVitals";

// Import global styles
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS FIRST
import "./index.css"; // Import custom global styles (optional)

// Find the root DOM element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

// Create a React root
const root = ReactDOM.createRoot(rootElement);

// Render the application
root.render(
  <React.StrictMode>
    {/* Wrap the entire App with the Redux Provider */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
