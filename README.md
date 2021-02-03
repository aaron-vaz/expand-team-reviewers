# Expand Team reviewers

This action expands any team reviewers added to a PR into a individual reviewers

## Inputs

### `token`

**Required** The token used to access the GitHub API.

Please note that this token cannot be the default action token `{{ secrets.GITHUB_TOKEN }}` as that doesn't have the necessary organisation permissions.
Please use a personal access token with `repo` and `org` scopes using [encrypted secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets).

### `label-used-to-trigger`

**Optional** Name of the pull request label that was used to trigger this action so it can be removed after execution.
Defaults to `expand team reviewers`

Please note that this is the preferred method to trigger this action rather then using `review_requested`. `review_requested` causes the action to be triggered each time the action successfully expands a team (it will run again the same amount of times as members in the team).
Although the action has safeguards against making requests for already added reviewers it still requires API call(s) to be made to get a list of team members

## Example usage

```yaml
name: Expand Team Reviewers

on:
  pull_request: # Action only run on PR triggers. It will fail on other triggers
    types: [opened, labeled]

jobs:
  expand-team-reviewers:
    if: ${{ github.event_name != 'labeled' || github.event.label.name == 'expand team reviewers' }}
    runs-on: ubuntu-latest
    steps:
      - uses: aaron-vaz/expand-team-reviewers@v1.1.0
        with:
          token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
```
