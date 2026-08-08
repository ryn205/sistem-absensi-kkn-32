document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const teacherInfo = document.getElementById("teacherInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  const totalTeachersEl = document.getElementById("totalTeachers");
  const totalClassesEl = document.getElementById("totalClasses");
  const totalStudentsEl = document.getElementById("totalStudents");
  const totalAttendanceEl = document.getElementById("totalAttendance");

  const teacherList = document.getElementById("teacherList");
  const classList = document.getElementById("classList");
  const attendanceList = document.getElementById("attendanceList");

  function getUserAccounts() {
    try {
      return JSON.parse(localStorage.getItem("userAccounts") || "[]");
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

  function getStudentsData() {
    try {
      return JSON.parse(localStorage.getItem("studentsData") || "[]");
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

  function renderStats() {
    const accounts = getUserAccounts();
    const teachers = accounts.filter((acc) => acc.role === "teacher");
    const classes = getClassesData().filter((c) => c && c.className);
    const students = getStudentsData().filter((s) => s && s.active !== false);
    const attendance = getAttendanceRecords();

    totalTeachersEl.textContent = teachers.length;
    totalClassesEl.textContent = classes.length;
    totalStudentsEl.textContent = students.length;
    totalAttendanceEl.textContent = attendance.length;
  }

  function renderTeachers() {
    const teachers = getUserAccounts().filter((acc) => acc.role === "teacher");

    if (teachers.length === 0) {
      teacherList.innerHTML = `<tr><td colspan="3">Belum ada akun guru.</td></tr>`;
      return;
    }

    teacherList.innerHTML = teachers
      .map(
        (t) => `
        <tr>
          <td>${t.name || "-"}</td>
          <td>${t.username || "-"}</td>
          <td><span class="status">${t.allowedClass || "-"}</span></td>
        </tr>
      `
      )
      .join("");
  }

  function renderClasses() {
    const classes = getClassesData().filter((c) => c && c.className);

    if (classes.length === 0) {
      classList.innerHTML = `<tr><td colspan="3">Belum ada data kelas.</td></tr>`;
      return;
    }

    classList.innerHTML = classes
      .map(
        (c) => `
        <tr>
          <td>${c.className || "-"}</td>
          <td>${c.homeroomTeacher || "-"}</td>
          <td>${c.studentCount ?? "-"}</td>
        </tr>
      `
      )
      .join("");
  }

  function renderAttendance() {
    const records = getAttendanceRecords()
      .slice()
      .sort((a, b) => `${b.date}-${b.className}`.localeCompare(`${a.date}-${a.className}`))
      .slice(0, 8);

    if (records.length === 0) {
      attendanceList.innerHTML = `<tr><td colspan="4">Belum ada data absensi.</td></tr>`;
      return;
    }

    attendanceList.innerHTML = records
      .map(
        (r) => `
        <tr>
          <td>${r.date || "-"}</td>
          <td>${r.className || "-"}</td>
          <td>${r.teacherName || "-"}</td>
          <td>${Array.isArray(r.students) ? r.students.length : 0}</td>
        </tr>
      `
      )
      .join("");
  }

  if (currentUser?.role === "admin") {
    teacherInfo.textContent = "Login sebagai: Admin";
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

  renderStats();
  renderTeachers();
  renderClasses();
  renderAttendance();
});