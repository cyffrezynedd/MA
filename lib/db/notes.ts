import * as SQLite from 'expo-sqlite';

export type NoteStatus = 'planned' | 'in_progress' | 'done';

export type CourseNote = {
  id: number;
  courseId: number;
  title: string;
  body: string;
  status: NoteStatus;
  updatedAt: number;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('gocourses.db');
  return dbPromise;
}

export async function initNotesDb() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      courseId INTEGER NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL,
      updatedAt INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_notes_courseId ON notes(courseId);
  `);
}

export async function listNotes(courseId: number): Promise<CourseNote[]> {
  const db = await getDb();
  return await db.getAllAsync<CourseNote>(
    `SELECT id, courseId, title, body, status, updatedAt
     FROM notes WHERE courseId = ?
     ORDER BY updatedAt DESC;`,
    [courseId]
  );
}

export async function getNoteById(id: number): Promise<CourseNote | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CourseNote>(
    `SELECT id, courseId, title, body, status, updatedAt FROM notes WHERE id = ?;`,
    [id]
  );
  return row ?? null;
}

export async function createNote(input: Omit<CourseNote, 'id' | 'updatedAt'>): Promise<number> {
  const db = await getDb();
  const updatedAt = Date.now();
  const res = await db.runAsync(
    `INSERT INTO notes (courseId, title, body, status, updatedAt) VALUES (?, ?, ?, ?, ?);`,
    [input.courseId, input.title.trim(), input.body.trim(), input.status, updatedAt]
  );
  return res.lastInsertRowId;
}

export async function updateNote(
  id: number,
  patch: Partial<Pick<CourseNote, 'title' | 'body' | 'status'>>
): Promise<void> {
  const db = await getDb();
  const existing = await getNoteById(id);
  if (!existing) return;
  const next = {
    title: patch.title ?? existing.title,
    body: patch.body ?? existing.body,
    status: patch.status ?? existing.status,
  };
  await db.runAsync(`UPDATE notes SET title = ?, body = ?, status = ?, updatedAt = ? WHERE id = ?;`, [
    next.title.trim(),
    next.body.trim(),
    next.status,
    Date.now(),
    id,
  ]);
}

export async function deleteNote(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM notes WHERE id = ?;`, [id]);
}

