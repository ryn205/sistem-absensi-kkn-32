document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const teacherInfo = document.getElementById("teacherInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  const totalStudentsEl = document.getElementById("totalStudents");
  const activeClassesEl = document.getElementById("activeClasses");
  const todayPresentEl = document.getElementById("todayPresent");
  const todayExcusedSickEl = document.getElementById("todayExcusedSick");
  const todayAlfaEl = document.getElementById("todayAlfa");
  const adminMenuBtn = document.getElementById("adminMenuBtn");

  function getStudentsData() {
    try {
      return JSON.parse(localStorage.getItem("studentsData") || "[]");
    } catch {
      return [];
    }
  }

  function getClassesData() {
    try {
      return JSON.parse(localStorage.getItem("classesData") || "[]");
    } catch {
      return [];
    }
  }

  function getAttendanceRecords() {
    try {
      return JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
    } catch {
      return [];
    }
  }

  function getTodayISO() {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today - offset).toISOString().split("T")[0];
  }

  function updateDashboardStats() {
    const records = getAttendanceRecords();
    const today = getTodayISO();

    const isAdmin = currentUser && currentUser.role === "admin";
    const teacherClass = currentUser?.allowedClass || "";

    const students = getStudentsData().filter((student) => {
      if (student.active === false) return false;
      return isAdmin ? true : student.className === teacherClass;
    });

    const classes = getClassesData().filter((cls) => {
      if (!cls || !cls.className) return false;
      return isAdmin ? true : cls.className === teacherClass;
    });

    const todayRecords = records.filter((record) => {
      if (record.date !== today) return false;
      return isAdmin ? true : record.className === teacherClass;
    });

    let present = 0;
    let excusedSick = 0;
    let alfa = 0;

    todayRecords.forEach((record) => {
      (record.students || []).forEach((student) => {
        const status = String(student.status || "").toLowerCase();

        if (status === "hadir") {
          present += 1;
        } else if (status === "izin" || status === "sakit") {
          excusedSick += 1;
        } else if (status === "alfa") {
          alfa += 1;
        }
      });
    });

    if (totalStudentsEl) totalStudentsEl.textContent = students.length;
    if (activeClassesEl) activeClassesEl.textContent = isAdmin ? classes.length : (teacherClass ? 1 : 0);
    if (todayPresentEl) todayPresentEl.textContent = present;
    if (todayExcusedSickEl) todayExcusedSickEl.textContent = excusedSick;
    if (todayAlfaEl) todayAlfaEl.textContent = alfa;
  }

  if (currentUser) {
    if (currentUser.role === "admin") {
      teacherInfo.textContent = "Login sebagai: Admin";
      if (adminMenuBtn) adminMenuBtn.style.display = "inline-flex";
    } else {
      teacherInfo.textContent = `Login sebagai: ${currentUser.name} | Kelas: ${currentUser.allowedClass || "-"}`;
      if (adminMenuBtn) adminMenuBtn.style.display = "none";
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("teacherName");
      localStorage.removeItem("username");
      localStorage.removeItem("teacherClass");
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });
  }

  updateDashboardStats();
});