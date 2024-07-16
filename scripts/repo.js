// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
module.exports = async ({ github, context }) => {
  const repos = await github.paginate("GET /user/repos", {
    affiliation: "owner",
    visibility: "public",
    per_page: 100,
  });

  const LABELS = [
    // { name: "bug", color: "#d73a4a" },
    // { name: "chore", color: "#f3c69b" },
    // { name: "documentation", color: "#0075ca" },
    // { name: "enhancement", color: "#a2eeef" },
    // { name: "performance", color: "#B822F7" },
    // { name: "testing", color: "#fbca04" },
    { name: "autorelease: pending", color: "#167618" },
  ];

  for (const repo of repos) {
    if (repo.fork || repo.archived || repo.disabled) {
      continue;
    }

    const owner = repo.owner.login;
    const name = repo.name;

    console.log(`Updating ${repo.full_name}...`);
    // Enable repository settings
    await github.rest.repos.update({
      repo: name,
      owner: owner,
      allow_update_branch: true,
      has_discussions: false,
      allow_squash_merge: true,
      allow_rebase_merge: true,
      allow_merge_commit: false,
      has_wiki: true,
      squash_merge_commit_title: "PR_TITLE",
      squash_merge_commit_message: "PR_BODY",
    });

    const branch = repo.default_branch;
    // Update branch protection
    await github.request(
      `PUT /repos/${owner}/${name}/branches/${branch}/protection`,
      {
        headers: {
          accept: "application/vnd.github.v3+json",
        },
        allow_deletions: false,
        allow_force_pushes: false,
        allow_fork_syncing: false,
        block_creations: false,
        enforce_admins: false,
        lock_branch: false,
        required_conversation_resolution: false,
        required_linear_history: true,
        required_signatures: false,
        required_status_checks: null,
        required_pull_request_reviews: null,
        restrictions: null,
      },
    );

    // Labels
    const labels = await github.rest.issues.listLabelsForRepo({
      owner,
      repo: name,
    });

    for (const label of LABELS) {
      const existing = labels.data.find(
        (label) => label.name.toLowerCase() === label.name.toLowerCase(),
      );

      if (
        existing?.color === label.color &&
        existing?.description === label.description
      ) {
        continue;
      }

      if (existing) {
        await github.rest.issues.updateLabel({
          owner,
          repo: name,
          name: label.name,
          new_name: label.name,
          color: label.color,
        });
      } else {
        await github.rest.issues.createLabel({
          owner,
          repo: name,
          name: label.name,
          color: label.color,
        });
      }
    }
  }
};
