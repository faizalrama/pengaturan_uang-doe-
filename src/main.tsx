import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DBContextProvider } from "./contexts/DBContext.tsx";

createRoot(document.getElementById("root")!).render(
  <DBContextProvider>
    <App />
  </DBContextProvider>
);
