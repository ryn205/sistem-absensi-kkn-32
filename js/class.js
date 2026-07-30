let editingClassId = null;

function getClassSelectConfigs() {
  return [
    { id: "kelas", includeAll: false },
    { id: "studentClass", includeAll: false },
    { id: "studentClassFilter", includeAll: true },
    { id: "reportClass", includeAll: false },
    { id: "reportClassMonthly", includeAll: true },
    { id: "reportSemesterClass", includeAll: true }
  ];
}

function renderClassSelects() {
  const classes = loadClasses();

  getClassSelectConfigs().forEach(config => {
    const select = document.getElementById(config.id);
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = "";

    if (config.includeAll) {
      select.appendChild(new Option("Semua Kelas", "ALL"));
    }

    classes.forEach(cls => {
      select.appendChild(new Option(cls.name, cls.id));
    });

    if (currentValue && Array.from(select.options).some(option => option.value === currentValue)) {
      select.value = currentValue;
    } else {
      select.value = config.includeAll ? "ALL" : (classes[0]?.id || "");
    }
  });
}

function renderClassTable() {
  const table = document.getElementById("classTable");
  const classes = loadClasses();
  const students = loadStudents();

  table.innerHTML = "";

  if (classes.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">Belum ada data kelas.</td>
      </tr>
    `;
    return;
  }

  classes.forEach((cls, index) => {
    const totalStudents = students.filter(student => student.classId === cls.id).length;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${cls.name}</td>
      <td>${totalStudents}</td>
      <td>
        <div class="action-group">
          <button class="btn-edit" data-id="${cls.id}">Edit</button>
          <button class="btn-delete" data-id="${cls.id}">Hapus</button>
        </div>
      </td>
    `;
    table.appendChild(row);
  });

  document.querySelectorAll("#classTable .btn-edit").forEach(button => {
    button.addEventListener("click", () => {
      startEditClass(button.dataset.id);
    });
  });

  document.querySelectorAll("#classTable .btn-delete").forEach(button => {
    button.addEventListener("click", () => {
      deleteClass(button.dataset.id);
    });
  });
}

function startEditClass(classId) {
  const classes = loadClasses();
  const cls = classes.find(item => item.id === classId);
  if (!cls) return;

  editingClassId = classId;
  document.getElementById("className").value = cls.name;
  document.getElementById("classFormTitle").textContent = "Edit Kelas";
  document.getElementById("saveClassBtn").textContent = "Simpan Perubahan";
  document.getElementById("cancelEditClassBtn").style.display = "inline-block";
}

function cancelEditClass() {
  editingClassId = null;
  document.getElementById("className").value = "";
  document.getElementById("classFormTitle").textContent = "Tambah Kelas";
  document.getElementById("saveClassBtn").textContent = "Tambah Kelas";
  document.getElementById("cancelEditClassBtn").style.display = "none";
}

function saveClass() {
  const nameInput = document.getElementById("className");
  const className = nameInput.value.trim();

  if (!className) {
    alert("Nama kelas belum diisi.");
    return;
  }

  const classes = loadClasses();
  const duplicate = classes.some(cls =>
    cls.name.toLowerCase() === className.toLowerCase() &&
    cls.id !== editingClassId
  );

  if (duplicate) {
    alert("Nama kelas sudah digunakan.");
    return;
  }

  if (editingClassId === null) {
    classes.push({
      id: generateClassId(),
      name: className
    });
  } else {
    const index = classes.findIndex(item => item.id === editingClassId);
    if (index !== -1) {
      classes[index] = {
        ...classes[index],
        name: className
      };
    }
  }

  saveClasses(classes);
  cancelEditClass();

  if (typeof appRenderAll === "function") {
    appRenderAll();
  } else {
    renderClassSelects();
    renderClassTable();
  }
}

function deleteClass(classId) {
  const classes = loadClasses();
  const cls = classes.find(item => item.id === classId);

  if (!cls) return;

  const students = loadStudents();
  const studentCount = students.filter(student => student.classId === classId).length;

  if (studentCount > 0) {
    alert(
      `Kelas "${cls.name}" masih memiliki ${studentCount} siswa.\n` +
      `Pindahkan atau hapus siswa dari kelas ini terlebih dahulu.`
    );
    return;
  }

  if (!confirm(
    `Hapus kelas "${cls.name}"?\n\n` +
    `Riwayat absensi kelas ini juga akan dihapus.`
  )) {
    return;
  }

  const updatedClasses = classes.filter(item => item.id !== classId);
  saveClasses(updatedClasses);
  removeAttendanceByClassId(classId);

  if (editingClassId === classId) {
    cancelEditClass();
  }

  if (typeof appRenderAll === "function") {
    appRenderAll();
  } else {
    renderClassSelects();
    renderClassTable();
  }
}
