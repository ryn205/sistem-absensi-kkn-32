function updateDashboard(students, attendanceData) {
  const totalStudents = document.getElementById("totalStudents");
  const presentCount = document.getElementById("presentCount");
  const izinCount = document.getElementById("izinCount");
  const sakitCount = document.getElementById("sakitCount");
  const alphaCount = document.getElementById("alphaCount");

  totalStudents.textContent = students.length;

  let hadir = 0;
  let izin = 0;
  let sakit = 0;
  let alpha = 0;

  attendanceData.forEach(item => {
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

  presentCount.textContent = hadir;
  izinCount.textContent = izin;
  sakitCount.textContent = sakit;
  alphaCount.textContent = alpha;
}