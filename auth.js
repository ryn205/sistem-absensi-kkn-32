document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const message = document.getElementById("message");

  const teachers = [
    {
      username: "guru1",
      password: "123456",
      name: "Bu Siti",
      allowedClass: "VI-A"
    },
    {
      username: "guru2",
      password: "123456",
      name: "Pak Rudi",
      allowedClass: "VI-B"
    }
  ];

  const currentPage = window.location.pathname.split("/").pop();
  const protectedPages = [
    "dashboard.html",
    "attendance.html",
    "rekap.html",
    "data-siswa.html"
  ];

  if (protectedPages.includes(currentPage)) {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const teacherName = localStorage.getItem("teacherName");

    if (isLoggedIn !== "true") {
      window.location.href = "index.html";
      return;
    }

    const teacherInfo = document.getElementById("teacherInfo");
    if (teacherInfo) {
      teacherInfo.textContent = `Login sebagai: ${teacherName || "Guru"}`;
    }
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("teacherName");
      localStorage.removeItem("username");
      localStorage.removeItem("teacherClass");
      window.location.href = "index.html";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      const user = teachers.find(
        (teacher) => teacher.username === username && teacher.password === password
      );

      if (user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("teacherName", user.name);
        localStorage.setItem("username", user.username);
        localStorage.setItem("teacherClass", user.allowedClass);

        message.textContent = "Login berhasil. Mengalihkan...";
        message.className = "message success";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 800);
      } else {
        message.textContent = "Username atau password salah.";
        message.className = "message error";
      }
    });
  }
});