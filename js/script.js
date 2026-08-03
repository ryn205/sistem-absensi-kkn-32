/* ==========================================
   SISTEM ABSENSI SISWA
   Version 3
   Bagian 1
========================================== */

/* ==========================
   DATA SISWA
========================== */

const students = [
    "Andi",
    "Budi",
    "Citra",
    "Dini",
    "Eka",
    "Farhan",
    "Gita",
    "Hana"
];

/* ==========================
   ELEMEN HTML
========================== */

const attendanceTable = document.getElementById("attendanceTable");

const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");

const dateInput = document.getElementById("tanggal");
const classSelect = document.getElementById("kelas");

const totalStudents = document.getElementById("totalStudents");
const presentCount = document.getElementById("presentCount");
const izinCount = document.getElementById("izinCount");
const sakitCount = document.getElementById("sakitCount");
const alphaCount = document.getElementById("alphaCount");

const sumTotal = document.getElementById("sumTotal");
const sumPresent = document.getElementById("sumPresent");
const sumIzin = document.getElementById("sumIzin");
const sumSakit = document.getElementById("sumSakit");
const sumAlpha = document.getElementById("sumAlpha");
const sumEmpty = document.getElementById("sumEmpty");

const navButtons = document.querySelectorAll(".nav-btn");
const dashboardPage = document.getElementById("dashboard");
const attendancePage = document.getElementById("attendance");

/* ==========================
   TANGGAL HARI INI
========================== */

const today = new Date().toISOString().split("T")[0];
dateInput.value = today;

/* ==========================
   STORAGE
========================== */

function getStorageKey() {
    return `attendance_${dateInput.value}_${classSelect.value}`;
}

/* ==========================
   RENDER TABEL
========================== */

function renderTable() {
    attendanceTable.innerHTML = "";

    students.forEach((student, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student}</td>
            <td>
                <select class="status">
                    <option value="">Pilih Status</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Alpha">Alpha</option>
                </select>
            </td>
        `;

        attendanceTable.appendChild(row);
    });
}

/* ==========================
   BACA STATUS DARI TABEL
========================== */

function getAttendanceDataFromTable() {
    const data = [];

    attendanceTable.querySelectorAll("tr").forEach(row => {
        const name = row.children[1].textContent;
        const status = row.querySelector("select").value;

        data.push({
            nama: name,
            status: status
        });
    });

    return data;
}

/* ==========================
   HITUNG RINGKASAN
========================== */

function calculateSummary() {
    const data = getAttendanceDataFromTable();

    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpha = 0;
    let empty = 0;

    data.forEach(item => {
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
            default:
                empty++;
                break;
        }
    });

    sumTotal.textContent = students.length;
    sumPresent.textContent = hadir;
    sumIzin.textContent = izin;
    sumSakit.textContent = sakit;
    sumAlpha.textContent = alpha;
    sumEmpty.textContent = empty;

    saveBtn.disabled = empty > 0;
}

/* ==========================
   SIMPAN
========================== */

function saveAttendance() {
    const data = getAttendanceDataFromTable();

    const emptyCount = data.filter(item => item.status === "").length;

    if (emptyCount > 0) {
        alert(`Masih ada ${emptyCount} siswa yang belum diberi status.`);
        return;
    }

    localStorage.setItem(getStorageKey(), JSON.stringify(data));

    updateDashboard();

    alert("Absensi berhasil disimpan.");
}

/* ==========================
   MUAT DATA
========================== */

function loadAttendance() {
    const saved = localStorage.getItem(getStorageKey());

    if (!saved) {
        calculateSummary();
        return;
    }

    const data = JSON.parse(saved);
    const rows = attendanceTable.querySelectorAll("tr");

    data.forEach((item, index) => {
        if (!rows[index]) return;

        const select = rows[index].querySelector("select");
        select.value = item.status || "";
    });

    calculateSummary();
}

/* ==========================
   RESET
========================== */

function resetAttendance() {
    if (!confirm("Reset absensi untuk tanggal dan kelas ini?")) return;

    localStorage.removeItem(getStorageKey());

    renderTable();
    calculateSummary();
    updateDashboard();
}

/* ==========================
   DASHBOARD
========================== */

function updateDashboard() {
    totalStudents.textContent = students.length;

    const saved = localStorage.getItem(getStorageKey());

    if (!saved) {
        presentCount.textContent = 0;
        izinCount.textContent = 0;
        sakitCount.textContent = 0;
        alphaCount.textContent = 0;
        return;
    }

    const data = JSON.parse(saved);

    let hadir = 0;
    let izin = 0;
    let sakit = 0;
    let alpha = 0;

    data.forEach(item => {
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

/* ==========================
   NAVIGASI
========================== */

function showPage(page) {
    dashboardPage.style.display = "none";
    attendancePage.style.display = "none";

    navButtons.forEach(btn => btn.classList.remove("active"));

    if (page === "dashboard") {
        dashboardPage.style.display = "block";
    } else if (page === "attendance") {
        attendancePage.style.display = "block";
    }

    const activeBtn = document.querySelector(`[data-page="${page}"]`);
    if (activeBtn) activeBtn.classList.add("active");
}

/* ==========================
   EVENT
========================== */

saveBtn.addEventListener("click", saveAttendance);

resetBtn.addEventListener("click", resetAttendance);

dateInput.addEventListener("change", () => {
    renderTable();
    loadAttendance();
    updateDashboard();
});

classSelect.addEventListener("change", () => {
    renderTable();
    loadAttendance();
    updateDashboard();
});

attendanceTable.addEventListener("change", (event) => {
    if (event.target && event.target.classList.contains("status")) {
        calculateSummary();
    }
});

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        showPage(btn.dataset.page);
    });
});

/* ==========================
   MULAI
========================== */

renderTable();
loadAttendance();
updateDashboard();
showPage("dashboard");