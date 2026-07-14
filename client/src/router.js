import { AuthView } from "./views/AuthView.js";
import { CoderDashboardView } from "./views/CoderDashboardView.js";
import { MentorDashboardView } from "./views/MentorDashboardView.js";
import { ProfileView } from "./views/ProfileView.js";
import { AuthController } from "./controllers/AuthController.js";
import { MentorshipController } from "./controllers/MentorshipController.js";
import { ProfileController } from "./controllers/ProfileController.js";

export class AppRouter {
  constructor({ root, api }) {
    this.root = root;
    this.api = api;
    this.currentController = null;
  }

  start() {
    window.addEventListener("hashchange", () => this.render());

    if (!window.location.hash) {
      this.navigate("/login");
      return;
    }

    this.render();
  }

  navigate(path) {
    window.location.hash = `#${path}`;
  }

  goToDashboard(role) {
    this.navigate(role === "CODER" ? "/coder" : "/mentor");
  }

  async getSession() {
    try {
      const response = await this.api.get("/auth/me");
      return response.data;
    } catch {
      return null;
    }
  }

  async render() {
    const path = window.location.hash.slice(1) || "/login";
    const user = await this.getSession();

    if (["/login", "/register"].includes(path)) {
      if (user) {
        this.goToDashboard(user.role);
        return;
      }

      const view = new AuthView(this.root);
      this.currentController = new AuthController({
        api: this.api,
        router: this,
        view,
        initialTab: path === "/register" ? "register" : "login"
      });

      await this.currentController.init();
      return;
    }

    if (!user) {
      this.navigate("/login");
      return;
    }

    if (path === "/coder") {
      if (user.role !== "CODER") {
        this.goToDashboard(user.role);
        return;
      }

      const view = new CoderDashboardView(this.root);
      this.currentController = new MentorshipController({
        api: this.api,
        router: this,
        view,
        user
      });

      await this.currentController.init();
      return;
    }

    if (path === "/mentor") {
      if (user.role !== "MENTOR") {
        this.goToDashboard(user.role);
        return;
      }

      const view = new MentorDashboardView(this.root);
      this.currentController = new MentorshipController({
        api: this.api,
        router: this,
        view,
        user
      });

      await this.currentController.init();
      return;
    }

    if (path === "/profile") {
      const view = new ProfileView(this.root);
      this.currentController = new ProfileController({
        api: this.api,
        router: this,
        view,
        user
      });

      await this.currentController.init();
      return;
    }

    this.root.innerHTML = `
      <section class="not-found">
        <h1>404</h1>
        <p>The requested page does not exist.</p>
        <a class="primary-button inline-button" href="#/login">Return</a>
      </section>
    `;
  }
}
