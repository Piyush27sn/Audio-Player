import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="462011894876-r8grf4sjrq027ncjp09pe4uva945ar59.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);