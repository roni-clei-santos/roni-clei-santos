// Reads repository metadata (description, main language and latest release) from the GitHub REST API.

const API = 'https://api.github.com';

function headersFor(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'roni-clei-santos-profile-build',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * @param {string} repo - "owner/name"
 * @param {{ fetchImpl?: typeof fetch, token?: string }} [options]
 * @returns {Promise<{ name: string, description: string, language: string | null, url: string }>}
 */
export async function fetchRepo(repo, { fetchImpl = fetch, token } = {}) {
  const response = await fetchImpl(`${API}/repos/${repo}`, { headers: headersFor(token) });
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
 * Tag of the latest published release, or null when the repository has no release yet.
 *
 * @param {string} repo - "owner/name"
 * @param {{ fetchImpl?: typeof fetch, token?: string }} [options]
 * @returns {Promise<string | null>}
 */
export async function fetchLatestRelease(repo, { fetchImpl = fetch, token } = {}) {
  const response = await fetchImpl(`${API}/repos/${repo}/releases/latest`, { headers: headersFor(token) });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub API answered ${response.status} for the latest release of ${repo}`);
  }
  const data = await response.json();
  return typeof data.tag_name === 'string' && data.tag_name !== '' ? data.tag_name : null;
}

/**
 * Fetch every featured repository. A description missing on GitHub falls back to the one in profile.json.
 *
 * @param {Array<{ repo: string, fallbackDescription?: string, highlights?: string[] }>} featured
 */
export async function fetchFeatured(featured, options = {}) {
  return Promise.all(
    featured.map(async ({ repo, fallbackDescription = '', highlights = [] }) => {
      const [data, release] = await Promise.all([fetchRepo(repo, options), fetchLatestRelease(repo, options)]);
      return { ...data, description: data.description || fallbackDescription, release, highlights };
    }),
  );
}
