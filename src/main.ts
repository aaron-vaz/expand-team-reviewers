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

  await client.pulls
    .get({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      pull_number: payload.pull_request.number,
    })
    .then((res) =>
      Promise.all(
        res.data.requested_teams
          .map((team) => team.slug)
          .map((team) =>
            client.teams.listMembersInOrg({
              org: payload.repository.owner.login,
              team_slug: team,
            })
          )
      )
    )
    .then((res) => {
      const reviewers = res
        .flatMap((payload) => payload.data)
        .map((member) => member.login);

      return client.pulls.requestReviewers({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        pull_number: payload.pull_request.number,
        reviewers: reviewers,
      });
    });
}

run().catch((e) => core.setFailed(e.message));
