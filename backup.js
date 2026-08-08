document.addEventListener("DOMContentLoaded", function () {
  const backupBtn = document.getElementById("backupBtn");
  const restoreBtn = document.getElementById("restoreBtn");
  const backupFileInput = document.getElementById("backupFileInput");

  const KEYS_TO_BACKUP = [
    "studentsData",
    "classesData",
    "attendanceRecords"
  ];

  function collectBackupData() {
    const data = {
      appName: "Sistem Absensi Digital Siswa",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      data: {}
    };

    KEYS_TO_BACKUP.forEach((key) => {
      const raw = localStorage.getItem(key);
      try {
        data.data[key] = raw ? JSON.parse(raw) : [];
      } catch {
        data.data[key] = [];
      }
    });

    return data;
  }

  function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (backupBtn) {
    backupBtn.addEventListener("click", function (e) {
      e.preventDefault();
      const backupData = collectBackupData();
      const datePart = new Date().toISOString().slice(0, 10);
      downloadJSON(`backup-absensi-${datePart}.json`, backupData);
    });
  }

  if (restoreBtn) {
    restoreBtn.addEventListener("click", function (e) {
      e.preventDefault();
      backupFileInput.click();
    });
  }

  if (backupFileInput) {
    backupFileInput.addEventListener("change", function () {
      const file = this.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function () {
        try {
          const parsed = JSON.parse(reader.result);

          if (!parsed || !parsed.data) {
            alert("File backup tidak valid.");
            return;
          }

          KEYS_TO_BACKUP.forEach((key) => {
            const value = parsed.data[key];
            localStorage.setItem(key, JSON.stringify(Array.isArray(value) ? value : []));
          });

          alert("Backup berhasil dipulihkan. Halaman akan dimuat ulang.");
          window.location.reload();
        } catch {
          alert("Gagal membaca file backup.");
        }
      };

      reader.readAsText(file);
      this.value = "";
    });
  }
});