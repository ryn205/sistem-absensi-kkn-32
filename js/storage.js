const STORAGE_KEYS = {
  classes: "absensi_classes",
  students: "absensi_students"
};

const DEFAULT_CLASSES = [
  { id: "cls-1", name: "VII-A" },
  { id: "cls-2", name: "VII-B" },
  { id: "cls-3", name: "VIII-A" },
  { id: "cls-4", name: "VIII-B" },
  { id: "cls-5", name: "IX-A" },
  { id: "cls-6", name: "IX-B" }
];

const DEFAULT_STUDENTS = [
  { id: 1, nama: "Andi", classId: "cls-1" },
  { id: 2, nama: "Budi", classId: "cls-1" },
  { id: 3, nama: "Citra", classId: "cls-2" },
  { id: 4, nama: "Dini", classId: "cls-3" },
  { id: 5, nama: "Eka", classId: "cls-3" },
  { id: 6, nama: "Farhan", classId: "cls-4" },
  { id: 7, nama: "Gita", classId: "cls-5" },
  { id: 8, nama: "Hana", classId: "cls-6" }
];

function generateClassId() {
  return `cls-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function loadClasses() {
  const raw = localStorage.getItem(STORAGE_KEYS.classes);

  if (!raw) return [...DEFAULT_CLASSES];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_CLASSES];

    if (typeof parsed[0] === "string") {
      return parsed.map((name, index) => ({
        id: `cls-${index + 1}`,
        name: String(name)
      }));
    }

    return parsed
      .map(item => ({
        id: String(item.id || generateClassId()),
        name: String(item.name || item.nama || "").trim()
      }))
      .filter(item => item.name);
  } catch {
    return [...DEFAULT_CLASSES];
  }
}

function saveClasses(classes) {
  localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(classes));
}

function getClassNameById(classId) {
  const cls = loadClasses().find(item => item.id === classId);
  return cls ? cls.name : classId || "-";
}

function getClassIdByName(name) {
  const cls = loadClasses().find(item => item.name.toLowerCase() === String(name).toLowerCase());
  return cls ? cls.id : "";
}

function loadStudents() {
  const raw = localStorage.getItem(STORAGE_KEYS.students);
  const classes = loadClasses();
  const fallbackClassId = classes[0]?.id || DEFAULT_CLASSES[0].id;

  if (!raw) return [...DEFAULT_STUDENTS];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_STUDENTS];

    if (typeof parsed[0] === "string") {
      return parsed.map((nama, index) => ({
        id: index + 1,
        nama: String(nama),
        classId: fallbackClassId
      }));
    }

    return parsed
      .map((student, index) => {
        const oldClassName = student.kelas || "";
        const mappedClassId = student.classId || getClassIdByName(oldClassName) || fallbackClassId;

        return {
          id: Number(student.id) || index + 1,
          nama: String(student.nama || student.name || "").trim(),
          classId: mappedClassId
        };
      })
      .filter(student => student.nama);
  } catch {
    return [...DEFAULT_STUDENTS];
  }
}

function saveStudents(students) {
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
}

function getAttendanceKey(date, classId) {
  return `attendance_${date}_${classId}`;
}

function loadAttendance(date, classId) {
  const raw = localStorage.getItem(getAttendanceKey(date, classId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAttendance(date, classId, data) {
  localStorage.setItem(getAttendanceKey(date, classId), JSON.stringify(data));
}

function removeAttendance(date, classId) {
  localStorage.removeItem(getAttendanceKey(date, classId));
}

function parseAttendanceKey(key) {
  if (!key.startsWith("attendance_")) return null;

  const remainder = key.slice("attendance_".length);
  const separatorIndex = remainder.indexOf("_");
  if (separatorIndex === -1) return null;

  const date = remainder.slice(0, separatorIndex);
  const classId = remainder.slice(separatorIndex + 1);

  return { date, classId };
}

function getAllAttendanceEntries() {
  const entries = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const meta = key ? parseAttendanceKey(key) : null;
    if (!meta) continue;

    try {
      const raw = localStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(data)) continue;

      entries.push({
        date: meta.date,
        classId: meta.classId,
        data
      });
    } catch {
      continue;
    }
  }

  return entries.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.classId.localeCompare(b.classId);
  });
}

function getAttendanceEntriesByMonth(month, classIdFilter = "ALL") {
  return getAllAttendanceEntries().filter(entry => {
    const monthMatch = entry.date.startsWith(`${month}-`);
    const classMatch = classIdFilter === "ALL" || entry.classId === classIdFilter;
    return monthMatch && classMatch;
  });
}

function getAttendanceEntriesInRange(startDate, endDate, classIdFilter = "ALL") {
  return getAllAttendanceEntries().filter(entry => {
    const rangeMatch = entry.date >= startDate && entry.date <= endDate;
    const classMatch = classIdFilter === "ALL" || entry.classId === classIdFilter;
    return rangeMatch && classMatch;
  });
}

function removeAttendanceByClassId(classId) {
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const meta = key ? parseAttendanceKey(key) : null;

    if (meta && meta.classId === classId) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}
