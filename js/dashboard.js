function updateDashboard(students) {
  const totalStudentsEl = document.getElementById("totalStudents");
  const presentCountEl = document.getElementById("presentCount");
  const izinCountEl = document.getElementById("izinCount");
  const sakitCountEl = document.getElementById("sakitCount");
  const alphaCountEl = document.getElementById("alphaCount");

  const messageEl = document.getElementById("dashboardMessage");
  const rangeInfoEl = document.getElementById("dashboardRangeInfo");

  const startInput = document.getElementById("reportSemesterStart");
  const endInput = document.getElementById("reportSemesterEnd");
  const classInput = document.getElementById("reportSemesterClass");

  const startDate = startInput ? startInput.value : "";
  const endDate = endInput ? endInput.value : "";
  const classId = classInput ? classInput.value : "ALL";

  const scopeStudents = classId === "ALL"
    ? students
    : students.filter(student => student.classId === classId);

  const entries = (startDate && endDate && startDate <= endDate)
    ? getAttendanceEntriesInRange(startDate, endDate, classId)
    : [];

  let hadir = 0;
  let izin = 0;
  let sakit = 0;
  let alpha = 0;

  entries.forEach(entry => {
    entry.data.forEach(item => {
      switch (item.status) {
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
      }
    });
  });

  totalStudentsEl.textContent = scopeStudents.length;
  presentCountEl.textContent = hadir;
  izinCountEl.textContent = izin;
  sakitCountEl.textContent = sakit;
  alphaCountEl.textContent = alpha;

  if (!startDate || !endDate) {
    messageEl.textContent =
      "Pilih tanggal awal dan tanggal akhir pada Laporan Semester untuk menampilkan ringkasan.";
    rangeInfoEl.textContent = "Belum ada rentang tanggal yang dipilih.";
    return;
  }

  if (startDate > endDate) {
    messageEl.textContent =
      "Tanggal awal tidak boleh lebih besar dari tanggal akhir.";
    rangeInfoEl.textContent = "Periksa kembali pilihan rentang tanggal.";
    return;
  }

  const classLabel = classId === "ALL"
    ? "semua kelas"
    : getClassNameById(classId);

  messageEl.textContent =
    "Ringkasan di bawah ini mengikuti rentang semester yang dipilih.";
  rangeInfoEl.textContent =
    `Periode: ${startDate} sampai ${endDate} • ${classLabel}`;
}
