// Renders the authentication experience for login and registration.
// Renderiza la experiencia de autenticación para login y registro.
export class AuthView {
  constructor(root) {
    this.root = root;
  }

  render({ initialTab = "login", clans = [] } = {}) {
    // Builds the auth interface and injects the available clans into the form.
    // Construye la interfaz de autenticación e inyecta los clanes disponibles en el formulario.
    this.root.innerHTML = `
      <section class="auth-page">
        <div class="auth-card">
          <aside class="auth-brand">
            <div>
             
              <h1>MENTOR</h1>
              <p>
                A simple platform where Coders request academic support and
                Mentors organize each session.
              </p>
            </div>

            <div class="brand-benefits">
              <article>
                <span>01</span>
                <div>
                  <strong>Request support</strong>
                  <p>Describe the topic and the problem you need to solve.</p>
                </div>
              </article>
              <article>
                <span>02</span>
                <div>
                  <strong>Organize the session</strong>
                  <p>The Mentor assigns a date and records observations.</p>
                </div>
              </article>
            </div>
          </aside>

          <div class="auth-panel">
            <div class="tab-list" role="tablist">
              <button
                id="login-tab"
                class="tab-button ${initialTab === "login" ? "active" : ""}"
                type="button"
              >
                Login
              </button>
              <button
                id="register-tab"
                class="tab-button ${initialTab === "register" ? "active" : ""}"
                type="button"
              >
                Register
              </button>
            </div>

            <div id="auth-message" class="message hidden" aria-live="polite"></div>

            <section id="login-section" class="auth-section ${initialTab !== "login" ? "hidden" : ""}">
              <h2>Welcome back</h2>
              <p class="section-description">Enter your account to continue.</p>

              <form id="login-form" class="form-stack">
                <label class="form-group">
                  <span>Email</span>
                  <input
                    id="login-email"
                    class="form-input"
                    type="email"
                    autocomplete="email"
                    required
                  />
                </label>

                <label class="form-group">
                  <span>Password</span>
                  <input
                    id="login-password"
                    class="form-input"
                    type="password"
                    autocomplete="current-password"
                    required
                  />
                </label>

                <button id="login-button" class="primary-button" type="submit">
                  Sign in
                </button>
              </form>

              <div class="demo-box">
                <strong>Demo accounts</strong>
                <p>Coder: coder@mentor.test / 123456</p>
                <p>Mentor: mentor@mentor.test / 123456</p>
              </div>
            </section>

            <section id="register-section" class="auth-section ${initialTab !== "register" ? "hidden" : ""}">
              <h2>Create account</h2>
              <p class="section-description">
                Select the role that represents your work in the platform.
              </p>

              <form id="register-form" class="form-stack">
                <div class="role-selector">
                  <label class="role-option">
                    <input type="radio" name="role" value="CODER" checked />
                    <span>Coder</span>
                    <small>Requests mentorships</small>
                  </label>
                  <label class="role-option">
                    <input type="radio" name="role" value="MENTOR" />
                    <span>Mentor</span>
                    <small>Manages requests</small>
                  </label>
                </div>

                <div class="form-grid">
                  <label class="form-group">
                    <span>First name</span>
                    <input id="register-first-name" class="form-input" required />
                  </label>

                  <label class="form-group">
                    <span>Last name</span>
                    <input id="register-last-name" class="form-input" required />
                  </label>
                </div>

                <label class="form-group">
                  <span>Email</span>
                  <input
                    id="register-email"
                    class="form-input"
                    type="email"
                    autocomplete="email"
                    required
                  />
                </label>

                <label id="clan-group" class="form-group">
                  <span>Clan</span>
                  <select id="register-clan" class="form-input">
                    <option value="">Select a clan</option>
                    ${clans
                      .map(
                        (clan) =>
                          `<option value="${clan.id}">${clan.name}</option>`
                      )
                      .join("")}
                  </select>
                </label>

                <div class="form-grid">
                  <label class="form-group">
                    <span>Password</span>
                    <input
                      id="register-password"
                      class="form-input"
                      type="password"
                      autocomplete="new-password"
                      minlength="6"
                      required
                    />
                  </label>

                  <label class="form-group">
                    <span>Confirm password</span>
                    <input
                      id="register-confirm-password"
                      class="form-input"
                      type="password"
                      autocomplete="new-password"
                      minlength="6"
                      required
                    />
                  </label>
                </div>

                <button id="register-button" class="primary-button" type="submit">
                  Create account
                </button>
              </form>
            </section>
          </div>
        </div>
      </section>
    `;
  }

  bindEvents({ onLogin, onRegister }) {
    // Connects the form actions to the controller callbacks.
    // Conecta las acciones del formulario con los callbacks del controlador.
    const loginTab = this.root.querySelector("#login-tab");
    const registerTab = this.root.querySelector("#register-tab");
    const loginSection = this.root.querySelector("#login-section");
    const registerSection = this.root.querySelector("#register-section");
    const clanGroup = this.root.querySelector("#clan-group");
    const clanSelect = this.root.querySelector("#register-clan");

    const showTab = (tab) => {
      const showLogin = tab === "login";

      loginSection.classList.toggle("hidden", !showLogin);
      registerSection.classList.toggle("hidden", showLogin);
      loginTab.classList.toggle("active", showLogin);
      registerTab.classList.toggle("active", !showLogin);
      this.clearMessage();
    };

    loginTab.addEventListener("click", () => showTab("login"));
    registerTab.addEventListener("click", () => showTab("register"));

    this.root
      .querySelectorAll('input[name="role"]')
      .forEach((radio) => {
        radio.addEventListener("change", () => {
          const isCoder = radio.value === "CODER" && radio.checked;
          clanGroup.classList.toggle("hidden", !isCoder);
          clanSelect.required = isCoder;
        });
      });

    this.root.querySelector("#login-form").addEventListener("submit", (event) => {
      event.preventDefault();
      onLogin(this.getLoginData());
    });

    this.root
      .querySelector("#register-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        onRegister(this.getRegisterData());
      });
  }

  getLoginData() {
    return {
      email: this.root.querySelector("#login-email").value,
      password: this.root.querySelector("#login-password").value
    };
  }

  getRegisterData() {
    const role = this.root.querySelector('input[name="role"]:checked').value;

    return {
      firstName: this.root.querySelector("#register-first-name").value,
      lastName: this.root.querySelector("#register-last-name").value,
      email: this.root.querySelector("#register-email").value,
      password: this.root.querySelector("#register-password").value,
      confirmPassword: this.root.querySelector("#register-confirm-password").value,
      role,
      clanId:
        role === "CODER"
          ? Number(this.root.querySelector("#register-clan").value)
          : null
    };
  }

  setLoading(buttonId, loading) {
    const button = this.root.querySelector(`#${buttonId}`);

    if (!button) return;

    button.disabled = loading;
    button.textContent = loading ? "Processing..." : button.dataset.originalText;
  }

  prepareButtons() {
    ["login-button", "register-button"].forEach((id) => {
      const button = this.root.querySelector(`#${id}`);
      button.dataset.originalText = button.textContent.trim();
    });
  }

  showMessage(message, type = "error") {
    const box = this.root.querySelector("#auth-message");
    box.textContent = message;
    box.className = `message message-${type}`;
  }

  clearMessage() {
    const box = this.root.querySelector("#auth-message");
    box.textContent = "";
    box.className = "message hidden";
  }
}
