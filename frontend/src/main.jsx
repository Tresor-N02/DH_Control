import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import UiThemeProvider from "./context/UiThemeProvider";

import { AuthProvider } from "./context/AuthContext";
import { DroneProvider } from "./context/DroneContext";

import "./index.css";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UiThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <DroneProvider>
            <App />
          </DroneProvider>
        </AuthProvider>
      </BrowserRouter>
    </UiThemeProvider>
  </React.StrictMode>,
);
