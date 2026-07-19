// Renders the profile screen and the personal goals experience for the user.
// Renderiza la pantalla de perfil y la experiencia de metas personales del usuario.
export class ProfileView {
  constructor(root) {
    this.root = root;
  }

  render({ user, clans }) {
    // Builds the profile form and the goals section with the current user data.
    // Construye el formulario de perfil y la sección de metas con los datos actuales del usuario.
    const dashboardRoute = user.role === "CODER" ? "#/coder" : "#/mentor";

    this.root.innerHTML = `
      <div class="dashboard-layout">
        <aside class="sidebar">
          <div>
            <p class="eyebrow">USER PROFILE</p>
            <h1>MENTOR</h1>
          </div>

          <nav class="sidebar-nav">
            <a class="nav-link" href="${dashboardRoute}">Dashboard</a>
            <a class="nav-link active" href="#/profile">Profile</a>
          </nav>

          <div class="sidebar-user">
            <strong>${user.firstName} ${user.lastName}</strong>
            <span>${user.role}</span>
            <button id="logout-button" class="text-button" type="button">Logout</button>
          </div>
        </aside>

        <main class="dashboard-main narrow-content">
          <header class="dashboard-header">
            <div>
              <p class="eyebrow">PROFILE</p>
              <h2>Personal information</h2>
              <p>Keep the data used by the mentorship process updated.</p>
            </div>
          </header>

          <div id="profile-message" class="message hidden" aria-live="polite"></div>

          <article class="panel-card">
            <form id="profile-form" class="form-stack">
              <div class="form-grid">
                <label class="form-group">
                  <span>First name</span>
                  <input
                    id="profile-first-name"
                    class="form-input"
                    value="${user.firstName}"
                    required
                  />
                </label>

                <label class="form-group">
                  <span>Last name</span>
                  <input
                    id="profile-last-name"
                    class="form-input"
                    value="${user.lastName}"
                    required
                  />
                </label>
              </div>

              <label class="form-group">
                <span>Email</span>
                <input class="form-input" value="${user.email}" disabled />
              </label>

              <label class="form-group">
                <span>Role</span>
                <input class="form-input" value="${user.role}" disabled />
              </label>

              ${
                user.role === "CODER"
                  ? `
                    <label class="form-group">
                      <span>Clan</span>
                      <select id="profile-clan" class="form-input" required>
                        ${clans
                          .map(
                            (clan) => `
                              <option
                                value="${clan.id}"
                                ${Number(user.clanId) === Number(clan.id) ? "selected" : ""}
                              >
                                ${clan.name}
                              </option>
                            `
                          )
                          .join("")}
                      </select>
                    </label>
                  `
                  : ""
              }

              <label class="form-group">
                <span>Biography</span>
                <textarea
                  id="profile-biography"
                  class="form-input"
                  rows="6"
                  placeholder="Write a short professional description"
                >${user.biography || ""}</textarea>
              </label>

              <button id="save-profile-button" class="primary-button" type="submit">
                Save changes
              </button>
            </form>
          </article>
                <section class="goals-section">
  <div class="section-header">
    <div>
      <h2>Personal goals</h2>
      <p>
        Create goals and track your personal progress.
      </p>
    </div>
  </div>

  <form id="goal-form" class="goal-form">
    <input id="goal-edit-id" type="hidden" value="" />

    <div class="form-group">
      <label for="goal-title">Goal title</label>

      <input
        id="goal-title"
        class="form-input"
        type="text"
        maxlength="150"
        placeholder="Example: Complete the JavaScript module"
        required
      />
    </div>

    <div class="form-group">
      <label for="goal-description">Description</label>

      <textarea
        id="goal-description"
        class="form-input"
        rows="4"
        placeholder="Describe what you want to achieve"
      ></textarea>
    </div>

    <div class="form-group">
      <label for="goal-due-date">Due date</label>

      <input
        id="goal-due-date"
        class="form-input"
        type="date"
        required
      />
    </div>

    <div class="goal-form-actions">
      <button
        id="goal-submit-button"
        class="primary-button"
        type="submit"
      >
        Add goal
      </button>

      <button
        id="goal-cancel-button"
        class="secondary-button hidden"
        type="button"
      >
        Cancel
      </button>
    </div>
  </form>

  <p
    id="goals-message"
    class="message hidden"
    aria-live="polite"
  ></p>

  <div id="goals-list" class="goals-list"></div>
</section>
        </main>
      </div>

    `;
  }

  bindEvents({ onSave, onLogout }) {
    // Wires the profile form and logout button to the controller callbacks.
    // Conecta el formulario de perfil y el botón de logout con los callbacks del controlador.
    this.root.querySelector("#profile-form").addEventListener("submit", (event) => {
      event.preventDefault();

      onSave({
        firstName: this.root.querySelector("#profile-first-name").value,
        lastName: this.root.querySelector("#profile-last-name").value,
        biography: this.root.querySelector("#profile-biography").value,
        clanId: this.root.querySelector("#profile-clan")?.value || null
      });
    });

    this.root.querySelector("#logout-button").addEventListener("click", onLogout);
  }

