import * as core from "@actions/core";
import * as github from "@actions/github";
import { EventPayloads } from "@octokit/webhooks";

async function run() {
  const context = github.context;

  if (context.eventName !== "pull_request") {
    core.setFailed(
      "Only pull_request event can be used to trigger this action"
    );
    return;
  }

  const token = core.getInput("token");
  const client = github.getOctokit(token);

  const payload = context.payload as EventPayloads.WebhookPayloadPullRequest;

  core.info("Requesting info for PR");

  await client.pulls
    .get({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pull_number: payload.pull_request.number,
    })
    .then((res) => {
      const requestedTeams = res.data.requested_teams;

      if (requestedTeams.length === 0) {
        core.info("No teams reviewers added to this PR");
        return;
      }

      return Promise.all(
        requestedTeams
          .map((team) => team.slug)
          .map((team) => {
            core.info(`Getting members from the following team: ${team}`);

            return client.teams.listMembersInOrg({
              org: payload.repository.owner.login,
              team_slug: team,
            });
          })
      );
    })
    .then((res) => {
      if (!res) {
        return;
      }

      const reviewers = res
        .flatMap((payload) => payload.data)
        .map((member) => member.login)
        .filter((login) => login !== payload.pull_request.user.login); // filter out author of PR

      if (reviewers.length === 0) {
        core.info("Team reviewers are only made up of the author of the PR");
      }

      core.info(`Requesting reviews from the following members: ${reviewers}`);

      return client.pulls.requestReviewers({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        pull_number: payload.pull_request.number,
        reviewers: reviewers,
      });
    });
}

run().catch(core.setFailed);
