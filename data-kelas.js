document.addEventListener("DOMContentLoaded", function () {
  const teacherName = localStorage.getItem("teacherName") || "Guru";
  const teacherInfo = document.getElementById("teacherInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  const classNameInput = document.getElementById("className");
  const homeroomTeacherInput = document.getElementById("homeroomTeacher");
  const studentCountInput = document.getElementById("studentCount");
  const classNoteInput = document.getElementById("classNote");
  const saveClassBtn = document.getElementById("saveClassBtn");
  const resetFormBtn = document.getElementById("resetFormBtn");
  const message = document.getElementById("message");
  const classTableBody = document.getElementById("classTableBody");
  const emptyState = document.getElementById("emptyState");

  let editingIndex = null;

  const defaultClasses = [
    {
      className: "VI-A",
      homeroomTeacher: "Bu Siti",
      studentCount: 32,
      classNote: "Kelas reguler"
    },
    {
      className: "VI-B",
      homeroomTeacher: "Pak Rudi",
      studentCount: 31,
      classNote: "Kelas reguler"
    },
    {
      className: "VI-C",
      homeroomTeacher: "Bu Ani",
      studentCount: 30,
      classNote: "Kelas reguler"
    }
  ];

  function getClasses() {
    const stored = localStorage.getItem("classesData");
    if (!stored) {
      localStorage.setItem("classesData", JSON.stringify(defaultClasses));
      return [...defaultClasses];
    }

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      localStorage.setItem("classesData", JSON.stringify(defaultClasses));
      return [...defaultClasses];
    }
  }

  function setClasses(classes) {
    localStorage.setItem("classesData", JSON.stringify(classes));
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
  }

  function clearMessage() {
    message.textContent = "";
    message.className = "message";
  }

  function resetForm() {
    classNameInput.value = "";
    homeroomTeacherInput.value = "";
    studentCountInput.value = "";
    classNoteInput.value = "";
    editingIndex = null;
    saveClassBtn.textContent = "Simpan Data";
    clearMessage();
  }

  function renderClasses() {
    const classes = getClasses();

    if (classes.length === 0) {
      classTableBody.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    classTableBody.innerHTML = classes
      .map((item, index) => {
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${item.className || "-"}</td>
            <td>${item.homeroomTeacher || "-"}</td>
            <td>${item.studentCount ?? "-"}</td>
            <td>${item.classNote || "-"}</td>
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
        const classes = getClasses();
        const item = classes[index];
        if (!item) return;

        classNameInput.value = item.className || "";
        homeroomTeacherInput.value = item.homeroomTeacher || "";
        studentCountInput.value = item.studentCount ?? "";
        classNoteInput.value = item.classNote || "";

        editingIndex = index;
        saveClassBtn.textContent = "Update Data";
        showMessage("Data kelas siap diedit.", "success");
      });
    });

    document.querySelectorAll("button[data-action='delete']").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = Number(this.dataset.index);
        const classes = getClasses();
        const item = classes[index];
        if (!item) return;

        const confirmDelete = confirm(`Hapus data kelas "${item.className}"?`);
        if (!confirmDelete) return;

        classes.splice(index, 1);
        setClasses(classes);
        renderClasses();
        resetForm();
        showMessage("Data kelas berhasil dihapus.", "success");
      });
    });
  }

  function saveClass() {
    const className = classNameInput.value.trim();
    const homeroomTeacher = homeroomTeacherInput.value.trim();
    const studentCount = studentCountInput.value.trim();
    const classNote = classNoteInput.value.trim();

    if (!className || !homeroomTeacher || !studentCount) {
      showMessage("Nama kelas, wali kelas, dan jumlah siswa harus diisi.", "error");
      return;
    }

    const classes = getClasses();
    const duplicateIndex = classes.findIndex(
      (c, idx) => c.className === className && idx !== editingIndex
    );

    if (duplicateIndex !== -1) {
      showMessage("Nama kelas sudah digunakan.", "error");
      return;
    }

    const newData = {
      className,
      homeroomTeacher,
      studentCount: Number(studentCount),
      classNote
    };

    if (editingIndex !== null) {
      classes[editingIndex] = newData;
      showMessage("Data kelas berhasil diperbarui.", "success");
    } else {
      classes.push(newData);
      showMessage("Data kelas berhasil ditambahkan.", "success");
    }

    setClasses(classes);
    renderClasses();
    resetForm();
  }

  teacherInfo.textContent = `Login sebagai: ${teacherName}`;

  saveClassBtn.addEventListener("click", saveClass);
  resetFormBtn.addEventListener("click", resetForm);

  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("teacherName");
    localStorage.removeItem("username");
    window.location.href = "index.html";
  });

  renderClasses();
});