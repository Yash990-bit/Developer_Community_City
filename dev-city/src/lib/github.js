/**
 * Fetches user stats from GitHub API
 * @param {string} username 
 * @param {string} accessToken 
 */
export async function getGitHubStats(username, accessToken) {
  // Mock Data Fallback for testing without keys
  if (!accessToken || !process.env.GITHUB_ID) {
    return {
      username: username || "citizen_42",
      repos: 12 + Math.floor(Math.random() * 20),
      stars: 45 + Math.floor(Math.random() * 100),
      commits: 150 + Math.floor(Math.random() * 500),
      topLanguages: ["JavaScript", "Python", "React"].sort(() => 0.5 - Math.random()).slice(0, 3)
    };
  }

  try {
    const headers = {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    };

    // 0. If accessToken is provided but username is name/id or missing, get the true login
    let githubUsername = username;
    if (accessToken) {
      const selfRes = await fetch(`https://api.github.com/user`, { headers });
      const selfData = await selfRes.json();
      if (selfData.login) {
        githubUsername = selfData.login;
      }
    }

    if (!githubUsername) return null;

    // 1. Get User Profile (Repos, Followers, etc.)
    const userRes = await fetch(`https://api.github.com/users/${githubUsername}`, { headers });
    const userData = await userRes.json();

    // 2. Get Total Stars received and Languages
    const reposRes = await fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100`, { headers });
    const reposData = await reposRes.json();
    
    let totalStars = 0;
    const languageCounts = {};
    
    if (Array.isArray(reposData)) {
      reposData.forEach(repo => {
        totalStars += repo.stargazers_count || 0;
        if (repo.language) {
          languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
      });
    }

    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    // 3. (Optional/Simplified) Total Commits
    // For a real app, you might use GraphQL to sum all commits across all repos.
    // For now, we'll use a heuristic or mock this part if it's too slow.
    const totalCommits = userData.public_repos * 15; // Mocking commit count based on repos for demo

    return {
      username: userData.login,
      avatar: userData.avatar_url,
      repos: userData.public_repos,
      followers: userData.followers,
      stars: totalStars,
      commits: totalCommits,
      bio: userData.bio,
      topLanguages
    };
  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    return null;
  }
}
