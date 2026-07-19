// Manages profile updates and personal goals for the authenticated user.
// Maneja actualizaciones de perfil y metas personales del usuario autenticado.
export class ProfileController {
  constructor({ api, router, view, user }) {
    this.api = api;
    this.router = router;
    this.view = view;
    this.user = user;
  }

  async init() {
    // Loads the profile data and the goals associated with the active user.
    // Carga los datos del perfil y las metas asociadas al usuario activo.
    try {
      const [profileResponse, clansResponse] = await Promise.all([
        this.api.get("/users/me"),
        this.api.get("/users/clans")
      ]);

      this.user = profileResponse.data;

      this.view.render({
        user: this.user,
        clans: clansResponse.data
      });

      this.view.bindEvents({
        onSave: (data) => this.save(data),
        onLogout: () => this.logout()
      });
    } catch (error) {
      this.router.navigate("/login");
    }
    this.view.bindGoalEvents({
      onCreate: (data) => this.createGoal(data),
      onEdit: (goalId, data) => this.editGoal(goalId, data),
      onToggle: (goalId, completed) => this.toggleGoal(goalId, completed),
      onDelete: (goalId) => this.deleteGoal(goalId)
    });

    await this.loadGoals();
  }

  async loadGoals() {
  try {
    const response =
      await this.api.get("/users/me/goals");

    this.view.renderGoals(response.data);
  } catch (error) {
    this.view.showGoalMessage(
      error.message,
      "error"
    );
  }
}
  async save(data) {
    this.view.setLoading(true);

    try {
      const response = await this.api.put("/users/me", data);
      this.user = response.data;
      this.view.showMessage(response.message);
    } catch (error) {
      this.view.showMessage(error.message, "error");
    } finally {
      this.view.setLoading(false);
    }
  }
  async createGoal(data) {
    try {
      await this.api.post(
        "/users/me/goals",
        data
      );

      this.view.clearGoalForm();

      this.view.showGoalMessage(
        "Goal created successfully.",
        "success"
      );

      await this.loadGoals();
    } catch (error) {
      this.view.showGoalMessage(
        error.message,
        "error"
      );
    }
  }

  async editGoal(goalId, data) {
    try {
      await this.api.patch(
        `/users/me/goals/${goalId}`,
        data
      );

      this.view.clearGoalForm();

      this.view.showGoalMessage(
        "Goal updated successfully.",
        "success"
      );

      await this.loadGoals();
    } catch (error) {
      this.view.showGoalMessage(
        error.message,
        "error"
      );
    }
  }

  async toggleGoal(goalId, completed) {
  try {
    await this.api.patch(
      `/users/me/goals/${goalId}`,
      { completed }
    );

    await this.loadGoals();
  } catch (error) {
    this.view.showGoalMessage(
      error.message,
      "error"
    );

    await this.loadGoals();
  }
}
async deleteGoal(goalId) {
  try {
    await this.api.delete(
      `/users/me/goals/${goalId}`
    );

    this.view.showGoalMessage(
      "Goal deleted successfully.",
      "success"
    );

    await this.loadGoals();
  } catch (error) {
    this.view.showGoalMessage(
      error.message,
      "error"
    );
  }
}

  async logout() {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas cerrar sesión?"
    );

    if (!confirmed) return;

    try {
      await this.api.post("/auth/logout");
    } finally {
      this.router.navigate("/login");
    }
  }
}
