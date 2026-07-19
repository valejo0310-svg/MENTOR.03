function statusClass(status) {
  return `status-badge status-${status.toLowerCase()}`;
}

function formatDate(value) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

// Renders the mentor dashboard for reviewing and managing mentorship requests.
// Renderiza el dashboard del mentor para revisar y gestionar solicitudes de mentoría.
export class MentorDashboardView {
  constructor(root) {
    this.root = root;
  }

  render(user) {
    // Builds the mentor interface for accepting, rejecting, and completing requests.
    // Construye la interfaz del mentor para aceptar, rechazar y completar solicitudes.
    this.root.innerHTML = `
      <div class="dashboard-layout">
        <aside class="sidebar">
          <div>
            <p class="eyebrow">MENTOR PORTAL</p>
            <h1>MENTOR</h1>
          </div>

          <nav class="sidebar-nav">
            <a class="nav-link active" href="#/mentor">Dashboard</a>
            <a class="nav-link" href="#/profile">Profile</a>
          </nav>

          <div class="sidebar-user">
            <strong>${user.firstName} ${user.lastName}</strong>
            <span>Mentor</span>
            <button id="logout-button" class="text-button" type="button">Logout</button>
          </div>
        </aside>

        <main class="dashboard-main">
          <header class="dashboard-header">
            <div>
              <p class="eyebrow">MENTOR DASHBOARD</p>
              <h2>Hello, ${user.firstName}</h2>
              <p>Review requests, schedule sessions and record results.</p>
            </div>
            <a class="secondary-button" href="#/profile">Edit profile</a>
          </header>

          <div id="dashboard-message" class="message hidden" aria-live="polite"></div>

          <section>
            <div class="section-heading">
              <div>
                <h3>Mentorship requests</h3>
                <p>Pending requests appear first.</p>
              </div>
            </div>

            <div id="request-list" class="card-list"></div>
          </section>
        </main>
      </div>
    `;
  }

  bindEvents({ onStatusChange, onLogout }) {
    // Connects mentor actions such as accept, reject, and complete to the controller.
    // Conecta las acciones del mentor como aceptar, rechazar y completar con el controlador.
    this.root.querySelector("#request-list").addEventListener("click", (event) => {
      const button = event.target.closest("[data-status]");

      if (!button) return;

      const card = button.closest("[data-request-id]");
      const status = button.dataset.status;
      const id = Number(card.dataset.requestId);

      onStatusChange(id, {
        status,
        scheduledAt: card.querySelector("[data-field='scheduledAt']")?.value || null,
        observations: card.querySelector("[data-field='observations']")?.value || ""
      });
    });

    this.root.querySelector("#logout-button").addEventListener("click", onLogout);
  }

  renderRequests(requests) {
    const list = this.root.querySelector("#request-list");

    if (requests.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <strong>No mentorship requests</strong>
          <p>New requests will appear here.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = requests
      .map((request) => this.requestTemplate(request))
      .join("");
  }

  requestTemplate(request) {
    const pendingActions = request.status === "PENDING"
      ? `
        <div class="mentor-form">
          <label class="form-group">
            <span>Session date</span>
            <input
              class="form-input"
              data-field="scheduledAt"
              type="datetime-local"
            />
          </label>

          <label class="form-group">
            <span>Observations</span>
            <textarea
              class="form-input"
              data-field="observations"
              rows="3"
              placeholder="Topics, preparation or reason for rejection"
            ></textarea>
          </label>

          <div class="card-actions">
            <button class="primary-button compact" data-status="ACCEPTED" type="button">
              Accept and schedule
            </button>
            <button class="danger-button" data-status="REJECTED" type="button">
              Reject
            </button>
          </div>
        </div>
      `
      : "";

    const acceptedActions = request.status === "ACCEPTED"
      ? `
        <div class="mentor-form">
          <label class="form-group">
            <span>Final observations</span>
            <textarea
              class="form-input"
              data-field="observations"
              rows="3"
              placeholder="Record the result of the session"
            >${request.observations}</textarea>
          </label>

          <button class="primary-button compact" data-status="COMPLETED" type="button">
            Mark as completed
          </button>
        </div>
      `
      : "";

    return `
      <article class="request-card" data-request-id="${request.id}">
        <div class="request-card-header">
          <div>
            <p class="request-owner">
              ${request.coder.name} · ${request.coder.clan}
            </p>
            <h4>${request.topic}</h4>
            <p>${request.description}</p>
          </div>
          <span class="${statusClass(request.status)}">${request.status}</span>
        </div>

        <dl class="request-details">
          <div>
            <dt>Assigned Mentor</dt>
            <dd>${request.mentor?.name || "Not assigned"}</dd>
          </div>
          <div>
            <dt>Scheduled date</dt>
            <dd>${formatDate(request.scheduledAt)}</dd>
          </div>
          <div>
            <dt>Observations</dt>
            <dd>${request.observations || "No observations"}</dd>
          </div>
        </dl>

        ${pendingActions}
        ${acceptedActions}
      </article>
    `;
  }

  showMessage(message, type = "success") {
    const box = this.root.querySelector("#dashboard-message");
    box.textContent = message;
    box.className = `message message-${type}`;
  }
}
