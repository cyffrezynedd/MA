export type GoHubRepository = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  stargazersCount: number;
  language?: string;
};
