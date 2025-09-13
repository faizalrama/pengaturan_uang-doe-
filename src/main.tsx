import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDB } from "./lib/database.ts";

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(err => {
      console.error('Service Worker registration failed:', err);
    });
  });
}

// Initialize the database when the app starts
initDB().then(() => {
  console.log("Database initialized successfully!");
  createRoot(document.getElementById("root")!).render(<App />);
}).catch(error => {
  console.error("Failed to initialize database:", error);
  // Optionally render an error message to the user
  createRoot(document.getElementById("root")!).render(
    <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
      <h1>Error</h1>
      <p>Could not initialize the local database. The app cannot function without it.</p>
    </div>
  );
});
