let reportMode = "daily";

function setReportMode(mode) {
  reportMode = mode;

  const dailyTab = document.getElementById("reportDailyTab");
  const monthlyTab = document.getElementById("reportMonthlyTab");
  const semesterTab = document.getElementById("reportSemesterTab");

  const dailySection = document.getElementById("reportDailySection");
  const monthlySection = document.getElementById("reportMonthlySection");
  const semesterSection = document.getElementById("reportSemesterSection");

  dailyTab.classList.toggle("active", mode === "daily");
  monthlyTab.classList.toggle("active", mode === "monthly");
  semesterTab.classList.toggle("active", mode === "semester");

  dailySection.classList.toggle("active", mode === "daily");
  monthlySection.classList.toggle("active", mode === "monthly");
  semesterSection.classList.toggle("active", mode === "semester");

  dailySection.style.display = mode === "daily" ? "block" : "none";
  monthlySection.style.display = mode === "monthly" ? "block" : "none";
  semesterSection.style.display = mode === "semester" ? "block" : "none";

  renderReport();
}

function renderReport() {
  if (reportMode === "monthly") {
    renderMonthlyReport();
    return;
  }

  if (reportMode === "semester") {
    renderSemesterReport();
    return;
  }

  renderDailyReport();
}

function renderDailyReport() {
  const reportDate = document.getElementById("reportDate").value;
  const reportClass = document.getElementById("reportClass").value;
  const reportTable = document.getElementById("reportDailyTable");
  const reportInfo = document.getElementById("reportDailyInfo");

  const reportTotal = document.getElementById("reportTotal");
  const reportPresent = document.getElementById("reportPresent");
  const reportIzin = document.getElementById("reportIzin");
  const reportSakit = document.getElementById("reportSakit");
  const reportAlpha = document.getElementById("reportAlpha");
  const reportEmpty = document.getElementById("reportEmpty");

  const students = loadStudents().filter(student => student.classId === reportClass);
  const attendance = loadAttendance(reportDate, reportClass);
  const attendanceMap = new Map(attendance.map(item => [Number(item.studentId), item.status]));

  let hadir = 0;
  let izin = 0;
  let sakit = 0;
  let alpha = 0;
  let empty = 0;

  reportTable.innerHTML = "";

  students.forEach((student, index) => {
    const status = attendanceMap.get(student.id) || "";
    let badgeClass = "empty";
    let statusText = "Belum Diisi";

    if (status === "Hadir") {
      hadir++;
      badgeClass = "present";
      statusText = "Hadir";
    } else if (status === "Izin") {
      izin++;
      badgeClass = "izin";
      statusText = "Izin";
    } else if (status === "Sakit") {
      sakit++;
      badgeClass = "sakit";
      statusText = "Sakit";
    } else if (status === "Alpha") {
      alpha++;
      badgeClass = "alpha";
      statusText = "Alpha";
    } else {
      empty++;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.nama}</td>
      <td><span class="report-status ${badgeClass}">${statusText}</span></td>
    `;
    reportTable.appendChild(row);
  });

  reportTotal.textContent = students.length;
  reportPresent.textContent = hadir;
  reportIzin.textContent = izin;
  reportSakit.textContent = sakit;
  reportAlpha.textContent = alpha;
  reportEmpty.textContent = empty;

  reportInfo.textContent = attendance.length === 0
    ? `Belum ada absensi tersimpan untuk ${reportDate} - ${getClassNameById(reportClass)}.`
    : `Rekap absensi untuk ${reportDate} - ${getClassNameById(reportClass)}.`;

  if (students.length === 0) {
    reportTable.innerHTML = `
      <tr>
        <td colspan="3" class="empty-state">Tidak ada siswa pada kelas ini.</td>
      </tr>
    `;
  }
}

function renderMonthlyReport() {
  const reportMonth = document.getElementById("reportMonth").value;
  const reportClass = document.getElementById("reportClassMonthly").value;
  const reportTable = document.getElementById("reportMonthlyTable");
  const reportInfo = document.getElementById("reportMonthlyInfo");

  const reportDays = document.getElementById("reportMonthDays");
  const reportPresent = document.getElementById("reportMonthPresent");
  const reportIzin = document.getElementById("reportMonthIzin");
  const reportSakit = document.getElementById("reportMonthSakit");
  const reportAlpha = document.getElementById("reportMonthAlpha");
  const reportEmpty = document.getElementById("reportMonthEmpty");

  const entries = getAttendanceEntriesByMonth(reportMonth, reportClass);

  let totalDays = 0;
  let hadir = 0;
  let izin = 0;
  let sakit = 0;
  let alpha = 0;
  let empty = 0;

  reportTable.innerHTML = "";

  if (entries.length === 0) {
    reportTable.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state">Belum ada data absensi untuk bulan dan kelas yang dipilih.</td>
      </tr>
    `;
    reportInfo.textContent = `Belum ada data absensi untuk ${reportMonth} pada kelas ${reportClass === "ALL" ? "semua kelas" : getClassNameById(reportClass)}.`;
    reportDays.textContent = "0";
    reportPresent.textContent = "0";
    reportIzin.textContent = "0";
    reportSakit.textContent = "0";
    reportAlpha.textContent = "0";
    reportEmpty.textContent = "0";
    return;
  }

  entries.forEach(entry => {
    const classStudents = loadStudents().filter(student => student.classId === entry.classId);
    const attendanceMap = new Map(entry.data.map(item => [Number(item.studentId), item.status]));

    let rowPresent = 0;
    let rowIzin = 0;
    let rowSakit = 0;
    let rowAlpha = 0;
    let rowEmpty = 0;

    classStudents.forEach(student => {
      const status = attendanceMap.get(student.id) || "";

      if (status === "Hadir") {
        rowPresent++;
      } else if (status === "Izin") {
        rowIzin++;
      } else if (status === "Sakit") {
        rowSakit++;
      } else if (status === "Alpha") {
        rowAlpha++;
      } else {
        rowEmpty++;
      }
    });

    totalDays++;
    hadir += rowPresent;
    izin += rowIzin;
    sakit += rowSakit;
    alpha += rowAlpha;
    empty += rowEmpty;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${getClassNameById(entry.classId)}</td>
      <td>${rowPresent}</td>
      <td>${rowIzin}</td>
      <td>${rowSakit}</td>
      <td>${rowAlpha}</td>
      <td>${rowEmpty}</td>
    `;
    reportTable.appendChild(row);
  });

  reportDays.textContent = totalDays;
  reportPresent.textContent = hadir;
  reportIzin.textContent = izin;
  reportSakit.textContent = sakit;
  reportAlpha.textContent = alpha;
  reportEmpty.textContent = empty;

  reportInfo.textContent = reportClass === "ALL"
    ? `Rekap bulanan untuk ${reportMonth} pada semua kelas.`
    : `Rekap bulanan untuk ${reportMonth} pada kelas ${getClassNameById(reportClass)}.`;
}

function renderSemesterReport() {
  const startDate = document.getElementById("reportSemesterStart").value;
  const endDate = document.getElementById("reportSemesterEnd").value;
  const reportClass = document.getElementById("reportSemesterClass").value;
  const reportTable = document.getElementById("reportSemesterTable");
  const reportInfo = document.getElementById("reportSemesterInfo");

  const reportStudents = document.getElementById("reportSemesterStudents");
  const reportSessions = document.getElementById("reportSemesterSessions");
  const reportPresent = document.getElementById("reportSemesterPresent");
  const reportIzin = document.getElementById("reportSemesterIzin");
  const reportSakit = document.getElementById("reportSemesterSakit");
  const reportAlpha = document.getElementById("reportSemesterAlpha");
  const reportRate = document.getElementById("reportSemesterRate");

  if (!startDate || !endDate) {
    reportTable.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">Pilih tanggal mulai dan tanggal akhir terlebih dahulu.</td>
      </tr>
    `;
    reportInfo.textContent = "Pilih rentang tanggal dan kelas untuk melihat rekap per siswa.";
    reportStudents.textContent = "0";
    reportSessions.textContent = "0";
    reportPresent.textContent = "0";
    reportIzin.textContent = "0";
    reportSakit.textContent = "0";
    reportAlpha.textContent = "0";
    reportRate.textContent = "0%";
    return;
  }

  if (startDate > endDate) {
    reportTable.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">Tanggal mulai tidak boleh lebih besar dari tanggal akhir.</td>
      </tr>
    `;
    reportInfo.textContent = "Periksa kembali rentang tanggal yang dipilih.";
    reportStudents.textContent = "0";
    reportSessions.textContent = "0";
    reportPresent.textContent = "0";
    reportIzin.textContent = "0";
    reportSakit.textContent = "0";
    reportAlpha.textContent = "0";
    reportRate.textContent = "0%";
    return;
  }

  const students = loadStudents().filter(student => reportClass === "ALL" || student.classId === reportClass);
  const entries = getAllAttendanceEntries().filter(entry => {
    const inRange = entry.date >= startDate && entry.date <= endDate;
    const classMatch = reportClass === "ALL" || entry.classId === reportClass;
    return inRange && classMatch;
  });

  let totalSessions = 0;
  let totalPresent = 0;
  let totalIzin = 0;
  let totalSakit = 0;
  let totalAlpha = 0;
  let totalPossible = 0;

  reportTable.innerHTML = "";

  if (students.length === 0) {
    reportTable.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">Tidak ada siswa pada kelas yang dipilih.</td>
      </tr>
    `;
    reportInfo.textContent = "Tidak ada siswa pada filter kelas ini.";
    reportStudents.textContent = "0";
    reportSessions.textContent = entries.length.toString();
    reportPresent.textContent = "0";
    reportIzin.textContent = "0";
    reportSakit.textContent = "0";
    reportAlpha.textContent = "0";
    reportRate.textContent = "0%";
    return;
  }

  students.forEach((student, index) => {
    const relevantEntries = entries.filter(entry => entry.classId === student.classId);

    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpha = 0;
    let sessions = 0;

    relevantEntries.forEach(entry => {
      const attendanceMap = new Map(entry.data.map(item => [Number(item.studentId), item.status]));
      const status = attendanceMap.get(student.id) || "";

      sessions++;

      if (status === "Hadir") {
        hadir++;
      } else if (status === "Izin") {
        izin++;
      } else if (status === "Sakit") {
        sakit++;
      } else if (status === "Alpha") {
        alpha++;
      }
    });

    totalSessions += sessions;
    totalPresent += hadir;
    totalIzin += izin;
    totalSakit += sakit;
    totalAlpha += alpha;
    totalPossible += sessions;

    const rate = sessions > 0 ? ((hadir / sessions) * 100).toFixed(1) : "0.0";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.nama}</td>
      <td>${getClassNameById(student.classId)}</td>
      <td>${hadir}</td>
      <td>${izin}</td>
      <td>${sakit}</td>
      <td>${alpha}</td>
      <td>${rate}%</td>
    `;
    reportTable.appendChild(row);
  });

  const overallRate = totalPossible > 0
    ? ((totalPresent / totalPossible) * 100).toFixed(1)
    : "0.0";

  reportStudents.textContent = students.length;
  reportSessions.textContent = entries.length;
  reportPresent.textContent = totalPresent;
  reportIzin.textContent = totalIzin;
  reportSakit.textContent = totalSakit;
  reportAlpha.textContent = totalAlpha;
  reportRate.textContent = `${overallRate}%`;

  reportInfo.textContent = reportClass === "ALL"
    ? `Rekap semester untuk rentang ${startDate} sampai ${endDate} pada semua kelas.`
    : `Rekap semester untuk rentang ${startDate} sampai ${endDate} pada kelas ${getClassNameById(reportClass)}.`;
}

function printCurrentReport() {
  window.print();
}