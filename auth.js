document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const message = document.getElementById("message");

  const defaultAccounts = [
    {
      username: "admin",
      password: "admin123",
      name: "Admin",
      role: "admin",
      allowedClass: null,
    },
    {
      username: "guru1",
      password: "123456",
      name: "Bu Siti",
      role: "teacher",
      allowedClass: "VI-A",
    },
    {
      username: "guru2",
      password: "123456",
      name: "Pak Rudi",
      role: "teacher",
      allowedClass: "VI-B",
    },
    {
      username: "guru3",
      password: "123456",
      name: "Bu Ani",
      role: "teacher",
      allowedClass: "VI-C",
    },
  ];

  function getUserAccounts() {
    try {
      const stored = localStorage.getItem("userAccounts");
      if (!stored) {
        localStorage.setItem("userAccounts", JSON.stringify(defaultAccounts));
        return [...defaultAccounts];
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [...defaultAccounts];
    } catch {
      localStorage.setItem("userAccounts", JSON.stringify(defaultAccounts));
      return [...defaultAccounts];
    }
  }

  function saveUserAccounts(accounts) {
    localStorage.setItem("userAccounts", JSON.stringify(accounts));
  }

  function ensureDefaultAccounts() {
    const stored = localStorage.getItem("userAccounts");
    if (!stored) {
      saveUserAccounts(defaultAccounts);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        saveUserAccounts(defaultAccounts);
      }
    } catch {
      saveUserAccounts(defaultAccounts);
    }
  }

  function getCurrentUser() {
    try {
      const stored = localStorage.getItem("currentUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  function setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", user.username);
    localStorage.setItem("teacherName", user.name);
    if (user.role === "teacher") {
      localStorage.setItem("teacherClass", user.allowedClass || "");
    } else {
      localStorage.removeItem("teacherClass");
    }
  }

  function clearSession() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("username");
    localStorage.removeItem("teacherClass");
    localStorage.removeItem("currentUser");
  }

  ensureDefaultAccounts();

  const currentPage = window.location.pathname.split("/").pop();
  const currentUser = getCurrentUser();

  const adminPages = ["admin-dashboard.html", "admin.html"];
  const teacherPages = ["dashboard.html", "attendance.html", "rekap.html", "data-siswa.html"];
  const authPages = ["index.html", ""];

  if (currentUser && authPages.includes(currentPage)) {
    window.location.href = currentUser.role === "admin"
      ? "admin-dashboard.html"
      : "dashboard.html";
    return;
  }

  if (currentUser && currentUser.role === "admin" && teacherPages.includes(currentPage)) {
    window.location.href = "admin-dashboard.html";
    return;
  }

  if (currentUser && currentUser.role === "teacher" && adminPages.includes(currentPage)) {
    window.location.href = "dashboard.html";
    return;
  }

  if (adminPages.includes(currentPage)) {
    if (!currentUser || currentUser.role !== "admin") {
      window.location.href = "dashboard.html";
      return;
    }
  }

  if (teacherPages.includes(currentPage)) {
    if (!currentUser || currentUser.role !== "teacher") {
      window.location.href = "dashboard.html";
      return;
    }
  }

  if (currentUser) {
    const teacherInfo = document.getElementById("teacherInfo");
    if (teacherInfo) {
      if (currentUser.role === "admin") {
        teacherInfo.textContent = "Login sebagai: Admin";
      } else {
        teacherInfo.textContent = `Login sebagai: ${currentUser.name} | Kelas: ${currentUser.allowedClass || "-"}`;
      }
    }
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      clearSession();
      window.location.href = "index.html";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const accounts = getUserAccounts();

      const user = accounts.find(
        (account) => account.username === username && account.password === password
      );

      if (!user) {
        message.textContent = "Username atau password salah.";
        message.className = "message error";
        return;
      }

      setCurrentUser(user);

      message.textContent = "Login berhasil. Mengalihkan...";
      message.className = "message success";

      setTimeout(() => {
        window.location.href = user.role === "admin"
          ? "admin-dashboard.html"
          : "dashboard.html";
      }, 700);
    });
  }
});