module.exports = async ({ github, context }) => {
  const { title, number } = context.payload.pull_request;

  const conventionalCommitRegex =
    /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([\w ,-]+\))?(!?:\s+)([\w ]+[\s\S]*)/i;

  if (!title) {
    console.log("No title found, ending run.");
    return;
  }

  const match = title.match(conventionalCommitRegex);

  if (!match || match.length < 2) {
    console.log("Title does not match conventional commit regex, ending run.");
    return;
  }

  // commit type is in the first match group
  const typeLabel = getLabelName(match[1]);

  try {
    await github.rest.issues.addLabels({
      issue_number: number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      labels: [typeLabel],
    });
  } catch (error) {
    console.error(
      "Unable to label pull request, the author likely does not have write permissions\n",
      error,
    );
    process.exit(0);
  }
};

function getLabelName(type) {
  switch (type) {
    case "feat":
      return "enhancement";
    case "fix":
      return "bug";
    case "docs":
      return "documentation";
    case "test":
      return "testing";
    case "perf":
      return "performance";
    default:
      return "chore";
  }
}
