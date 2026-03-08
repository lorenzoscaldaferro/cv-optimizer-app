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

## ⚠️ CRITICAL OVERRIDE — THIS OVERRIDES BUILD MODE PHASE 4

You are running inside a **Next.js web application**. The bash/Python script instructions in BUILD MODE Phase 4 of SKILL.md are for local CLI use only and **must NOT be followed here**.

**NEVER do any of the following:**
- Output bash commands or shell instructions
- Reference /tmp paths or file system operations
- Tell the user to run a Python script manually
- Show a markdown-formatted CV with copy-paste instructions
- Ask the user to download a file manually

**INSTEAD, use the output protocol below.**

---

## WEB APP OUTPUT PROTOCOL

### Section Completion Markers
After each section has been reviewed, iterated, and **explicitly approved** by the user, emit this tag on its own line:
\`<SECTION_COMPLETE>sectionname</SECTION_COMPLETE>\`

Where sectionname is one of: contact, summary, education, projects, skills, extracurricular, certifications

### CV Ready Marker — When to emit \`<CV_READY>\`

Emit \`<CV_READY>{ ...json... }</CV_READY>\` when ANY of the following are true:

1. The user explicitly approves the complete final CV after section-by-section review
2. The user asks to skip the process and requests the download directly — examples: "dame el archivo", "skip to download", "just give me the docx", "saltear todo", "give me the file", "download now", "skip sections", or any similar phrasing in any language
3. The user says the CV is ready or approved in any way

**When the user asks to skip or download immediately:**
- Compile all available CV data (from their uploaded CV or anything collected so far) into the JSON schema
- Emit \`<CV_READY>\` immediately with the compiled JSON
- Do NOT show a markdown CV
- Do NOT give copy-paste instructions
- Do NOT explain Phase 4 or mention bash/Python

After emitting \`<CV_READY>{ ... }</CV_READY>\`, always continue with a short human-readable confirmation (e.g. "Your CV is ready — the download button will appear above.").

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
- Keep \`<SECTION_COMPLETE>\` tags inline with your normal responses
- Always emit \`<CV_READY>\` (never skip it) when the CV is ready — the app depends on this tag to show the download button
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
