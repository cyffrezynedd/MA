export type Course = {
  id: number;
  title: string;
  description: string;
  updatedAt: number;
};

const LS_KEY = 'gocourses.web.courses.v1';
const LS_SEQ_KEY = 'gocourses.web.courses.seq.v1';

function readAll(): Course[] {
  try {
    const raw = globalThis.localStorage?.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Course[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: Course[]) {
  try {
    globalThis.localStorage?.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
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

export async function initCoursesDb() {}

export async function listCourses(): Promise<Course[]> {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getCourseById(id: number): Promise<Course | null> {
  return readAll().find((c) => c.id === id) ?? null;
}

export async function createCourse(input: Pick<Course, 'title' | 'description'>): Promise<number> {
  const items = readAll();
  const id = nextId();
  items.push({ id, title: input.title.trim(), description: input.description.trim(), updatedAt: Date.now() });
  writeAll(items);
  return id;
}

export async function updateCourse(id: number, input: Pick<Course, 'title' | 'description'>): Promise<void> {
  const items = readAll();
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return;
  items[idx] = {
    ...items[idx],
    title: input.title.trim(),
    description: input.description.trim(),
    updatedAt: Date.now(),
  };
  writeAll(items);
}

export async function deleteCourse(id: number): Promise<void> {
  writeAll(readAll().filter((c) => c.id !== id));
}

