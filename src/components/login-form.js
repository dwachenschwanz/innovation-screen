// LoginForm (improved) — integrates with api_client.js and smartorg.js
// Usage:
//   <login-form></login-form>
// Requirements:
//   - api_client.js exports { apiClient }
//   - smartorg.js exports { smartorg } with getToken({username, password})
//   - Vite proxy for /wizard-api and /kirk in dev (or enable CORS on API)
//   - If your smartorg.js uses CryptoJS, add: npm i crypto-js

import { smartorg } from "../utils/smartorg.js";
import { setLoginCookie, setBooleanCookie } from "../utils/cookies";
// import { auth } from "../utils/auth.js";
import logoUrl from "../assets/images/smartorg-transparent-logo.png?url";

export class LoginForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open", delegatesFocus: true });
    this._busy = false;
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = this.render();

    // Prefill remembered username
    const remembered = localStorage.getItem("username_or_email");
    if (remembered) {
      this.$("#username").value = remembered;
      this.$("#remember").checked = true;
    }

    // Wire events
    this.$("#loginForm").addEventListener("submit", (e) => this.onSubmit(e));

    // Autofocus
    this.$("#username").focus();
  }

  // Small qs helper
  $(sel) {
    return this.shadowRoot.querySelector(sel);
  }

  //   render() {
  //     return /*html*/ `
  //         <style>
  //         .login-container {
  //             background-color: white;
  //             padding: 25px 15px 25px 15px;
  //             margin: 30px 1px 1px 1px;
  //             border-radius: 5px;
  //             box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  //             width: 338px;
  //             border: 1px rgb(211,211,211);
  //         }
  //         .login-container form {
  //             display: flex;
  //             flex-direction: column;

  //         }
  //         .login-container input[type="text"],
  //         .login-container input[type="password"] {
  //             padding: 10px;
  //             margin: 10px 0;
  //             border: 1px solid #ccc;
  //             border-radius: 5px;
  //         }
  //         .login-container button {
  //             padding: 10px;
  //             background-color: var(--button-background-color);
  //             color: white;
  //             border: none;
  //             border-radius: 5px;
  //             cursor: pointer;
  //         }
  //         .login-container button:hover {
  //             background-color: #335e7a;
  //         }
  //         .login-container .forgot-password {
  //             text-align: right;
  //             margin-top: 10px;
  //         }
  //         .login-container .forgot-password a {
  //             color: #3b6d8c;
  //             text-decoration: none;
  //         }
  //         .login-container .remember {
  //             display: flex;
  //             align-items: center;
  //             margin-bottom: 10px;
  //         }
  //         .login-container .remember input {
  //             margin-right: 5px;
  //         }
  //         .version {
  //             text-align: center;
  //             margin-top: 10px;
  //             font-size: 12px;
  //             color: #888;
  //         }

  //         .login {
  //             background-color: var(--login-background-color);
  //             margin: 0;
  //             padding: 40px;
  //             display: flex;
  //            align-items: center;

  //             height: 100vh;
  //             width: 100%;
  //             flex-direction: column;
  //         }

  //         .login-logo {
  //             width: 347px;
  //             height: 42px;
  //             display: flex;
  //             flex-direction: column;
  //             justify-content: center;
  //             align-items: center;
  //         }
  //         .logo {
  //             width: 242px;
  //         }

  //         #error {
  //             color: rgb(204, 51, 51);
  //             font-size: 14px;

  //             padding-bottom: 20px;
  //         }

  //         </style>
  //         <div class="login">
  //             <div class="login-logo">
  //                 <img class="logo" src="${logoUrl}" alt="SmartOrg" />
  //             </div>
  //             <div class="login-container">
  //                 <form id="loginForm">
  //                     <label for="username">Username</label>
  //                     <input type="text" id="username" name="username" placeholder="Username" autocomplete="username" required>

  //                     <label for="password">Password</label>
  //                     <input type="password" id="password" name="password" placeholder="Password" autocomplete="current-password" required>

  //                     <div class="remember">
  //                         <input type="checkbox" id="remember" name="remember">
  //                         <label for="remember">Remember username</label>
  //                     </div>
  //                     <div id="error"></div>
  //                     <button id="submitBtn" type="submit">Sign In</button>
  //                 </form>

  //                 <div class="forgot-password">
  //                     <a href="#">Forgot password?</a>
  //                 </div>
  //                 <div class="version">Version: Vanilla RAK 0.2</div>
  //             </div>
  //         </div>

  //         `;
  //   }

  render() {
    const base = import.meta.env.BASE_URL;
    return /*html*/ `
        <style>
          :host { display: block; }
          .login { background: var(--login-background-color, #f6f8fa); min-height: 100vh; display: grid; place-items: center; padding: 40px; }
          .card { width: 340px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,.08); padding: 22px 18px; }
          .logo-wrap { display:flex; justify-content:center; margin-bottom: 10px; }
          .logo { width: 242px; height: auto; }

         .login {
              background-color: var(--login-background-color);
              margin: 0;
              padding: 40px;
              display: flex;
             align-items: center;

              height: 100vh;
              width: 100%;
              flex-direction: column;
          }

          .login-logo {
              width: 347px;
              height: 42px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
          }
          .logo {
              width: 242px;
          }



          form { display:flex; flex-direction:column; gap: 10px; }
          label { font-size: 13px; color:#374151; }
          input[type="text"], input[type="password"] { border: 1px solid #d1d5db; border-radius: 6px; padding: 10px; font-size: 14px; }
          .pw-row { position: relative; }
          .remember { display:flex; align-items:center; gap:8px; margin: 2px 0 8px; }
          button[type="submit"] { padding: 10px; background: var(--button-background-color, #3b82f6); color:#fff; border:0; border-radius:6px; cursor:pointer; font-weight:600; }
          button[disabled] { opacity:.7; cursor:not-allowed; }
          .forgot { text-align:right; margin-top: 6px; }
          .forgot a { color:#2563eb; text-decoration:none; font-size: 12px; }
          .version { text-align:center; margin-top:10px; font-size:12px; color:#6b7280; }
          .error { color:#b91c1c; font-size: 13px; min-height: 18px; }
          .spinner { display:inline-block; width: 14px; height:14px; border:2px solid #fff; border-top-color: transparent; border-radius:50%; margin-right:8px; animation: spin .8s linear infinite; vertical-align: -2px; }
          @keyframes spin { to { transform: rotate(360deg);} }
        </style>
        <div class="login">
          <div class="card">
            <div class="logo-wrap">
              <img class="logo" src="${base}images/smartorg-transparent-logo.png" alt="SmartOrg" />
            </div>
            <form id="loginForm" novalidate>
              <label for="username">Username</label>
              <input id="username" name="username" type="text" placeholder="Enter username..." autocomplete="username" required />

              <label for="password">Password</label>
             
                <input id="password" name="password" type="password" placeholder="Enter password..." autocomplete="current-password" required />
                
             

              <div class="remember">
                <input id="remember" name="remember" type="checkbox" />
                <label for="remember">Remember username</label>
              </div>

              <div id="error" class="error" role="status" aria-live="polite"></div>
              <button id="submitBtn" type="submit"><span id="btnSpinner" class="spinner" style="display:none"></span><span id="btnText">Sign In</span></button>
            </form>
            <div class="forgot"><a href="#">Forgot password?</a></div>
            <div class="version">Version: Vanilla RAK 0.2</div>
          </div>
        </div>`;
  }

  async onSubmit(e) {
    e.preventDefault();
    if (this._busy) return;

    const username = this.$("#username").value.trim();
    const password = this.$("#password").value;
    const remember = this.$("#remember").checked;
    const errorEl = this.$("#error");
    const btn = this.$("#submitBtn");
    const spinner = this.$("#btnSpinner");
    const btnText = this.$("#btnText");

    // Basic client-side validation
    if (!username || !password) {
      errorEl.textContent = "Please enter username and password.";
      return;
    }

    // UI: busy state
    this._busy = true;
    btn.disabled = true;
    spinner.style.display = "inline-block";
    btnText.textContent = "Signing in…";
    errorEl.textContent = "";

    try {
      // Delegate auth to smartorg wrapper (handles signing + apiClient.post)
      const result = await smartorg.getToken({ username, password });

      // Persist session via auth.js and rehydrate api client
      //   auth.setSession({ token: result.token, user: result.data });

      // Persist server-side state
      //   setLoginCookie("username", result.data.username, 30);
      //   setLoginCookie("user_uid", result.data.uid, 30);
      //   setBooleanCookie("is_admin", result.data.is_admin);
      //   setLoginCookie("smartorg_api_jwt", result.token, 30);

      // Remember username choice
      if (remember)
        localStorage.setItem("username_or_email", result.data.username);
      else localStorage.removeItem("username_or_email");
      // Hand off to parent app — emit success event only
      this.dispatchEvent(
        new CustomEvent("login-success", {
          detail: result,
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      // Normalize errors from ApiClient (e.g., HTTP 403: AUTHENTICATION_FAILED)
      let msg = "Unable to sign in. Please try again.";
      const raw = String(err?.message || err);
      try {
        const maybeJson = JSON.parse(raw);
        if (maybeJson?.message === "AUTHENTICATION_FAILED")
          msg = "Username or password does not match our record!";
        else if (maybeJson?.message) msg = maybeJson.message;
      } catch {
        if (/AUTHENTICATION_FAILED/i.test(raw) || /403/.test(raw))
          msg = "Username or password does not match our record!";
      }
      errorEl.textContent = msg;
      // Also emit an error event for external handling
      this.dispatchEvent(
        new CustomEvent("login-error", {
          detail: { error: raw },
          bubbles: true,
          composed: true,
        })
      );
    } finally {
      this._busy = false;
      btn.disabled = false;
      spinner.style.display = "none";
      btnText.textContent = "Sign In";
    }
  }
}

customElements.define("login-form", LoginForm);
