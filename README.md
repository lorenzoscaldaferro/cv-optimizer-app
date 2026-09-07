# AI CV Optimizer

AI-powered resume/CV optimizer focused on **ATS-friendly formatting and content improvement**. Upload a CV (PDF or DOCX), get structured feedback, and download an editable, optimized version.

🔗 **Live demo:** https://cv-optimizer-app.netlify.app/

---

## Features

- 📄 Upload **PDF / DOCX** (parsed with `pdf-parse` / `mammoth`)
- 🤖 AI analysis & rewriting with **Google Gemini**
- ✅ ATS-oriented structure and improvement suggestions
- ✏️ Editable output with **DOCX export**
- 🎨 Clean UI — shadcn/ui, Tailwind CSS and Framer Motion

---

## Tech stack

- **Next.js 14** (App Router) · **TypeScript**
- **Google Generative AI** (Gemini)
- **Prisma** + **PostgreSQL**
- **Tailwind CSS** · **shadcn/ui**

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
#    Create a .env file with:
#      GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
#      DATABASE_URL=your_postgres_url

# 3. Set up the database
npx prisma generate

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

Deployed as a static/serverless build on Netlify. Any Next.js-compatible host (Vercel, Netlify) works.
