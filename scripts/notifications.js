// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
module.exports = async ({ github, context }) => {
  try {
    /**
     * @param {number} days
     */
    function date(days) {
      return new Date(
        new Date().getTime() - (days ?? 1) * 24 * 60 * 60 * 1000,
      ).toISOString();
    }

    const since = date(parseInt(process.env.SINCE ?? "3"));
    const before = date(
      context.eventName == "workflow_dispatch"
        ? parseInt(process.env.BEFORE ?? "0")
        : 1,
    );

    console.log(`Cleaning up notifications`);
    console.log(`Event name: ${context.eventName}`);
    console.log(`Current date: ${new Date().toISOString()}`);
    console.log(`Since: ${since}`);
    console.log(`Before: ${before}`);

    // Fetch notifications for the current page
    // const notifs = await github.paginate("GET /notifications", {
    //   all: true,
    //   before,
    //   since,
    // });
    //
    // // Loop through each notification and its corresponding ID
    // for (const notif of notifs) {
    //   let done = false;
    //
    //   // Skip discussions, check suites, and releases
    //   if (
    //     ["Discussion", "CheckSuite", "Release"].includes(notif.subject.type)
    //   ) {
    //     done = true;
    //   } else if (["Issue", "PullRequest"].includes(notif.subject.type)) {
    //     const details = await github.request(`GET ${notif.subject.url}`);
    //
    //     // Mark as done if the issue/PR is closed
    //     if (details.data.state === "closed") {
    //       done = true;
    //
    //       // If the issue/PR is open, check if the latest comment is from a bot
    //     } else if (notif.subject.latest_comment_url) {
    //       // Fetch the comment details
    //       const comment = await github.request(
    //         `GET ${notif.subject.latest_comment_url}`,
    //       );
    //
    //       done =
    //         [
    //           "github-actions[bot]",
    //           "renovate[bot]",
    //           "dependabot[bot]",
    //         ].includes(comment.data.user.login) &&
    //         /(stale|Renovate Ignore|:robot: Release is at|Superseded by)/.test(
    //           comment.data.body,
    //         );
    //     }
    //   }
    //
    //   // remove api. and repos/ from the url
    //   const url = (notif.subject.url ?? notif.url)
    //     .replace("api.", "")
    //     .replace("repos/", "");
    //
    //   if (done) {
    //     console.log(
    //       `🧹 [${notif.repository.full_name}] ${notif.subject.title}\n  - ${url}\n`,
    //     );
    //     await github.request(`DELETE /notifications/threads/${notif.id}`, {
    //       thread_id: notif.id,
    //       headers: { "X-GitHub-Api-Version": "2022-11-28" },
    //     });
    //   } else {
    //     console.log(
    //       `👀 [${notif.repository.full_name}] ${notif.subject.title}\n  - ${url}\n`,
    //     );
    //   }
    // }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
