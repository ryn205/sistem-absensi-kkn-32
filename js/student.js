let editingStudentId = null;

function getFilteredStudents(students) {
  const classFilter = document.getElementById("studentClassFilter").value;
  const searchText = document.getElementById("studentSearch").value.trim().toLowerCase();

  return students.filter(student => {
    const classMatch = classFilter === "ALL" || student.classId === classFilter;
    const searchMatch = student.nama.toLowerCase().includes(searchText);
    return classMatch && searchMatch;
  });
}

function renderStudentTable(students) {
  const table = document.getElementById("studentTable");
  const classes = loadClasses();
  const filtered = getFilteredStudents(students);

  table.innerHTML = "";

  if (filtered.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">Data siswa tidak ditemukan.</td>
      </tr>
    `;
    return;
  }

  filtered.forEach((student, index) => {
    const className = getClassNameById(student.classId);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${student.nama}</td>
      <td>${className}</td>
      <td>
        <div class="action-group">
          <button class="btn-edit" data-id="${student.id}">Edit</button>
          <button class="btn-delete" data-id="${student.id}">Hapus</button>
        </div>
      </td>
    `;
    table.appendChild(row);
  });

  document.querySelectorAll("#studentTable .btn-edit").forEach(button => {
    button.addEventListener("click", () => {
      startEditStudent(Number(button.dataset.id));
    });
  });

  document.querySelectorAll("#studentTable .btn-delete").forEach(button => {
    button.addEventListener("click", () => {
      deleteStudent(Number(button.dataset.id));
    });
  });
}

function startEditStudent(id) {
  const students = loadStudents();
  const student = students.find(item => item.id === id);
  if (!student) return;

  editingStudentId = id;
  document.getElementById("studentName").value = student.nama;
  document.getElementById("studentClass").value = student.classId;
  document.getElementById("studentFormTitle").textContent = "Edit Siswa";
  document.getElementById("saveStudentBtn").textContent = "Simpan Perubahan";
  document.getElementById("cancelEditBtn").style.display = "inline-block";
}

function cancelEditStudent() {
  editingStudentId = null;
  document.getElementById("studentName").value = "";
  document.getElementById("studentClass").value = loadClasses()[0]?.id || "";
  document.getElementById("studentFormTitle").textContent = "Tambah Siswa";
  document.getElementById("saveStudentBtn").textContent = "Tambah Siswa";
  document.getElementById("cancelEditBtn").style.display = "none";
}

function saveStudent() {
  const nameInput = document.getElementById("studentName");
  const classInput = document.getElementById("studentClass");
  const nama = nameInput.value.trim();
  const classId = classInput.value;

  if (!nama) {
    alert("Nama siswa belum diisi.");
    return;
  }

  const classes = loadClasses();
  if (!classes.some(cls => cls.id === classId)) {
    alert("Kelas tidak ditemukan.");
    return;
  }

  const students = loadStudents();

  if (editingStudentId === null) {
    const nextId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    students.push({ id: nextId, nama, classId });
  } else {
    const index = students.findIndex(item => item.id === editingStudentId);
    if (index !== -1) {
      students[index] = { ...students[index], nama, classId };
    }
  }

  saveStudents(students);
  cancelEditStudent();

  if (typeof appRenderAll === "function") {
    appRenderAll();
  }
}

function deleteStudent(id) {
  const students = loadStudents();
  const student = students.find(item => item.id === id);
  if (!student) return;

  if (!confirm(`Hapus siswa "${student.nama}"?`)) return;

  const updated = students.filter(item => item.id !== id);
  saveStudents(updated);

  if (editingStudentId === id) {
    cancelEditStudent();
  }

  if (typeof appRenderAll === "function") {
    appRenderAll();
  }
}