function buildExportData() {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    classes: loadClasses(),
    students: loadStudents(),
    attendance: getAllAttendanceEntries()
  };
}

function exportJson() {
  const data = buildExportData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  const today = new Date().toISOString().split("T")[0];

  a.href = url;
  a.download = `absensi_backup_${today}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function validateImportedData(data) {
  return (
    data &&
    typeof data === "object" &&
    Array.isArray(data.classes) &&
    Array.isArray(data.students) &&
    Array.isArray(data.attendance)
  );
}

function normalizeClassItem(item, index) {
  return {
    id: String(item.id || `cls-${index + 1}`),
    name: String(item.name || item.nama || "").trim()
  };
}

function normalizeStudentItem(item, index, fallbackClassId) {
  return {
    id: Number(item.id) || index + 1,
    nama: String(item.nama || item.name || "").trim(),
    classId: String(item.classId || item.kelasId || fallbackClassId || "")
  };
}

function normalizeAttendanceEntry(entry) {
  return {
    date: String(entry.date || ""),
    classId: String(entry.classId || ""),
    data: Array.isArray(entry.data)
      ? entry.data.map(item => ({
          studentId: Number(item.studentId),
          status: String(item.status || "")
        }))
      : []
  };
}

function clearAllAttendanceStorage() {
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("attendance_")) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

function summarizeImportedData(data) {
  const classNames = new Set(
    loadClasses().map(cls => cls.name.trim().toLowerCase())
  );
  const studentKeys = new Set(
    loadStudents().map(student => `${student.nama.trim().toLowerCase()}|${student.classId}`)
  );
  const attendanceKeys = new Set(
    getAllAttendanceEntries().map(entry => `${entry.date}|${entry.classId}`)
  );

  let newClasses = 0;
  let duplicateClasses = 0;
  let newStudents = 0;
  let duplicateStudents = 0;
  let newAttendance = 0;
  let mergedAttendance = 0;

  data.classes.forEach(rawClass => {
    const cls = normalizeClassItem(rawClass, 0);
    if (!cls.name) return;

    const key = cls.name.toLowerCase();
    if (classNames.has(key)) {
      duplicateClasses++;
    } else {
      newClasses++;
      classNames.add(key);
    }
  });

  const importedClasses = data.classes
    .map((item, index) => normalizeClassItem(item, index))
    .filter(item => item.name);

  const classIdMap = new Map();
  const existingClasses = loadClasses();

  importedClasses.forEach(importedClass => {
    const existing = existingClasses.find(
      cls => cls.name.trim().toLowerCase() === importedClass.name.trim().toLowerCase()
    );
    if (existing) {
      classIdMap.set(importedClass.id, existing.id);
    } else {
      classIdMap.set(importedClass.id, importedClass.id);
    }
  });

  data.students.forEach((rawStudent, index) => {
    const student = normalizeStudentItem(
      rawStudent,
      index,
      importedClasses[0]?.id || ""
    );

    if (!student.nama || !student.classId) return;

    const mappedClassId = classIdMap.get(student.classId) || student.classId;
    const key = `${student.nama.trim().toLowerCase()}|${mappedClassId}`;

    if (studentKeys.has(key)) {
      duplicateStudents++;
    } else {
      newStudents++;
      studentKeys.add(key);
    }
  });

  data.attendance.forEach(rawEntry => {
    const entry = normalizeAttendanceEntry(rawEntry);
    if (!entry.date || !entry.classId) return;

    const key = `${entry.date}|${entry.classId}`;
    if (attendanceKeys.has(key)) {
      mergedAttendance++;
    } else {
      newAttendance++;
      attendanceKeys.add(key);
    }
  });

  return {
    newClasses,
    duplicateClasses,
    newStudents,
    duplicateStudents,
    newAttendance,
    mergedAttendance
  };
}

function importJsonFile(file, mode = "replace") {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      if (!validateImportedData(data)) {
        alert("Format JSON tidak valid.");
        return;
      }

      const summary = summarizeImportedData(data);

      const message =
        `Pratinjau impor:\n\n` +
        `Kelas baru: ${summary.newClasses}\n` +
        `Kelas duplikat: ${summary.duplicateClasses}\n` +
        `Siswa baru: ${summary.newStudents}\n` +
        `Siswa duplikat: ${summary.duplicateStudents}\n` +
        `Absensi baru: ${summary.newAttendance}\n` +
        `Absensi yang akan digabung: ${summary.mergedAttendance}\n\n` +
        `Lanjutkan impor?`;

      if (!confirm(message)) {
        return;
      }

      if (mode === "replace") {
        replaceImportedData(data);
      } else {
        mergeImportedData(data);
      }

      if (typeof appRenderAll === "function") {
        appRenderAll();
      }

      alert(mode === "replace" ? "Import JSON berhasil." : "Data berhasil digabung.");
    } catch {
      alert("File JSON tidak dapat dibaca.");
    }
  };

  reader.readAsText(file);
}

function replaceImportedData(data) {
  const classes = data.classes
    .map(normalizeClassItem)
    .filter(item => item.name);

  const classIdMap = new Map();
  classes.forEach(cls => {
    classIdMap.set(cls.id, cls.id);
  });

  const usedStudentIds = new Set();

  const students = data.students
    .map((student, index) => normalizeStudentItem(student, index, classes[0]?.id || ""))
    .filter(student => student.nama && student.classId)
    .map(student => {
      let finalId = student.id;
      if (!Number.isFinite(finalId) || usedStudentIds.has(finalId)) {
        finalId = usedStudentIds.size > 0 ? Math.max(...Array.from(usedStudentIds)) + 1 : 1;
        while (usedStudentIds.has(finalId)) {
          finalId++;
        }
      }
      usedStudentIds.add(finalId);

      return {
        id: finalId,
        nama: student.nama,
        classId: classIdMap.get(student.classId) || student.classId
      };
    });

  const attendance = data.attendance
    .map(normalizeAttendanceEntry)
    .filter(entry => entry.date && entry.classId)
    .map(entry => ({
      date: entry.date,
      classId: classIdMap.get(entry.classId) || entry.classId,
      data: entry.data
        .filter(item => Number.isFinite(item.studentId) && item.status)
        .map(item => ({
          studentId: Number(item.studentId),
          status: String(item.status)
        }))
    }));

  saveClasses(classes);
  saveStudents(students);

  clearAllAttendanceStorage();

  attendance.forEach(entry => {
    saveAttendance(entry.date, entry.classId, entry.data);
  });
}

function mergeImportedData(data) {
  const existingClasses = loadClasses();
  const existingStudents = loadStudents();
  const existingAttendance = getAllAttendanceEntries();

  const mergedClasses = [...existingClasses];
  const classNameMap = new Map();

  existingClasses.forEach(cls => {
    classNameMap.set(cls.name.trim().toLowerCase(), cls);
  });

  const classIdMap = new Map();

  data.classes
    .map(normalizeClassItem)
    .filter(item => item.name)
    .forEach(importedClass => {
      const importedNameKey = importedClass.name.trim().toLowerCase();
      const existingByName = classNameMap.get(importedNameKey);

      if (existingByName) {
        classIdMap.set(importedClass.id, existingByName.id);
        return;
      }

      let finalId = importedClass.id;
      const usedIds = new Set(mergedClasses.map(cls => cls.id));

      if (usedIds.has(finalId) || !finalId) {
        finalId = generateClassId();
        while (usedIds.has(finalId)) {
          finalId = generateClassId();
        }
      }

      const newClass = {
        id: finalId,
        name: importedClass.name
      };

      mergedClasses.push(newClass);
      classNameMap.set(importedNameKey, newClass);
      classIdMap.set(importedClass.id, finalId);
    });

  saveClasses(mergedClasses);

  const mergedStudents = [...existingStudents];
  const studentKeyMap = new Map();
  const usedStudentIds = new Set(mergedStudents.map(student => Number(student.id)));

  mergedStudents.forEach(student => {
    const key = `${String(student.nama).trim().toLowerCase()}|${student.classId}`;
    studentKeyMap.set(key, student);
  });

  const studentIdMap = new Map();

  data.students
    .map((student, index) => {
      const mappedClassId = classIdMap.get(String(student.classId)) || String(student.classId || "");
      return normalizeStudentItem(student, index, mappedClassId);
    })
    .filter(student => student.nama && student.classId)
    .forEach(importedStudent => {
      const key = `${importedStudent.nama.trim().toLowerCase()}|${importedStudent.classId}`;
      const existing = studentKeyMap.get(key);

      if (existing) {
        studentIdMap.set(importedStudent.id, existing.id);
        return;
      }

      let finalId = importedStudent.id;
      if (!Number.isFinite(finalId) || usedStudentIds.has(finalId)) {
        finalId = usedStudentIds.size > 0 ? Math.max(...Array.from(usedStudentIds)) + 1 : 1;
        while (usedStudentIds.has(finalId)) {
          finalId++;
        }
      }

      const newStudent = {
        id: finalId,
        nama: importedStudent.nama,
        classId: importedStudent.classId
      };

      mergedStudents.push(newStudent);
      usedStudentIds.add(finalId);
      studentKeyMap.set(key, newStudent);
      studentIdMap.set(importedStudent.id, finalId);
    });

  saveStudents(mergedStudents);

  const attendanceMap = new Map();

  existingAttendance.forEach(entry => {
    const key = `${entry.date}|${entry.classId}`;
    attendanceMap.set(
      key,
      entry.data.map(item => ({
        studentId: Number(item.studentId),
        status: String(item.status || "")
      }))
    );
  });

  data.attendance
    .map(normalizeAttendanceEntry)
    .filter(entry => entry.date && entry.classId)
    .forEach(importedEntry => {
      const mappedClassId = classIdMap.get(importedEntry.classId) || importedEntry.classId;
      const key = `${importedEntry.date}|${mappedClassId}`;
      const current = attendanceMap.get(key) || [];
      const currentMap = new Map(current.map(item => [Number(item.studentId), String(item.status || "")]));

      importedEntry.data.forEach(item => {
        const mappedStudentId = studentIdMap.get(Number(item.studentId)) || Number(item.studentId);
        currentMap.set(mappedStudentId, String(item.status || ""));
      });

      attendanceMap.set(
        key,
        Array.from(currentMap.entries()).map(([studentId, status]) => ({
          studentId,
          status
        }))
      );
    });

  clearAllAttendanceStorage();

  attendanceMap.forEach((dataItems, key) => {
    const [date, classId] = key.split("|");
    saveAttendance(date, classId, dataItems);
  });
}