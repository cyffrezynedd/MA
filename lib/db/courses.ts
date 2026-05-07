import * as SQLite from 'expo-sqlite';

export type Course = {
  id: number;
  title: string;
  description: string;
  updatedAt: number;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync('gocourses.db');
  return dbPromise;
}

export async function initCoursesDb() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `);
}

export async function listCourses(): Promise<Course[]> {
  const db = await getDb();
  return await db.getAllAsync<Course>(
    `SELECT id, title, description, updatedAt FROM courses ORDER BY updatedAt DESC;`
  );
}

export async function getCourseById(id: number): Promise<Course | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Course>(
    `SELECT id, title, description, updatedAt FROM courses WHERE id = ?;`,
    [id]
  );
  return row ?? null;
}

export async function createCourse(input: Pick<Course, 'title' | 'description'>): Promise<number> {
  const db = await getDb();
  const updatedAt = Date.now();
  const res = await db.runAsync(
    `INSERT INTO courses (title, description, updatedAt) VALUES (?, ?, ?);`,
    [input.title.trim(), input.description.trim(), updatedAt]
  );
  return res.lastInsertRowId;
}

export async function updateCourse(
  id: number,
  input: Pick<Course, 'title' | 'description'>
): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE courses SET title = ?, description = ?, updatedAt = ? WHERE id = ?;`, [
    input.title.trim(),
    input.description.trim(),
    Date.now(),
    id,
  ]);
}

export async function deleteCourse(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM courses WHERE id = ?;`, [id]);
}

