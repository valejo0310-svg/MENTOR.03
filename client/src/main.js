import "./styles.css";
import { ApiService } from "./services/ApiService.js";
import { AppRouter } from "./router.js";

const root = document.querySelector("#app");
const api = new ApiService("/api");
const router = new AppRouter({ root, api });

router.start();
