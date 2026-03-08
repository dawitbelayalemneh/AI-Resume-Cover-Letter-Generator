# AI Resume & Cover Letter Generator

An AI-powered tool that helps job seekers create tailored resumes and cover letters optimized for specific job descriptions.

## Features

- **AI Resume Generation** — Upload your resume and a job description to get a tailored, optimized resume
- **AI Cover Letter Generator** — Generate personalized cover letters with introduction, fit analysis, relevant skills, and professional closing
- **AI Resume Improvements** — Get actionable suggestions including missing keywords, skills gaps, and phrasing improvements
- **Edit & Preview** — Edit generated content directly in the app before exporting
- **PDF Export** — Download polished resumes and cover letters as professional PDFs
- **Generation History** — View and revisit past generations from your dashboard

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Lovable Cloud (authentication, database, edge functions)
- **AI:** Google Gemini for content generation and analysis

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
src/
├── components/       # UI components (AuthForm, GeneratorForm, GenerationResult, ResumeAnalysis)
├── hooks/            # Custom React hooks
├── integrations/     # Backend client configuration
├── pages/            # Route pages (Index, Dashboard, Auth)
└── lib/              # Utility functions
supabase/
└── functions/        # Backend functions (generate-resume, analyze-resume, extract-resume)
```

## License

Private project.
