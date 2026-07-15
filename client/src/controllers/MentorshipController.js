// Coordinates mentorship request operations for coders and mentors.
// Coordina las operaciones de solicitudes de mentoría para coders y mentors.
export class MentorshipController {
  constructor({ api, router, view, user }) {
    this.api = api;
    this.router = router;
    this.view = view;
    this.user = user;
    this.requests = [];
  }

  async init() {
    this.view.render(this.user);
    this.view.bindEvents({
      onCreate: (data) => this.createRequest(data),
      onEdit: (id) => this.editRequest(id),
      onDelete: (id) => this.deleteRequest(id),
      onStatusChange: (id, data) => this.changeStatus(id, data),
      onLogout: () => this.logout()
    });

    await this.loadRequests();
  }

  async loadRequests() {
    // Fetches the current list of mentorship requests from the backend.
    // Obtiene la lista actual de solicitudes de mentoría desde el backend.
    try {
      const response = await this.api.get("/mentorships");
      this.requests = response.data;
      this.view.renderRequests(this.requests);
    } catch (error) {
      this.view.showMessage(error.message, "error");
    }
  }

  async createRequest(data) {
    this.view.setCreating?.(true);

    try {
      const response = await this.api.post("/mentorships", data);
      this.view.showMessage(response.message);
      this.view.resetForm?.();
      await this.loadRequests();
    } catch (error) {
      this.view.showMessage(error.message, "error");
    } finally {
      this.view.setCreating?.(false);
    }
  }

  async editRequest(id) {
    const request = this.requests.find((item) => item.id === id);

    if (!request) return;

    const topic = window.prompt("Edit the topic:", request.topic);
    if (topic === null) return;

    const description = window.prompt(
      "Edit the description:",
      request.description
    );
    if (description === null) return;

    try {
      const response = await this.api.patch(`/mentorships/${id}`, {
        topic,
        description
      });

      this.view.showMessage(response.message);
      await this.loadRequests();
    } catch (error) {
      this.view.showMessage(error.message, "error");
    }
  }

  async deleteRequest(id) {
    const confirmed = window.confirm(
      "Delete this pending mentorship request?"
    );

    if (!confirmed) return;

    try {
      const response = await this.api.delete(`/mentorships/${id}`);
      this.view.showMessage(response.message);
      await this.loadRequests();
    } catch (error) {
      this.view.showMessage(error.message, "error");
    }
  }

  async changeStatus(id, data) {
    try {
      const response = await this.api.patch(`/mentorships/${id}`, data);
      this.view.showMessage(response.message);
      await this.loadRequests();
    } catch (error) {
      this.view.showMessage(error.message, "error");
    }
  }

  async logout() {
    try {
      await this.api.post("/auth/logout");
    } finally {
      this.router.navigate("/login");
    }
  }
}
