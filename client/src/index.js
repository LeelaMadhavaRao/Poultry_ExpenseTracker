import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import ErrorBoundary from "./components/common/ErrorBoundary"
import { LanguageProvider } from "./i18n/i18n"
import App from "./App"
import "./utils/animations.css"
import * as serviceWorkerRegistration from "./serviceWorkerRegistration"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                fontFamily: "'Manrope', sans-serif",
                fontSize: 14,
              },
            }}
          />
        </BrowserRouter>
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
)

serviceWorkerRegistration.register()
