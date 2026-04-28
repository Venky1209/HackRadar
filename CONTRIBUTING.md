# Contributing to HackRadar

Thanks for helping improve HackRadar.

## Before You Start

- Keep the public experience fast and focused.
- Avoid adding browser-side live scraping.
- Prefer data quality over volume.
- Keep changes small and easy to review.

## Local Workflow

1. Install dependencies with `npm install`.
2. Run the app with `npm run dev`.
3. Check the build with `npm run build` before opening a pull request.

## Adding or Updating Hackathons

1. Edit [data/seed-hackathons.json](data/seed-hackathons.json).
2. Refresh the dataset with `npm run refresh:data`.
3. Verify the dashboard and detail pages still render correctly.
4. If you changed the source data, include the updated JSON in the PR.

## Pull Requests

- Use descriptive commit messages.
- Include screenshots for UI changes if possible.
- Mention any schema or seed-data changes clearly.

## Reporting Bugs

- Include the browser, screen size, and reproduction steps.
- If the issue is visual, attach a screenshot or short screen recording.
- If the issue affects data, mention the affected hackathon title.