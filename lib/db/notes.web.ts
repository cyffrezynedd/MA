export type NoteStatus = 'planned' | 'in_progress' | 'done';

export type CourseNote = {
  id: number;
  courseId: number;
  title: string;
  body: string;
  status: NoteStatus;
  updatedAt: number;
};

const LS_KEY = 'gocourses.web.notes.v1';
const LS_SEQ_KEY = 'gocourses.web.notes.seq.v1';

function readAll(): CourseNote[] {
  try {
    const raw = globalThis.localStorage?.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CourseNote[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: CourseNote[]) {
  try {
    globalThis.localStorage?.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}

function nextId() {
  try {
    const raw = globalThis.localStorage?.getItem(LS_SEQ_KEY);
    const n = raw ? Number(raw) : 0;
    const next = Number.isFinite(n) ? n + 1 : 1;
    globalThis.localStorage?.setItem(LS_SEQ_KEY, String(next));
    return next;
  } catch {
    return Date.now();
  }
}

export async function initNotesDb() {}

export async function listNotes(courseId: number): Promise<CourseNote[]> {
  return readAll()
    .filter((n) => n.courseId === courseId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getNoteById(id: number): Promise<CourseNote | null> {
  return readAll().find((n) => n.id === id) ?? null;
}

export async function createNote(input: Omit<CourseNote, 'id' | 'updatedAt'>): Promise<number> {
  const items = readAll();
  const id = nextId();
  items.push({
    id,
    courseId: input.courseId,
    title: input.title.trim(),
    body: input.body.trim(),
    status: input.status,
    updatedAt: Date.now(),
  });
  writeAll(items);
  return id;
}

export async function updateNote(
  id: number,
  patch: Partial<Pick<CourseNote, 'title' | 'body' | 'status'>>
): Promise<void> {
  const items = readAll();
  const idx = items.findIndex((n) => n.id === id);
  if (idx === -1) return;
  const existing = items[idx]!;
  items[idx] = {
    ...existing,
    title: (patch.title ?? existing.title).trim(),
    body: (patch.body ?? existing.body).trim(),
    status: patch.status ?? existing.status,
    updatedAt: Date.now(),
  };
  writeAll(items);
}

export async function deleteNote(id: number): Promise<void> {
  writeAll(readAll().filter((n) => n.id !== id));
}

