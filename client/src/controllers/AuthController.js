export class AuthController {
  constructor({ api, router, view, initialTab }) {
    this.api = api;
    this.router = router;
    this.view = view;
    this.initialTab = initialTab;
  }

  async init() {
    try {
      const response = await this.api.get("/users/clans");

      this.view.render({
        initialTab: this.initialTab,
        clans: response.data
      });

      this.view.prepareButtons();
      this.view.bindEvents({
        onLogin: (data) => this.login(data),
        onRegister: (data) => this.register(data)
      });
    } catch (error) {
      this.view.render({ initialTab: this.initialTab, clans: [] });
      this.view.prepareButtons();
      this.view.showMessage(error.message);
    }
  }

  async login(data) {
    this.view.clearMessage();
    this.view.setLoading("login-button", true);

    try {
      const response = await this.api.post("/auth/login", data);
      this.router.goToDashboard(response.data.role);
    } catch (error) {
      this.view.showMessage(error.message);
    } finally {
      this.view.setLoading("login-button", false);
    }
  }

  async register(data) {
    this.view.clearMessage();

    if (data.password !== data.confirmPassword) {
      this.view.showMessage("The passwords do not match.");
      return;
    }

    this.view.setLoading("register-button", true);

    try {
      const response = await this.api.post("/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        clanId: data.clanId
      });

      this.router.goToDashboard(response.data.role);
    } catch (error) {
      this.view.showMessage(error.message);
    } finally {
      this.view.setLoading("register-button", false);
    }
  }
}
