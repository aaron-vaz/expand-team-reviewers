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
  const requestedReviewers = payload.pull_request.requested_reviewers.map(
    (reviewer) => reviewer.login
  );
  const requestedTeams = payload.pull_request.requested_teams.map(
    (team: EventPayloads.WebhookPayloadTeamTeam) => team.slug
  );

  core.info("Requesting info for PR");

  if (requestedTeams.length === 0) {
    core.info("No teams reviewers added to this PR");
    return;
  }

  await Promise.all(
    requestedTeams.map((team) => {
      core.info(`Getting members from the following team: ${team}`);

      return client.teams.listMembersInOrg({
        org: payload.repository.owner.login,
        team_slug: team,
      });
    })
  ).then((res) => {
    const reviewers = res
      .flatMap((payload) => payload.data)
      .map((member) => member.login)
      .filter((member) => !requestedReviewers.includes(member)) // filter out reviewers that have already been requested
      .filter((login) => login !== payload.pull_request.user.login); // filter out author of PR

    if (reviewers.length === 0) {
      core.info(
        "Team reviewers are only made up of the author of the PR/Members that are have already been requested"
      );
      return;
    }

    core.info(`Requesting reviews from the following members: ${reviewers}`);

    return client.pulls.requestReviewers({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pull_number: payload.pull_request.number,
      reviewers: [...new Set(reviewers)], // the same members can be in multiple teams so we only get a list of unique members
    });
  });
}

run().catch(core.setFailed);
