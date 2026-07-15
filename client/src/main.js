import "./styles.css";
import { ApiService } from "./services/ApiService.js";
import { AppRouter } from "./router.js";

// Boots the client app by creating the API client and the router.
// Inicializa la app del cliente creando el cliente de API y el enrutador.
const root = document.querySelector("#app");
const api = new ApiService("/api");
const router = new AppRouter({ root, api });

router.start();
