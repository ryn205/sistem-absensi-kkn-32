function showPage(page) {
  const pages = document.querySelectorAll(".page");
  const navButtons = document.querySelectorAll(".nav-btn");

  pages.forEach(section => {
    section.style.display = "none";
  });

  navButtons.forEach(button => {
    button.classList.remove("active");
  });

  const target = document.getElementById(page);
  if (target) target.style.display = "block";

  const activeBtn = document.querySelector(`[data-page="${page}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  if (page === "report") {
    renderReport();
  }
}

function getCurrentDate() {
  return document.getElementById("tanggal").value;
}

function getCurrentClass() {
  return document.getElementById("kelas").value;
}

function appRenderAll() {
  renderClassSelects();

  const students = loadStudents();
  const date = getCurrentDate();
  const classId = getCurrentClass();

  const classStudents = students.filter(student => student.classId === classId);
  renderAttendanceTable(classStudents, date, classId);
  calculateAttendanceSummary();

  const attendanceData = loadAttendance(date, classId);
  updateDashboard(students, attendanceData);

  renderStudentTable(students);
  renderClassTable();

  if (document.getElementById("report").style.display !== "none") {
    renderReport();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.slice(0, 7);
  const semesterStart = new Date();
  semesterStart.setMonth(semesterStart.getMonth() - 6);
  const semesterStartValue = semesterStart.toISOString().split("T")[0];

  document.getElementById("tanggal").value = today;
  document.getElementById("reportDate").value = today;
  document.getElementById("reportMonth").value = currentMonth;
  document.getElementById("reportSemesterStart").value = semesterStartValue;
  document.getElementById("reportSemesterEnd").value = today;

  document.querySelectorAll(".nav-btn").forEach(button => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      showPage(button.dataset.page);
    });
  });

  document.querySelectorAll(".report-tab").forEach(button => {
    button.addEventListener("click", () => {
      setReportMode(button.dataset.reportMode);
    });
  });

  document.getElementById("tanggal").addEventListener("change", appRenderAll);
  document.getElementById("kelas").addEventListener("change", appRenderAll);

  document.getElementById("saveAttendanceBtn").addEventListener("click", async () => {
    const selectedDate = getCurrentDate();
    const selectedClassId = getCurrentClass();
    const payload = getAttendancePayload();
  
    if (payload.some(item => item.status === "")) {
      alert("Masih ada siswa yang belum dipilih statusnya.");
      return;
    }
  
    saveAttendance(selectedDate, selectedClassId, payload);
    appRenderAll();
  
    try {
      const result = await pushAttendanceToSheet(selectedDate, selectedClassId, payload);
      if (!result.ok) {
        console.warn(result);
        alert("Absensi tersimpan lokal, tetapi sinkron ke Spreadsheet gagal.");
        return;
      }
      alert("Absensi berhasil disimpan dan disinkronkan.");
    } catch (error) {
      console.warn(error);
      alert("Absensi tersimpan lokal, tetapi sinkron ke Spreadsheet gagal.\n\n" + error.message);
    }
  });

  document.getElementById("resetAttendanceBtn").addEventListener("click", () => {
    if (!confirm("Reset absensi untuk tanggal dan kelas ini?")) return;
    removeAttendance(getCurrentDate(), getCurrentClass());
    appRenderAll();
  });

  document.getElementById("saveStudentBtn").addEventListener("click", saveStudent);
  document.getElementById("cancelEditBtn").addEventListener("click", cancelEditStudent);

  document.getElementById("studentClassFilter").addEventListener("change", () => {
    renderStudentTable(loadStudents());
  });

  document.getElementById("studentSearch").addEventListener("input", () => {
    renderStudentTable(loadStudents());
  });

  document.getElementById("saveClassBtn").addEventListener("click", saveClass);
  document.getElementById("cancelEditClassBtn").addEventListener("click", cancelEditClass);

  document.getElementById("attendanceTable").addEventListener("change", () => {
    calculateAttendanceSummary();
  });

  document.getElementById("reportDate").addEventListener("change", () => {
    if (document.getElementById("report").style.display !== "none") renderReport();
  });

  document.getElementById("reportClass").addEventListener("change", () => {
    if (document.getElementById("report").style.display !== "none") renderReport();
  });

  document.getElementById("reportMonth").addEventListener("change", () => {
    if (document.getElementById("report").style.display !== "none") renderReport();
  });

  document.getElementById("reportClassMonthly").addEventListener("change", () => {
    if (document.getElementById("report").style.display !== "none") renderReport();
  });

  document.getElementById("reportSemesterStart").addEventListener("change", () => {
    if (document.getElementById("report").style.display !== "none") renderReport();
  });

  document.getElementById("reportSemesterEnd").addEventListener("change", () => {
    if (document.getElementById("report").style.display !== "none") renderReport();
  });

  document.getElementById("reportSemesterClass").addEventListener("change", () => {
    if (document.getElementById("report").style.display !== "none") renderReport();
  });

  document.getElementById("reportDailyLoadBtn").addEventListener("click", renderReport);
  document.getElementById("reportMonthlyLoadBtn").addEventListener("click", renderReport);
  document.getElementById("reportSemesterLoadBtn").addEventListener("click", renderReport);

  document.getElementById("reportDailyPrintBtn").addEventListener("click", printCurrentReport);
  document.getElementById("reportMonthlyPrintBtn").addEventListener("click", printCurrentReport);
  document.getElementById("reportSemesterPrintBtn").addEventListener("click", printCurrentReport);

  try {
    await syncClassesFromSheet();
    await syncStudentsFromSheet();
    await syncAttendanceFromSheet();
  } catch (error) {
    console.warn("Sinkron dari Spreadsheet gagal, memakai data lokal dulu.", error);
  }

  const syncStudentsBtn = document.getElementById("syncStudentsBtn");

  if (syncStudentsBtn) {
    syncStudentsBtn.addEventListener("click", async () => {
      try {
        await syncClassesFromSheet();
        await syncStudentsFromSheet();
        appRenderAll();
        alert("Sinkron siswa berhasil.");
      } catch (error) {
        console.error(error);
        alert("Sinkron siswa gagal.");
      }
    });
  }

  const syncClassesBtn = document.getElementById("syncClassesBtn");

  if (syncClassesBtn) {
    syncClassesBtn.addEventListener("click", async () => {
      try {
        await syncClassesFromSheet();
        renderClassSelects();
        renderClassTable();
        appRenderAll();
        alert("Sinkron kelas berhasil.");
      } catch (error) {
        console.warn(error);
        alert("Sinkron kelas gagal.");
      }
    });
  }

  const syncAttendanceBtn = document.getElementById("syncAttendanceBtn");
  
  if (syncAttendanceBtn) {
    syncAttendanceBtn.addEventListener("click", async () => {
      try {
        await syncAttendanceFromSheet();
        appRenderAll();
        alert("Sinkron absensi berhasil.");
      } catch (error) {
        console.warn(error);
        alert("Sinkron absensi gagal.");
      }
    });
  }

  setReportMode("daily");
  showPage("dashboard");
  appRenderAll();
});