const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyXICciWDVF5G36YvRTtGVrq9lahaOam4wFdF_SVJ_U86jRdG2IZ7XUBs2TykrucX_v/exec";

function jsonpRequest(action) {
  return new Promise((resolve, reject) => {
    const callbackName = `__sheetCallback_${action}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Sinkron ${action} timeout.`));
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = (payload) => {
      try {
        if (!payload || !payload.ok) {
          throw new Error(payload?.message || `Gagal mengambil data ${action}.`);
        }
        resolve(payload);
      } catch (error) {
        reject(error);
      } finally {
        cleanup();
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new Error(`Gagal mengambil data ${action} dari Apps Script.`));
    };

    script.src = `${SHEET_WEB_APP_URL}?action=${encodeURIComponent(action)}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

function resolveClassId(value) {
  const classes = loadClasses();
  const raw = String(value || "").trim();
  if (!raw) return "";

  const byId = classes.find(cls => cls.id === raw);
  if (byId) return byId.id;

  const byName = classes.find(cls => cls.name.trim().toLowerCase() === raw.toLowerCase());
  if (byName) return byName.id;

  return raw;
}

function syncClassesFromSheet() {
  return jsonpRequest("classes").then(payload => {
    const normalized = payload.classes
      .map((cls, index) => ({
        id: String(cls.id || `cls-${index + 1}`).trim(),
        name: String(cls.name || cls.nama || "").trim()
      }))
      .filter(cls => cls.name);

    saveClasses(normalized);
    return normalized;
  });
}

function syncStudentsFromSheet() {
  return jsonpRequest("students").then(payload => {
    const classes = loadClasses();
    const fallbackClassId = classes[0]?.id || "";

    const normalized = payload.students
      .map((student, index) => ({
        id: Number(student.id) || index + 1,
        nama: String(student.nama || student.name || "").trim(),
        classId: resolveClassId(student.classId) || fallbackClassId
      }))
      .filter(student => student.nama && student.classId);

    saveStudents(normalized);
    return normalized;
  });
}

function syncAttendanceFromSheet() {
  return jsonpRequest("attendance").then(payload => {
    const rows = Array.isArray(payload.attendance) ? payload.attendance : [];

    const grouped = new Map();

    rows.forEach(item => {
      const date = String(item.date || "").trim();
      const classId = String(item.classId || "").trim();
      const studentId = Number(item.studentId);
      const status = String(item.status || "").trim();

      if (!date || !classId || !Number.isFinite(studentId) || !status) return;

      const key = `${date}|${classId}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push({ studentId, status });
    });

    grouped.forEach((dataItems, key) => {
      const [date, classId] = key.split("|");
      saveAttendance(date, classId, dataItems);
    });

    return rows;
  });
}

function pushAttendanceToSheet(date, classId, records) {
  return new Promise((resolve, reject) => {
    const iframeName = `sync_iframe_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.style.display = "none";

    const form = document.createElement("form");
    form.method = "POST";
    form.action = SHEET_WEB_APP_URL;
    form.target = iframeName;
    form.style.display = "none";

    const payload = {
      action: "saveAttendance",
      date,
      classId,
      records
    };

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify(payload);

    form.appendChild(input);
    document.body.appendChild(iframe);
    document.body.appendChild(form);

    try {
      form.submit();

      setTimeout(() => {
        cleanup();
        resolve({ ok: true, message: "Permintaan sinkron dikirim." });
      }, 200);
    } catch (error) {
      cleanup();
      reject(error);
    }

    function cleanup() {
      if (form.parentNode) form.parentNode.removeChild(form);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }
  });
}