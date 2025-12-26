# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Front-end (Admin Client)
- Build: `npm run client:build`
- Upload: Deploy `dist/` contents to your chosen domain/subdomain (e.g. `admin.building.md`) on Host.md.
- SPA Routing: Include `.htaccess` from `public/` to ensure client routes work.

Back-end (API Server)
- Build: `npm run build` (outputs `dist/server.js`).
- Run (general Node environments): `npm run server` or `node dist/server.js`.
- Host.md options:
	- Shared hosting typically requires the Node.js App feature (Passenger). If available, point it to `dist/server.js` and set environment variables.
	- If Node.js is not supported, deploy the API to a VPS or a managed Node host (Render/Railway) and set the Front-end to call that API URL.

Environment Variables
- Create `.env` with values like `PORT=8080`, `MONGO_URI=...`, `JWT_SECRET=...` and configure them in the host’s environment panel.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
