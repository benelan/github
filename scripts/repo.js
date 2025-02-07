// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
module.exports = async ({ github, context }) => {
  const repos = await github.paginate("GET /user/repos", {
    affiliation: "owner",
    visibility: "public",
    per_page: 100,
  });

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
      // has_discussions: false,
      has_wiki: true,
      allow_update_branch: true,
      delete_branch_on_merge: true,
      allow_merge_commit: false,
      allow_rebase_merge: true,
      allow_squash_merge: true,
      squash_merge_commit_title: "PR_TITLE",
      squash_merge_commit_message: "PR_BODY",
    });

    // allow the default GITHUB_TOKEN to create and approve pull requests
    await github.rest.actions.setGithubActionsDefaultWorkflowPermissionsRepository(
      {
        repo: name,
        owner: owner,
        can_approve_pull_request_reviews: true,
      },
    );

    // Update branch protection
    await github.request(
      `PUT /repos/${owner}/${name}/branches/${repo.default_branch}/protection`,
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
        required_status_checks: undefined,
        required_pull_request_reviews: undefined,
        restrictions: undefined,
      },
    );

    // const LABELS = [
    //   { name: "bug", color: "#d73a4a" },
    //   { name: "chore", color: "#f3c69b" },
    //   { name: "documentation", color: "#0075ca" },
    //   { name: "enhancement", color: "#a2eeef" },
    //   { name: "performance", color: "#B822F7" },
    //   { name: "testing", color: "#fbca04" },
    //   { name: "autorelease: pending", color: "#167618" },
    // ];
    //
    // // Labels
    // const labels = await github.rest.issues.listLabelsForRepo({
    //   owner,
    //   repo: name,
    // });
    //
    // for (const label of LABELS) {
    //   const existing = labels.data.find(
    //     (l) => l.name.toLowerCase() === label.name.toLowerCase(),
    //   );
    //
    //   if (
    //     existing?.color === label.color &&
    //     existing?.description === label.description
    //   ) {
    //     continue;
    //   }
    //
    //   if (existing) {
    //     await github.rest.issues.updateLabel({
    //       owner,
    //       repo: name,
    //       name: label.name,
    //       new_name: label.name,
    //       color: label.color,
    //     });
    //   } else {
    //     await github.rest.issues.createLabel({
    //       owner,
    //       repo: name,
    //       name: label.name,
    //       color: label.color,
    //     });
    //   }
    // }
  }
};
