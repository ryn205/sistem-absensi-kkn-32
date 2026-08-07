document.addEventListener("DOMContentLoaded", function () {
  const teacherName = localStorage.getItem("teacherName") || "Guru";
  const teacherClass = localStorage.getItem("teacherClass") || "";

  const teacherInfo = document.getElementById("teacherInfo");
  const logoutBtn = document.getElementById("logoutBtn");
  const classNameSelect = document.getElementById("className");
  const attendanceDateInput = document.getElementById("attendanceDate");
  const studentTableBody = document.getElementById("studentTableBody");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const message = document.getElementById("message");
  const savedList = document.getElementById("savedList");

  const statusOptions = [
    { value: "Hadir", label: "Hadir" },
    { value: "Izin", label: "Izin" },
    { value: "Sakit", label: "Sakit" },
    { value: "Alfa", label: "Alfa" }
  ];

  function getTodayISO() {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today - offset).toISOString().split("T")[0];
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

  function setAttendanceRecords(records) {
    localStorage.setItem("attendanceRecords", JSON.stringify(records));
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
  }

  function clearMessage() {
    message.textContent = "";
    message.className = "message";
  }

  function getStudentsByClass(className) {
    return getStudentsData()
      .filter(
        (student) =>
          student &&
          student.className === className &&
          student.active !== false &&
          student.name &&
          student.nis
      )
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  function lockClassToTeacher() {
    classNameSelect.innerHTML = "";

    if (!teacherClass) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Kelas tidak tersedia";
      classNameSelect.appendChild(option);
      classNameSelect.disabled = true;
      return false;
    }

    const option = document.createElement("option");
    option.value = teacherClass;
    option.textContent = teacherClass;
    classNameSelect.appendChild(option);
    classNameSelect.value = teacherClass;
    classNameSelect.disabled = true;
    return true;
  }

  function getSavedStatus(record, nis) {
    if (!record || !Array.isArray(record.students)) return "Hadir";
    const found = record.students.find((s) => String(s.nis) === String(nis));
    return found ? found.status : "Hadir";
  }

  function renderStudentTable() {
    const selectedClass = teacherClass;
    const selectedDate = attendanceDateInput.value;

    if (!selectedClass) {
      studentTableBody.innerHTML = `
        <tr>
          <td colspan="3" style="padding:18px;text-align:center;color:#6b7280;">
            Kelas tidak tersedia.
          </td>
        </tr>
      `;
      return;
    }

    const students = getStudentsByClass(selectedClass);
    const records = getAttendanceRecords();
    const existingRecord = records.find(
      (item) => item.className === selectedClass && item.date === selectedDate
    );

    if (students.length === 0) {
      studentTableBody.innerHTML = `
        <tr>
          <td colspan="3" style="padding:18px;text-align:center;color:#6b7280;">
            Belum ada siswa untuk kelas ${selectedClass}.
          </td>
        </tr>
      `;
      return;
    }

    studentTableBody.innerHTML = "";

    students.forEach((student, index) => {
      const savedStatus = getSavedStatus(existingRecord, student.nis);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>
          <strong>${student.name}</strong><br />
          <small style="color:#6b7280;">NIS: ${student.nis}</small>
        </td>
        <td>
          <select class="status-select" data-nis="${student.nis}" data-name="${student.name}">
            ${statusOptions
              .map(
                (opt) => `
                  <option value="${opt.value}" ${opt.value === savedStatus ? "selected" : ""}>
                    ${opt.label}
                  </option>
                `
              )
              .join("")}
          </select>
        </td>
      `;

      studentTableBody.appendChild(tr);
    });
  }

  function renderSavedList() {
    const records = getAttendanceRecords()
      .filter((record) => record.className === teacherClass)
      .slice()
      .sort((a, b) => `${b.date}-${b.className}`.localeCompare(`${a.date}-${a.className}`));

    if (records.length === 0) {
      savedList.innerHTML = `<div class="saved-item">Belum ada data absensi tersimpan.</div>`;
      return;
    }

    savedList.innerHTML = records
      .map((record) => {
        const total = Array.isArray(record.students) ? record.students.length : 0;
        const hadir = (record.students || []).filter((s) => s.status === "Hadir").length;
        const izin = (record.students || []).filter((s) => s.status === "Izin").length;
        const sakit = (record.students || []).filter((s) => s.status === "Sakit").length;
        const alfa = (record.students || []).filter((s) => s.status === "Alfa").length;

        return `
          <div class="saved-item">
            <strong>${record.date} — ${record.className}</strong>
            <div>Total siswa: ${total}</div>
            <div>Hadir: ${hadir} | Izin: ${izin} | Sakit: ${sakit} | Alfa: ${alfa}</div>
          </div>
        `;
      })
      .join("");
  }

  function saveAttendance() {
    const selectedDate = attendanceDateInput.value;

    if (!teacherClass) {
      showMessage("Kelas guru belum ditentukan.", "error");
      return;
    }

    if (!selectedDate) {
      showMessage("Tanggal absensi harus diisi.", "error");
      return;
    }

    const rows = [...document.querySelectorAll(".status-select")];

    if (rows.length === 0) {
      showMessage("Tidak ada siswa untuk disimpan pada kelas ini.", "error");
      return;
    }

    const students = rows.map((select) => ({
      nis: select.dataset.nis,
      name: select.dataset.name,
      status: select.value
    }));

    const records = getAttendanceRecords();
    const existingIndex = records.findIndex(
      (item) => item.className === teacherClass && item.date === selectedDate
    );

    const newRecord = {
      className: teacherClass,
      date: selectedDate,
      teacherName,
      students
    };

    if (existingIndex !== -1) {
      records[existingIndex] = newRecord;
    } else {
      records.push(newRecord);
    }

    setAttendanceRecords(records);
    renderSavedList();
    showMessage("Absensi berhasil disimpan.", "success");
  }

  teacherInfo.textContent = `Login sebagai: ${teacherName} | Kelas: ${teacherClass}`;

  attendanceDateInput.value = getTodayISO();
  lockClassToTeacher();
  renderStudentTable();
  renderSavedList();

  attendanceDateInput.addEventListener("change", function () {
    clearMessage();
    renderStudentTable();
  });

  saveBtn.addEventListener("click", saveAttendance);

  resetBtn.addEventListener("click", function () {
    attendanceDateInput.value = getTodayISO();
    clearMessage();
    renderStudentTable();
    showMessage("Pilihan telah direset.", "success");
  });

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("username");
    localStorage.removeItem("teacherClass");
    window.location.href = "index.html";
  });
});