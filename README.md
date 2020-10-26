# Expand Team reviewers

This action expands any team reviewers added to a PR into a individual reviewers

## Inputs

### `token`

**Required** The token used to access the GitHub API.

Please note that this token cannot be the default action token `{{ secrets.GITHUB_TOKEN }}` as that doesn't have the necessary organisation permissions.
Please use a personal access token with `repo` and `org` scopes using [encrypted secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets).

## Example usage

```yaml
name: Expand Team Reviewers

on:
  pull_request: # Action only run on PR triggers. It will fail on other triggers
    types: [opened, review_requested]

jobs:
  expand-team-reviewers:
    runs-on: ubuntu-latest
    steps:
      - uses: aaron-vaz/expand-team-reviewers@v0.1.0
        with:
          token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}
```
