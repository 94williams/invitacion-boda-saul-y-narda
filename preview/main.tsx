import { createRoot } from "react-dom/client";
import Invitation from "../app/invitation";
import "../app/globals.css";
import "../app/gifts.css";
import "../app/motion.css";

const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el contenedor de la invitación.");

createRoot(root).render(<Invitation previewOnly={true} />);
