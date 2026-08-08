document.addEventListener("DOMContentLoaded", function () {
  const teacherName = localStorage.getItem("teacherName") || "Guru";
  const teacherClass = localStorage.getItem("teacherClass") || "";

  const teacherInfo = document.getElementById("teacherInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  const filterClass = document.getElementById("filterClass");
  const dateMode = document.getElementById("dateMode");
  const dateGroup1 = document.getElementById("dateGroup1");
  const dateGroup2 = document.getElementById("dateGroup2");
  const dateLabel1 = document.getElementById("dateLabel1");
  const dateLabel2 = document.getElementById("dateLabel2");
  const dateInput1 = document.getElementById("dateInput1");
  const dateInput2 = document.getElementById("dateInput2");

  const applyFilterBtn = document.getElementById("applyFilterBtn");
  const resetFilterBtn = document.getElementById("resetFilterBtn");
  const rekapBody = document.getElementById("rekapBody");
  const emptyState = document.getElementById("emptyState");
  const message = document.getElementById("message");

  const totalRecordsEl = document.getElementById("totalRecords");
  const totalStudentsEl = document.getElementById("totalStudents");
  const totalHadirEl = document.getElementById("totalHadir");
  const totalOtherEl = document.getElementById("totalOther");

  function getAttendanceRecords() {
    try {
      return JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
    } catch {
      return [];
    }
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
  }

  function clearMessage() {
    message.textContent = "";
    message.className = "message";
  }

  function getTodayISO() {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today - offset).toISOString().split("T")[0];
  }

  function lockClassToTeacher() {
    filterClass.innerHTML = "";

    if (!teacherClass) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Kelas tidak tersedia";
      filterClass.appendChild(option);
      filterClass.disabled = true;
      return;
    }

    const option = document.createElement("option");
    option.value = teacherClass;
    option.textContent = teacherClass;
    filterClass.appendChild(option);
    filterClass.value = teacherClass;
    filterClass.disabled = true;
  }

  function statusClass(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "hadir") return "hadir";
    if (normalized === "izin") return "izin";
    if (normalized === "sakit") return "sakit";
    if (normalized === "alfa") return "alfa";
    return "alfa";
  }

  function updateDateModeUI() {
    const mode = dateMode.value;

    if (mode === "daily") {
      dateGroup1.style.display = "flex";
      dateGroup2.style.display = "none";
      dateLabel1.textContent = "Tanggal";
      dateInput1.type = "date";
      dateInput1.value = dateInput1.value || getTodayISO();
    }

    if (mode === "monthly") {
      dateGroup1.style.display = "flex";
      dateGroup2.style.display = "none";
      dateLabel1.textContent = "Bulan";
      dateInput1.type = "month";
      if (!dateInput1.value) {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        dateInput1.value = `${today.getFullYear()}-${month}`;
      }
    }

    if (mode === "semester") {
      dateGroup1.style.display = "flex";
      dateGroup2.style.display = "flex";
      dateLabel1.textContent = "Tanggal Awal";
      dateLabel2.textContent = "Tanggal Akhir";
      dateInput1.type = "date";
      dateInput2.type = "date";
      if (!dateInput1.value) dateInput1.value = getTodayISO();
      if (!dateInput2.value) dateInput2.value = getTodayISO();
    }
  }

  function matchByDate(recordDate) {
    const mode = dateMode.value;

    if (mode === "daily") {
      return recordDate === dateInput1.value;
    }

    if (mode === "monthly") {
      return recordDate.startsWith(dateInput1.value);
    }

    if (mode === "semester") {
      if (!dateInput1.value || !dateInput2.value) return false;
      const start = dateInput1.value;
      const end = dateInput2.value;
      return recordDate >= start && recordDate <= end;
    }

    return true;
  }

  function applyFilters(records) {
    return records.filter((record) => {
      const matchClass = record.className === teacherClass;
      const matchDate = matchByDate(record.date);
      return matchClass && matchDate;
    });
  }

  function updateSummary(records) {
    const totalRecords = records.length;
    let totalStudents = 0;
    let totalHadir = 0;
    let totalOther = 0;

    records.forEach((record) => {
      const students = Array.isArray(record.students) ? record.students : [];
      totalStudents += students.length;

      students.forEach((s) => {
        const status = String(s.status || "").toLowerCase();
        if (status === "hadir") totalHadir += 1;
        else totalOther += 1;
      });
    });

    totalRecordsEl.textContent = totalRecords;
    totalStudentsEl.textContent = totalStudents;
    totalHadirEl.textContent = totalHadir;
    totalOtherEl.textContent = totalOther;
  }

  function renderTable(records) {
    const rows = [];

    records
      .slice()
      .sort((a, b) => `${b.date}-${b.className}`.localeCompare(`${a.date}-${a.className}`))
      .forEach((record) => {
        (record.students || []).forEach((student) => {
          rows.push(`
            <tr>
              <td>${record.date || "-"}</td>
              <td>${record.className || "-"}</td>
              <td>${student.name || "-"}</td>
              <td>
                <span class="status-badge ${statusClass(student.status)}">
                  ${student.status || "-"}
                </span>
              </td>
              <td>${record.teacherName || "-"}</td>
            </tr>
          `);
        });
      });

    rekapBody.innerHTML = rows.join("");

    if (rows.length === 0) {
      emptyState.style.display = "block";
      document.getElementById("tableWrap").style.display = "none";
    } else {
      emptyState.style.display = "none";
      document.getElementById("tableWrap").style.display = "block";
    }
  }

  function refreshView() {
    clearMessage();

    const allRecords = getAttendanceRecords();
    const filteredRecords = applyFilters(allRecords);

    updateSummary(filteredRecords);
    renderTable(filteredRecords);

    if (filteredRecords.length === 0) {
      showMessage("Tidak ada data yang cocok dengan filter.", "error");
    } else {
      showMessage(`Menampilkan ${filteredRecords.length} data rekap.`, "success");
    }
  }

  teacherInfo.textContent = `Login sebagai: ${teacherName} | Kelas: ${teacherClass}`;

  lockClassToTeacher();
  updateDateModeUI();
  refreshView();

  dateMode.addEventListener("change", function () {
    updateDateModeUI();
    refreshView();
  });

  applyFilterBtn.addEventListener("click", refreshView);

  resetFilterBtn.addEventListener("click", function () {
    dateMode.value = "daily";
    dateInput1.value = getTodayISO();
    dateInput2.value = getTodayISO();
    updateDateModeUI();
    refreshView();
  });

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("username");
    localStorage.removeItem("teacherClass");
    window.location.href = "index.html";
  });
});