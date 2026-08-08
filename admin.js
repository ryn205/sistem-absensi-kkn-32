document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const teacherInfo = document.getElementById("teacherInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  const teacherNameInput = document.getElementById("teacherName");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const allowedClassSelect = document.getElementById("allowedClass");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const message = document.getElementById("message");
  const teacherTableBody = document.getElementById("teacherTableBody");
  const emptyState = document.getElementById("emptyState");

  let editingIndex = null;

  function getUserAccounts() {
    try {
      return JSON.parse(localStorage.getItem("userAccounts") || "[]");
    } catch {
      return [];
    }
  }

  function setUserAccounts(accounts) {
    localStorage.setItem("userAccounts", JSON.stringify(accounts));
  }

  function getClassesData() {
    try {
      return JSON.parse(localStorage.getItem("classesData") || "[]");
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

  function resetForm() {
    teacherNameInput.value = "";
    usernameInput.value = "";
    passwordInput.value = "";
    editingIndex = null;
    saveBtn.textContent = "Simpan Guru";
    clearMessage();
    populateClassOptions();
  }

  function populateClassOptions() {
    const classes = getClassesData().filter((item) => item && item.className);
    allowedClassSelect.innerHTML = "";

    if (classes.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "Belum ada data kelas";
      allowedClassSelect.appendChild(option);
      allowedClassSelect.disabled = true;
      return;
    }

    allowedClassSelect.disabled = false;

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Pilih kelas";
    allowedClassSelect.appendChild(defaultOption);

    classes.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.className;
      option.textContent = item.className;
      allowedClassSelect.appendChild(option);
    });
  }

  function renderTeachers() {
    const accounts = getUserAccounts().filter((acc) => acc.role === "teacher");

    if (accounts.length === 0) {
      teacherTableBody.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    teacherTableBody.innerHTML = accounts
      .map((acc, index) => {
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${acc.name || "-"}</td>
            <td>${acc.username || "-"}</td>
            <td><span class="status-badge">${acc.allowedClass || "-"}</span></td>
            <td>${acc.role || "-"}</td>
            <td>
              <div class="inline-actions">
                <button class="btn btn-secondary" data-action="edit" data-username="${acc.username}">Edit</button>
                <button class="btn btn-danger" data-action="delete" data-username="${acc.username}">Hapus</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    document.querySelectorAll("button[data-action='edit']").forEach((btn) => {
      btn.addEventListener("click", function () {
        const username = this.dataset.username;
        const accounts = getUserAccounts();
        const index = accounts.findIndex((acc) => acc.username === username && acc.role === "teacher");
        const acc = accounts[index];
        if (!acc) return;

        teacherNameInput.value = acc.name || "";
        usernameInput.value = acc.username || "";
        passwordInput.value = "";
        allowedClassSelect.value = acc.allowedClass || "";

        editingIndex = index;
        saveBtn.textContent = "Update Guru";
        showMessage("Data guru siap diedit. Isi password hanya jika ingin mengubahnya.", "success");
      });
    });

    document.querySelectorAll("button[data-action='delete']").forEach((btn) => {
      btn.addEventListener("click", function () {
        const username = this.dataset.username;
        const accounts = getUserAccounts();
        const index = accounts.findIndex((acc) => acc.username === username && acc.role === "teacher");
        const acc = accounts[index];
        if (!acc) return;

        const confirmDelete = confirm(`Hapus akun guru "${acc.name}"?`);
        if (!confirmDelete) return;

        accounts.splice(index, 1);
        setUserAccounts(accounts);
        renderTeachers();
        resetForm();
        showMessage("Akun guru berhasil dihapus.", "success");
      });
    });
  }

  function saveTeacher() {
    const name = teacherNameInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const allowedClass = allowedClassSelect.value;

    if (!name || !username || (!editingIndex && !password) || !allowedClass) {
      showMessage("Nama, username, password, dan kelas harus diisi.", "error");
      return;
    }

    const accounts = getUserAccounts();
    const duplicateUsername = accounts.findIndex(
      (acc, idx) => acc.username === username && idx !== editingIndex
    );

    if (duplicateUsername !== -1) {
      showMessage("Username sudah digunakan.", "error");
      return;
    }

    const existing = editingIndex !== null ? accounts[editingIndex] : null;

    const newTeacher = {
      name,
      username,
      password: password || (existing ? existing.password : ""),
      role: "teacher",
      allowedClass,
    };

    if (editingIndex !== null) {
      accounts[editingIndex] = newTeacher;
      showMessage("Akun guru berhasil diperbarui.", "success");
    } else {
      accounts.push(newTeacher);
      showMessage("Akun guru berhasil ditambahkan.", "success");
    }

    setUserAccounts(accounts);
    renderTeachers();
    resetForm();
  }

  teacherInfo.textContent = currentUser?.role === "admin" ? "Login sebagai: Admin" : "Login sebagai: -";

  populateClassOptions();
  renderTeachers();

  saveBtn.addEventListener("click", saveTeacher);
  resetBtn.addEventListener("click", resetForm);

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("teacherName");
      localStorage.removeItem("username");
      localStorage.removeItem("teacherClass");
      localStorage.removeItem("currentUser");
      window.location.href = "index.html";
    });
  }
});