  setLoading(loading) {
    const button = this.root.querySelector("#save-profile-button");
    button.disabled = loading;
    button.textContent = loading ? "Saving..." : "Save changes";
  }

  showMessage(message, type = "success") {
    const box = this.root.querySelector("#profile-message");
    box.textContent = message;
    box.className = `message message-${type}`;
  }
  getGoalData() {
    return {
      title: this.root.querySelector("#goal-title").value.trim(),
      description: this.root.querySelector("#goal-description").value.trim(),
      dueDate: this.root.querySelector("#goal-due-date").value
    };
  }

  getEditingGoalId() {
    const editingGoalId = this.root.querySelector("#goal-edit-id").value;
    return editingGoalId ? Number(editingGoalId) : null;
  }

  clearGoalForm() {
    const form = this.root.querySelector("#goal-form");
    form.reset();
    this.root.querySelector("#goal-edit-id").value = "";
    this.root.querySelector("#goal-submit-button").textContent = "Add goal";
    this.root.querySelector("#goal-cancel-button").classList.add("hidden");
  }

  populateGoalForm(goal) {
    this.root.querySelector("#goal-edit-id").value = goal.id;
    this.root.querySelector("#goal-title").value = goal.title;
    this.root.querySelector("#goal-description").value = goal.description;
    this.root.querySelector("#goal-due-date").value = goal.dueDate;
    this.root.querySelector("#goal-submit-button").textContent = "Save changes";
    this.root.querySelector("#goal-cancel-button").classList.remove("hidden");
  }

  renderGoals(goals) {
    const goalsList = this.root.querySelector("#goals-list");

    if (!goals.length) {
      goalsList.innerHTML = `
        <div class="empty-state">
          <p>You do not have personal goals yet.</p>
        </div>
      `;

      return;
    }

    goalsList.innerHTML = goals
      .map((goal) => {
        const dueDate = new Date(
          `${goal.due_date}T00:00:00`
        );

        const formattedDate =
          dueDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });

        return `
          <article
            class="goal-item ${
              goal.completed
                ? "goal-completed"
                : ""
            }"
            data-goal-id="${goal.id}"
            data-title="${this.escapeAttribute(goal.title)}"
            data-description="${this.escapeAttribute(goal.description || "")}" 
            data-due-date="${goal.due_date || ""}"
          >
            <label class="goal-check">
              <input
                class="goal-checkbox"
                type="checkbox"
                data-goal-id="${goal.id}"
                ${goal.completed ? "checked" : ""}
              />

              <span class="goal-checkmark"></span>
            </label>

            <div class="goal-content">
              <div class="goal-title-row">
                <h3>${this.escapeHtml(goal.title)}</h3>

                <time datetime="${goal.due_date}">
                  ${formattedDate}
                </time>
              </div>

              <p>
                ${
                  this.escapeHtml(goal.description) ||
                  "No description"
                }
              </p>
            </div>

            <div class="goal-actions">
              <button
                class="goal-edit-button"
                type="button"
                data-goal-id="${goal.id}"
              >
                Edit
              </button>

              <button
                class="goal-delete-button"
                type="button"
                data-goal-id="${goal.id}"
                aria-label="Delete goal"
              >
                Delete
              </button>
            </div>
          </article>
        `;
      })
      .join("");
  }

  escapeAttribute(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;");
  }

  escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
showGoalMessage(message, type = "success") {
  const messageElement =
    document.getElementById("goals-message");

  messageElement.textContent = message;

  messageElement.className =
    `message message-${type}`;
}
bindGoalEvents({
  onCreate,
  onEdit,
  onToggle,
  onDelete
}) {
  const form = this.root.querySelector("#goal-form");
  const goalsList = this.root.querySelector("#goals-list");
  const cancelButton = this.root.querySelector("#goal-cancel-button");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const editingGoalId = this.getEditingGoalId();

    if (editingGoalId) {
      await onEdit(editingGoalId, this.getGoalData());
      return;
    }

    await onCreate(this.getGoalData());
  });

  cancelButton.addEventListener("click", () => {
    this.clearGoalForm();
  });

  goalsList.addEventListener(
    "change",
    async (event) => {
      const checkbox =
        event.target.closest(".goal-checkbox");

      if (!checkbox) {
        return;
      }

      await onToggle(
        Number(checkbox.dataset.goalId),
        checkbox.checked
      );
    }
  );

  goalsList.addEventListener(
    "click",
    async (event) => {
      const editButton = event.target.closest(".goal-edit-button");

      if (editButton) {
        const goalItem = editButton.closest(".goal-item");

        this.populateGoalForm({
          id: Number(editButton.dataset.goalId),
          title: goalItem.dataset.title || "",
          description: goalItem.dataset.description || "",
          dueDate: goalItem.dataset.dueDate || ""
        });

        return;
      }

      const deleteButton =
        event.target.closest(
          ".goal-delete-button"
        );

      if (!deleteButton) {
        return;
      }

      const confirmed = window.confirm(
        "Are you sure you want to delete this goal?"
      );

      if (!confirmed) {
        return;
      }

      await onDelete(
        Number(deleteButton.dataset.goalId)
      );
    }
  );
};
}
