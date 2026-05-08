import type { GoHubRepository } from './types';

type GitHubSearchItem = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language?: string | null;
};

type GitHubSearchResponse = {
  items?: GitHubSearchItem[];
};

function mapItem(item: GitHubSearchItem): GoHubRepository {
  const repo: GoHubRepository = {
    id: item.id,
    name: item.name,
    fullName: item.full_name,
    description: item.description,
    htmlUrl: item.html_url,
    stargazersCount: item.stargazers_count,
  };
  if (item.language != null && item.language !== '') {
    repo.language = item.language;
  }
  return repo;
}

export async function fetchTopGoRepositories(limit: number = 15): Promise<GoHubRepository[]> {
  const url = `https://api.github.com/search/repositories?q=language:go&sort=stars&order=desc&per_page=${limit}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'GoCoursesLab/1.0 (educational)',
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as GitHubSearchResponse;
  const items = data.items ?? [];
  return items.map(mapItem);
}
