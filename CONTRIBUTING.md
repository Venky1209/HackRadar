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
2. Rebuild the merged dataset with `npm run generate:seed`.
3. Reseed Supabase with `npm run seed`.
4. Verify the dashboard and detail pages still render correctly.

## Pull Requests

- Use descriptive commit messages.
- Include screenshots for UI changes if possible.
- Mention any schema or seed-data changes clearly.

## Reporting Bugs

- Include the browser, screen size, and reproduction steps.
- If the issue is visual, attach a screenshot or short screen recording.
- If the issue affects data, mention the affected hackathon title.