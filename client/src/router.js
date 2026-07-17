import { AuthView } from "./views/AuthView.js";
import { CoderDashboardView } from "./views/CoderDashboardView.js";
import { MentorDashboardView } from "./views/MentorDashboardView.js";
import { ProfileView } from "./views/ProfileView.js";
import { AdminDashboardView } from "./views/AdminDashboardView.js";

import { AuthController } from "./controllers/AuthController.js";
import { MentorshipController } from "./controllers/MentorshipController.js";
import { ProfileController } from "./controllers/ProfileController.js";
import { AdminController } from "./controllers/AdminController.js";

export class AppRouter {
  constructor({
    root,
    api
  }) {
    // Elemento principal donde se renderizan las vistas.
    this.root = root;

    // Servicio utilizado para comunicarse con la API.
    this.api = api;

    // Guarda una referencia al controlador activo.
    this.currentController = null;
  }

  start() {
    // Cada vez que cambia la URL con hash,
    // el router vuelve a renderizar la vista.
    window.addEventListener(
      "hashchange",
      () => this.render()
    );

    // Si no hay una ruta definida,
    // se envía al usuario al login.
    if (!window.location.hash) {
      this.navigate("/login");
      return;
    }

    this.render();
  }

  navigate(path) {
    // Convierte "/login" en "#/login".
    window.location.hash = `#${path}`;
  }

  goToDashboard(role) {
    // Relaciona cada rol con su dashboard.
    const dashboards = {
      CODER: "/coder",
      MENTOR: "/mentor",
      ADMIN: "/admin"
    };

    // Si el rol no existe, vuelve al login.
    this.navigate(
      dashboards[role] || "/login"
    );
  }

  async getSession() {
    try {
      // Consulta al backend quién está autenticado.
      // La cookie con el JWT se envía automáticamente
      // desde ApiService mediante credentials: "include".
      const response = await this.api.get(
        "/auth/me"
      );

      return response.data;
    } catch {
      // Si no existe una sesión válida,
      // devuelve null.
      return null;
    }
  }

  async render() {
    // Obtiene la ruta después del símbolo #.
    //
    // Ejemplo:
    // #/admin se convierte en /admin.
    const path =
      window.location.hash.slice(1)
      || "/login";

    // Consulta al usuario autenticado.
    const user =
      await this.getSession();

    /*
     * RUTAS PÚBLICAS:
     * /login
     * /register
     */
    if (
      [
        "/login",
        "/register"
      ].includes(path)
    ) {
      // Si ya existe una sesión,
      // no se muestra nuevamente el login.
      if (user) {
        this.goToDashboard(
          user.role
        );

        return;
      }

      const view =
        new AuthView(
          this.root
        );

      this.currentController =
        new AuthController({
          api: this.api,
          router: this,
          view,

          initialTab:
            path === "/register"
              ? "register"
              : "login"
        });

      await this.currentController
        .init();

      return;
    }

    /*
     * Desde este punto todas las rutas
     * necesitan una sesión válida.
     */
    if (!user) {
      this.navigate("/login");
      return;
    }

    /*
     * DASHBOARD DEL CODER
     */
    if (path === "/coder") {
      // Solo un CODER puede entrar.
      if (
        user.role !== "CODER"
      ) {
        this.goToDashboard(
          user.role
        );

        return;
      }

      const view =
        new CoderDashboardView(
          this.root
        );

      this.currentController =
        new MentorshipController({
          api: this.api,
          router: this,
          view,
          user
        });

      await this.currentController
        .init();

      return;
    }

    /*
     * DASHBOARD DEL MENTOR
     */
    if (path === "/mentor") {
      // Solo un MENTOR puede entrar.
      if (
        user.role !== "MENTOR"
      ) {
        this.goToDashboard(
          user.role
        );

        return;
      }

      const view =
        new MentorDashboardView(
          this.root
        );

      this.currentController =
        new MentorshipController({
          api: this.api,
          router: this,
          view,
          user
        });

      await this.currentController
        .init();

      return;
    }

    /*
     * DASHBOARD DEL ADMINISTRADOR
     */
    if (path === "/admin") {
      // Solo un ADMIN puede entrar.
      if (user.role !== "ADMIN") {
        this.goToDashboard(
          user.role
        );

        return;
      }

      const view =
        new AdminDashboardView(
          this.root
        );

      this.currentController =
        new AdminController({
          api: this.api,
          router: this,
          view,
          user
        });

      await this.currentController
        .init();

      return;
    }

    /*
     * PERFIL
     *
     * Puede ser consultado por:
     * CODER
     * MENTOR
     * ADMIN
     */
    if (path === "/profile") {
      const view =
        new ProfileView(
          this.root
        );

      this.currentController =
        new ProfileController({
          api: this.api,
          router: this,
          view,
          user
        });

      await this.currentController
        .init();

      return;
    }

    /*
     * RUTA NO ENCONTRADA
     */
    this.root.innerHTML = `
      <section class="not-found">
        <h1>404</h1>

        <p>
          The requested page does not exist.
        </p>

        <a
          class="primary-button inline-button"
          href="#/login"
        >
          Return
        </a>
      </section>
    `;
  }
}