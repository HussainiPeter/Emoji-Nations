# 🌍 Emoji Nations: Launch Guide

This app is ready to be hosted on **GitHub Pages**. Follow these steps to go live:

## 1. Prepare your GitHub Repository
1. Create a new repository on GitHub (e.g., `emoji-nations`).
2. Do **not** initialize with a README (you already have one).

## 2. Push your code
Open your terminal in this project folder and run:
```bash
git init
git add .
git commit -m "Initial launch"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/emoji-nations.git
git push -u origin main
```

## 3. Set up your API Key (Securely)
Since this app uses the Gemini API, you need to provide your key:
1. Go to your GitHub Repo > **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret**.
3. Name: `API_KEY`
4. Value: `YOUR_GEMINI_API_KEY_HERE`

## 4. Enable GitHub Pages
1. Go to **Settings** > **Pages**.
2. Under **Build and deployment** > **Source**, select **GitHub Actions**.
3. The included `.github/workflows/deploy.yml` will now automatically build and host your site every time you push code!

## 5. Playing the App
Once the Action finishes (check the "Actions" tab), your site will be live at:
`https://YOUR_USERNAME.github.io/emoji-nations/`

---
### 🛠 Development Commands
- `npm install`: Install dependencies.
- `npm run dev`: Start local development server.
- `npm run build`: Create production bundle.
- `npm run preview`: Test the production build locally.
