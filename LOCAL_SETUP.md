# How to Run Roadwise Locally

This guide covers how to run **Roadwise Navigator** on your local computer. 

Since Roadwise is built using **pure HTML, CSS, and modern JavaScript (ES Modules)**, you can run it **with or without Node.js**.

---

## ⚠️ Important Note: ES Modules & Local Hosting
Because the application uses modern JavaScript modules (`<script type="module" src="...">`), opening `index.html` by double-clicking it (via `file:///`) will be blocked by browser security (CORS policy). 

You simply need a **local HTTP server** to serve the files. Choose whichever option below is easiest for you!

---

## Method 1: Without Node.js (Easiest & Fastest)

### Option 1A: Using VS Code Live Server (Recommended for beginners)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey) from the VS Code Marketplace.
3. Right-click on `index.html` and select **"Open with Live Server"**.
4. Your browser will automatically open `http://127.0.0.1:5500/index.html`.

---

### Option 1B: Using Python (Already installed on most Mac, Linux & Windows systems)
Open your terminal or command prompt in the project root folder:

```bash
# Python 3
python3 -m http.server 8000

# Or on Windows if python3 is just 'python':
python -m http.server 8000
```
Open your browser and navigate to:
```
http://localhost:8000
```

---

### Option 1C: Using PHP
If you have PHP installed:
```bash
php -S localhost:8000
```
Open `http://localhost:8000` in your browser.

---

## Method 2: Using Node.js & Vite (Development Workflow)

If you already use Node.js and want fast development reloading:

### 1. Install dependencies:
```bash
npm install
```

### 2. Start the local development server:
```bash
npm run dev
```

### 3. Open in your browser:
Visit:
```
http://localhost:3000
```

### 4. Build for static production (Optional):
```bash
npm run build
```
This outputs a minified, production-ready static website to the `dist/` directory.

---

## Method 3: Free 1-Click Online Hosting (No Server Needed)

You can host this application completely for free without managing a server:

### GitHub Pages
1. Push the code to a GitHub repository.
2. In your repo settings, go to **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**. Your site will be live at `https://<username>.github.io/<repo-name>/`.

### Netlify or Vercel
1. Drag and drop the project folder onto [Netlify Drop](https://app.netlify.com/drop).
2. It goes live immediately with a free HTTPS URL.

---

## Browser Geolocation Tip
- For the **🎯 GPS** button to pinpoint your live location, modern browsers require either `http://localhost` or a secure `https://` connection.
- If GPS is disabled or blocked in your browser, Roadwise will automatically default to the Pagadian City center so all features continue to work seamlessly.
