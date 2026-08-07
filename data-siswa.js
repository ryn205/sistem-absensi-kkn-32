document.addEventListener("DOMContentLoaded", function () {
  const teacherName = localStorage.getItem("teacherName") || "Guru";
  const teacherInfo = document.getElementById("teacherInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  const studentNameInput = document.getElementById("studentName");
  const studentClassSelect = document.getElementById("studentClass");
  const studentNisInput = document.getElementById("studentNis");
  const saveStudentBtn = document.getElementById("saveStudentBtn");
  const resetFormBtn = document.getElementById("resetFormBtn");
  const message = document.getElementById("message");
  const studentTableBody = document.getElementById("studentTableBody");
  const emptyState = document.getElementById("emptyState");

  let editingIndex = null;

  function getClassesData() {
    try {
      const parsed = JSON.parse(localStorage.getItem("classesData") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function getClassNames() {
    return getClassesData()
      .map((item) => String(item.className || "").trim())
      .filter(Boolean);
  }

  function getStudents() {
    try {
      const parsed = JSON.parse(localStorage.getItem("studentsData") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setStudents(students) {
    localStorage.setItem("studentsData", JSON.stringify(students));
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
  }

  function clearMessage() {
    message.textContent = "";
    message.className = "message";
  }

  function populateClassOptions(selectedClass = "") {
    const classNames = getClassNames();

    studentClassSelect.innerHTML = "";

    if (classNames.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Belum ada data kelas";
      studentClassSelect.appendChild(option);
      studentClassSelect.disabled = true;
      saveStudentBtn.disabled = true;
      return;
    }

    studentClassSelect.disabled = false;
    saveStudentBtn.disabled = false;

    classNames.forEach((className) => {
      const option = document.createElement("option");
      option.value = className;
      option.textContent = className;
      studentClassSelect.appendChild(option);
    });

    if (selectedClass && classNames.includes(selectedClass)) {
      studentClassSelect.value = selectedClass;
    } else {
      studentClassSelect.value = classNames[0];
    }
  }

  function resetForm() {
    studentNameInput.value = "";
    studentNisInput.value = "";
    editingIndex = null;
    saveStudentBtn.textContent = "Simpan Data";
    clearMessage();
    populateClassOptions();
  }

  function renderStudents() {
    const students = getStudents();

    if (students.length === 0) {
      studentTableBody.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    studentTableBody.innerHTML = students
      .map((student, index) => {
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${student.name || "-"}</td>
            <td><span class="status-badge">${student.className || "-"}</span></td>
            <td>${student.nis || "-"}</td>
            <td>${student.active === false ? "Nonaktif" : "Aktif"}</td>
            <td>
              <div class="inline-actions">
                <button class="btn btn-secondary" data-action="edit" data-index="${index}">Edit</button>
                <button class="btn btn-danger" data-action="delete" data-index="${index}">Hapus</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    document.querySelectorAll("button[data-action='edit']").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = Number(this.dataset.index);
        const students = getStudents();
        const student = students[index];
        if (!student) return;

        studentNameInput.value = student.name || "";
        studentClassSelect.value = student.className || "";
        studentNisInput.value = student.nis || "";

        editingIndex = index;
        saveStudentBtn.textContent = "Update Data";
        showMessage("Data siswa siap diedit.", "success");
      });
    });

    document.querySelectorAll("button[data-action='delete']").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = Number(this.dataset.index);
        const students = getStudents();
        const student = students[index];
        if (!student) return;

        const confirmDelete = confirm(`Hapus data "${student.name}"?`);
        if (!confirmDelete) return;

        students.splice(index, 1);
        setStudents(students);
        renderStudents();
        resetForm();
        showMessage("Data siswa berhasil dihapus.", "success");
      });
    });
  }

  function saveStudent() {
    const name = studentNameInput.value.trim();
    const className = studentClassSelect.value;
    const nis = studentNisInput.value.trim();

    if (!name || !className || !nis) {
      showMessage("Nama, kelas, dan NIS harus diisi.", "error");
      return;
    }

    const validClasses = getClassNames();
    if (!validClasses.includes(className)) {
      showMessage("Kelas belum tersedia. Silakan isi data kelas terlebih dahulu.", "error");
      return;
    }

    const students = getStudents();
    const duplicateNis = students.findIndex(
      (s, idx) => String(s.nis) === String(nis) && idx !== editingIndex
    );

    if (duplicateNis !== -1) {
      showMessage("NIS sudah digunakan oleh siswa lain.", "error");
      return;
    }

    const newData = {
      name,
      className,
      nis,
      active: true,
    };

    if (editingIndex !== null) {
      students[editingIndex] = newData;
      showMessage("Data siswa berhasil diperbarui.", "success");
    } else {
      students.push(newData);
      showMessage("Data siswa berhasil ditambahkan.", "success");
    }

    setStudents(students);
    renderStudents();
    resetForm();
  }

  teacherInfo.textContent = `Login sebagai: ${teacherName}`;

  populateClassOptions();
  renderStudents();

  saveStudentBtn.addEventListener("click", saveStudent);
  resetFormBtn.addEventListener("click", resetForm);

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("username");
    window.location.href = "index.html";
  });

  window.addEventListener("storage", function (e) {
    if (e.key === "classesData" || e.key === "studentsData") {
      const currentClass = studentClassSelect.value;
      populateClassOptions(currentClass);
      renderStudents();
    }
  });
});