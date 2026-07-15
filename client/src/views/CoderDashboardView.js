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

export class CoderDashboardView {
  constructor(root) {
    this.root = root;
  }

  render(user) {
    this.root.innerHTML = `
      <div class="dashboard-layout">
        <aside class="sidebar">
          <div>
            <p class="eyebrow">LEARNING PORTAL</p>
            <h1>MENTOR</h1>
          </div>

          <nav class="sidebar-nav">
            <a class="nav-link active" href="#/coder">Dashboard</a>
            <a class="nav-link" href="#/profile">Profile</a>
          </nav>

          <div class="sidebar-user">
            <strong>${user.firstName} ${user.lastName}</strong>
            <span>Coder · ${user.clanName || "No clan"}</span>
            <button id="logout-button" class="text-button" type="button">Logout</button>
          </div>
        </aside>

        <main class="dashboard-main">
          <header class="dashboard-header">
            <div>
              <p class="eyebrow">CODER DASHBOARD</p>
              <h2>Hello, ${user.firstName}</h2>
              <p>Describe the academic support you need.</p>
            </div>
            <a class="secondary-button" href="#/profile">Edit profile</a>
          </header>

          <div id="dashboard-message" class="message hidden" aria-live="polite"></div>

          <section class="content-grid coder-grid">
            <article class="panel-card">
              <h3>New mentorship request</h3>
              <p class="card-description">
                The topic and description help the Mentor prepare the session.
              </p>

              <form id="request-form" class="form-stack">
                <label class="form-group">
                  <span>Topic</span>
                  <input
                    id="request-topic"
                    class="form-input"
                    maxlength="150"
                    placeholder="Example: JavaScript events"
                    required
                  />
                </label>

                <label class="form-group">
                  <span>Description of the need</span>
                  <textarea
                    id="request-description"
                    class="form-input"
                    rows="6"
                    placeholder="Explain what you have tried and where you are blocked."
                    required
                  ></textarea>
                </label>

                <button id="create-request-button" class="primary-button" type="submit">
                  Submit request
                </button>
              </form>
            </article>

            <section>
              <div class="section-heading">
                <div>
                  <h3>My requests</h3>
                  <p>Track each request from creation to completion.</p>
                </div>
              </div>

              <div id="request-list" class="card-list"></div>
            </section>
          </section>
        </main>
      </div>
    `;
  }

  bindEvents({ onCreate, onEdit, onDelete, onLogout }) {
    this.root.querySelector("#request-form").addEventListener("submit", (event) => {
      event.preventDefault();

      onCreate({
        topic: this.root.querySelector("#request-topic").value,
        description: this.root.querySelector("#request-description").value
      });
    });

    this.root.querySelector("#request-list").addEventListener("click", (event) => {
      const editButton = event.target.closest("[data-action='edit']");
      const deleteButton = event.target.closest("[data-action='delete']");

      if (editButton) {
        onEdit(Number(editButton.dataset.id));
      }

      if (deleteButton) {
        onDelete(Number(deleteButton.dataset.id));
      }
    });

    this.root.querySelector("#logout-button").addEventListener("click", onLogout);
  }

  renderRequests(requests) {
    const list = this.root.querySelector("#request-list");

    if (requests.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <strong>No requests yet</strong>
          <p>Create your first mentorship request using the form.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = requests
      .map(
        (request) => `
          <article class="request-card" data-request-id="${request.id}">
            <div class="request-card-header">
              <div>
                <h4>${request.topic}</h4>
                <p>${request.description}</p>
              </div>
              <span class="${statusClass(request.status)}">${request.status}</span>
            </div>

            <dl class="request-details">
              <div>
                <dt>Mentor</dt>
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

            ${
              request.status === "PENDING"
                ? `
                  <div class="card-actions">
                    <button
                      class="secondary-button"
                      data-action="edit"
                      data-id="${request.id}"
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      class="danger-button"
                      data-action="delete"
                      data-id="${request.id}"
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                `
                : ""
            }
          </article>
        `
      )
      .join("");
  }

  getRequestForEdit(id) {
    const card = this.root.querySelector(`[data-request-id="${id}"]`);

    if (!card) return null;

    return {
      topic: card.querySelector("h4").textContent,
      description: card.querySelector(".request-card-header p").textContent
    };
  }

  resetForm() {
    this.root.querySelector("#request-form").reset();
  }

  setCreating(loading) {
    const button = this.root.querySelector("#create-request-button");
    button.disabled = loading;
    button.textContent = loading ? "Submitting..." : "Submit request";
  }

  showMessage(message, type = "success") {
    const box = this.root.querySelector("#dashboard-message");
    box.textContent = message;
    box.className = `message message-${type}`;
  }
}
