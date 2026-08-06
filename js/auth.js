const AUTH_WEB_APP_URL = "PASTE_WEB_APP_URL_DI_SINI";
const SESSION_KEY = "absensi_teacher_session";

function showLogin() {
  const loginPage = document.getElementById("loginPage");
  const appPage = document.getElementById("appPage");

  if (loginPage) loginPage.style.display = "flex";
  if (appPage) appPage.style.display = "none";
}

function showApp() {
  const loginPage = document.getElementById("loginPage");
  const appPage = document.getElementById("appPage");

  if (loginPage) loginPage.style.display = "none";
  if (appPage) appPage.style.display = "block";
}

function readSessionFromHash() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return hash.get("session") || "";
}

function clearHash() {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

function validateSessionToken(token) {
  return new Promise((resolve, reject) => {
    const callbackName = `__sessionCheck_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Validasi sesi timeout."));
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = (payload) => {
      try {
        resolve(payload);
      } finally {
        cleanup();
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Gagal validasi sesi."));
    };

    script.src = `${AUTH_WEB_APP_URL}?action=sessionCheck&token=${encodeURIComponent(token)}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

async function initAuth() {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.action = AUTH_WEB_APP_URL;
  }

  const hashToken = readSessionFromHash();
  if (hashToken) {
    localStorage.setItem(SESSION_KEY, hashToken);
    clearHash();
  }

  const storedToken = localStorage.getItem(SESSION_KEY);

  if (!storedToken) {
    showLogin();
    return;
  }

  try {
    const result = await validateSessionToken(storedToken);
    if (result && result.ok) {
      window.currentTeacher = result.teacher || null;
      showApp();
      return;
    }
  } catch (error) {
    console.warn(error);
  }

  localStorage.removeItem(SESSION_KEY);
  showLogin();
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.currentTeacher = null;
  showLogin();
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  initAuth();
});