import fs from "fs";
import path from "path";

let cachedPrompt: string | null = null;

function loadSkillPrompt(): string {
  if (cachedPrompt) return cachedPrompt;

  const skillPath = path.join(process.cwd(), "scripts", "SKILL.md");
  let content = fs.readFileSync(skillPath, "utf-8");

  // Strip YAML frontmatter (lines between --- delimiters)
  content = content.replace(/^---[\s\S]*?---\n/, "");

  // Append structured output instructions
  const outputInstructions = `

---

## WEB APP OUTPUT PROTOCOL

You are operating inside a web application. Follow these additional output rules:

### Section Completion Markers
After each section has been reviewed, iterated, and **explicitly approved** by the user, emit this tag on its own line:
\`<SECTION_COMPLETE>sectionname</SECTION_COMPLETE>\`

Where sectionname is one of: contact, summary, education, projects, skills, extracurricular, certifications

### CV Ready Marker
After the user approves the final complete CV review, emit the full CV JSON wrapped in:
\`<CV_READY>{ ... full JSON ... }</CV_READY>\`

Then continue with human-readable next steps text (do NOT stop after the JSON).

The JSON must exactly match this schema:
{
  "contact": { "name": "", "phone": "", "email": "", "linkedin": "", "portfolio": "", "location": "" },
  "summary": "",
  "education": [{ "institution": "", "degree": "", "dates": "", "subtitle": null, "details": [] }],
  "projects": [{ "title": "", "role": "", "dates": "", "subtitle": "", "bullets": [] }],
  "experience": [{ "company": "", "role": "", "dates": "", "location": "", "bullets": [] }],
  "skills": { "Category": "item1, item2" },
  "extracurricular": [{ "organization": "", "role": "", "dates": "", "bullets": [] }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }]
}

### Important
- NEVER emit <CV_READY> until the user has explicitly approved the complete final CV
- Always continue with text after <CV_READY>...</CV_READY> — the user needs to see next steps
- Keep <SECTION_COMPLETE> tags inline with your normal responses
`;

  cachedPrompt = content + outputInstructions;
  return cachedPrompt;
}

export function buildSystemPrompt(parsedCVText?: string): string {
  const base = loadSkillPrompt();

  if (parsedCVText) {
    return (
      base +
      `\n\n---\n\n## UPLOADED CV CONTENT\n\nThe user has uploaded their existing CV. Here is its full text content:\n\n\`\`\`\n${parsedCVText}\n\`\`\`\n\nUse this as the starting point. Run a mental audit, identify gaps and improvements, then guide the user through the BUILD flow section by section.`
    );
  }

  return base;
}
