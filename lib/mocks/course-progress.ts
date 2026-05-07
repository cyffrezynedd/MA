import AsyncStorage from '@react-native-async-storage/async-storage';

const progressKey = (courseId: number) => `mock:course:${courseId}:tests`;
const LAST_VISITED_COURSE_KEY = 'mock:last-visited-course-id';
/** Последний курс, где пользователь менял прохождение тестов */
const LAST_TESTS_COURSE_KEY = 'mock:last-tests-course-id';
const voteKey = (courseId: number) => `mock:course:${courseId}:vote`;

export type CourseVote = 'like' | 'dislike';

export async function getCompletedTests(courseId: number): Promise<string[]> {
  const raw = await AsyncStorage.getItem(progressKey(courseId));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function setCompletedTests(courseId: number, testIds: string[]) {
  await AsyncStorage.setItem(progressKey(courseId), JSON.stringify(testIds));
}

export async function getLastVisitedCourseId(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(LAST_VISITED_COURSE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function setLastVisitedCourseId(courseId: number) {
  await AsyncStorage.setItem(LAST_VISITED_COURSE_KEY, String(courseId));
}

export async function getLastTestsCourseId(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(LAST_TESTS_COURSE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function setLastTestsCourseId(courseId: number) {
  await AsyncStorage.setItem(LAST_TESTS_COURSE_KEY, String(courseId));
}

export async function getCourseVote(courseId: number): Promise<CourseVote | null> {
  const raw = await AsyncStorage.getItem(voteKey(courseId));
  return raw === 'like' || raw === 'dislike' ? raw : null;
}

export async function setCourseVote(courseId: number, vote: CourseVote | null) {
  if (vote == null) await AsyncStorage.removeItem(voteKey(courseId));
  else await AsyncStorage.setItem(voteKey(courseId), vote);
}

/** Курсы, у которых отмечены все тесты */
export async function filterFullyCompletedCourseIds(
  courses: { id: number; testsLength: number }[]
): Promise<number[]> {
  const ids = await Promise.all(
    courses.map(async ({ id, testsLength }) => {
      if (testsLength <= 0) return null;
      const done = await getCompletedTests(id);
      return done.length >= testsLength ? id : null;
    })
  );
  return ids.filter((x): x is number => x != null);
}

