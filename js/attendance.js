function renderAttendanceTable(students, selectedDate, selectedClassId) {
  const attendanceTable = document.getElementById("attendanceTable");
  const savedAttendance = loadAttendance(selectedDate, selectedClassId);

  attendanceTable.innerHTML = "";

  if (students.length === 0) {
    attendanceTable.innerHTML = `
      <tr>
        <td colspan="3" class="empty-state">Tidak ada siswa pada kelas ini.</td>
      </tr>
    `;
    calculateAttendanceSummary();
    return;
  }

  students.forEach((student, index) => {
    const saved = savedAttendance.find(item => Number(item.studentId) === Number(student.id));
    const selectedValue = saved ? saved.status : "";

    const row = document.createElement("tr");
    row.dataset.studentId = student.id;

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.nama}</td>
      <td>
        <select class="status">
          <option value="" ${selectedValue === "" ? "selected" : ""}>Pilih Status</option>
          <option value="Hadir" ${selectedValue === "Hadir" ? "selected" : ""}>Hadir</option>
          <option value="Izin" ${selectedValue === "Izin" ? "selected" : ""}>Izin</option>
          <option value="Sakit" ${selectedValue === "Sakit" ? "selected" : ""}>Sakit</option>
          <option value="Alpha" ${selectedValue === "Alpha" ? "selected" : ""}>Alpha</option>
        </select>
      </td>
    `;

    attendanceTable.appendChild(row);
  });

  calculateAttendanceSummary();
}

function getAttendancePayload() {
  const rows = document.querySelectorAll("#attendanceTable tr");
  const data = [];

  rows.forEach(row => {
    const select = row.querySelector("select.status");
    if (!select) return;

    const studentId = Number(row.dataset.studentId);
    const status = select.value;
    data.push({ studentId, status });
  });

  return data;
}

function calculateAttendanceSummary() {
  const selects = document.querySelectorAll("#attendanceTable select.status");

  let hadir = 0;
  let izin = 0;
  let sakit = 0;
  let alpha = 0;
  let empty = 0;

  selects.forEach(select => {
    switch (select.value) {
      case "Hadir":
        hadir++;
        break;
      case "Izin":
        izin++;
        break;
      case "Sakit":
        sakit++;
        break;
      case "Alpha":
        alpha++;
        break;
      default:
        empty++;
    }
  });

  document.getElementById("sumTotal").textContent = selects.length;
  document.getElementById("sumPresent").textContent = hadir;
  document.getElementById("sumIzin").textContent = izin;
  document.getElementById("sumSakit").textContent = sakit;
  document.getElementById("sumAlpha").textContent = alpha;
  document.getElementById("sumEmpty").textContent = empty;

  const saveBtn = document.getElementById("saveAttendanceBtn");
  saveBtn.disabled = selects.length === 0 || empty > 0;
}