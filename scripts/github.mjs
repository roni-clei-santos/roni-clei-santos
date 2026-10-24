// Reads repository metadata (description and main language) from the GitHub REST API.

const API = 'https://api.github.com';

/**
 * @param {string} repo - "owner/name"
 * @param {{ fetchImpl?: typeof fetch, token?: string }} [options]
 * @returns {Promise<{ name: string, description: string, language: string | null, url: string }>}
 */
export async function fetchRepo(repo, { fetchImpl = fetch, token } = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'roneclay-profile-build',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetchImpl(`${API}/repos/${repo}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API answered ${response.status} for ${repo}`);
  }
  const data = await response.json();
  return {
    name: data.name,
    description: (data.description ?? '').trim(),
    language: data.language ?? null,
    url: data.html_url,
  };
}

/**
 * Fetch every featured repository. A description missing on GitHub falls back to the one in profile.json.
 *
 * @param {Array<{ repo: string, fallbackDescription?: string }>} featured
 */
export async function fetchFeatured(featured, options = {}) {
  return Promise.all(
    featured.map(async ({ repo, fallbackDescription = '' }) => {
      const data = await fetchRepo(repo, options);
      return { ...data, description: data.description || fallbackDescription };
    }),
  );
}
