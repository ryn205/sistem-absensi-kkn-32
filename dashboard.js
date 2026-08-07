document.addEventListener("DOMContentLoaded", function () {
  const teacherName = localStorage.getItem("teacherName") || "Guru";
  const teacherClass = localStorage.getItem("teacherClass") || "";

  const teacherInfo = document.getElementById("teacherInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  const totalStudentsEl = document.getElementById("totalStudents");
  const activeClassesEl = document.getElementById("activeClasses");
  const todayPresentEl = document.getElementById("todayPresent");
  const todayExcusedSickEl = document.getElementById("todayExcusedSick");
  const todayAlfaEl = document.getElementById("todayAlfa");

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
    const students = getStudentsData().filter(
      (student) => student.active !== false && student.className === teacherClass
    );
    const classes = getClassesData().filter((cls) => cls && cls.className === teacherClass);
    const records = getAttendanceRecords();
    const today = getTodayISO();

    const todayRecords = records.filter(
      (record) => record.date === today && record.className === teacherClass
    );

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
    if (activeClassesEl) activeClassesEl.textContent = classes.length ? 1 : 0;
    if (todayPresentEl) todayPresentEl.textContent = present;
    if (todayExcusedSickEl) todayExcusedSickEl.textContent = excusedSick;
    if (todayAlfaEl) todayAlfaEl.textContent = alfa;
  }

  teacherInfo.textContent = `Login sebagai: ${teacherName} | Kelas: ${teacherClass}`;

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("username");
    localStorage.removeItem("teacherClass");
    window.location.href = "index.html";
  });

  updateDashboardStats();
});