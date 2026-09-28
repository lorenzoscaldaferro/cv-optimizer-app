import { NextRequest } from "next/server";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  TabStopType,
  convertInchesToTwip,
  BorderStyle,
} from "docx";

const FONT = "Calibri";
const MARGIN = convertInchesToTwip(0.75);

// Points → twips (for spacing before/after)
const twip = (pt: number) => pt * 20;
// Points → half-points (for font size)
const hpt = (pt: number) => pt * 2;

interface CVContact {
  name?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  portfolio?: string;
  location?: string;
}
interface CVEducation {
  institution?: string;
  degree?: string;
  dates?: string;
  subtitle?: string | null;
  details?: string[];
}
interface CVProject {
  title?: string;
  role?: string;
  dates?: string;
  subtitle?: string;
  bullets?: string[];
}
interface CVExperience {
  company?: string;
  role?: string;
  dates?: string;
  location?: string;
  bullets?: string[];
}
interface CVExtracurricular {
  organization?: string;
  role?: string;
  dates?: string;
  bullets?: string[];
}
interface CVCertification {
  name?: string;
  issuer?: string;
  date?: string;
}
interface CVData {
  contact?: CVContact;
  summary?: string;
  education?: CVEducation[];
  projects?: CVProject[];
  experience?: CVExperience[];
  skills?: Record<string, string | string[]>;
  extracurricular?: CVExtracurricular[];
  certifications?: CVCertification[];
}

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: twip(6), after: twip(1) },
    border: {
      bottom: {
        color: "AAAAAA",
        style: BorderStyle.SINGLE,
        size: 4,
        space: 1,
      },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        font: FONT,
        size: hpt(11.5),
        bold: true,
        color: "000000",
      }),
    ],
  });
}

function entryHeader(
  title: string,
  role?: string,
  dates?: string,
  subtitle?: string | null
): Paragraph[] {
  const runs: TextRun[] = [
    new TextRun({ text: title, font: FONT, size: hpt(10.5), bold: true, color: "000000" }),
  ];
  if (role) {
    runs.push(new TextRun({ text: `  |  ${role}`, font: FONT, size: hpt(10.5), color: "000000" }));
  }
  if (dates) {
    runs.push(new TextRun({ text: "\t", font: FONT, size: hpt(10.5) }));
    runs.push(new TextRun({ text: dates, font: FONT, size: hpt(10.5), color: "000000" }));
  }

  const paras: Paragraph[] = [
    new Paragraph({
      spacing: { before: twip(4), after: twip(1) },
      tabStops: dates
        ? [{ type: TabStopType.RIGHT, position: convertInchesToTwip(6.5) }]
        : [],
      children: runs,
    }),
  ];

  if (subtitle) {
    paras.push(
      new Paragraph({
        spacing: { before: 0, after: twip(1) },
        children: [
          new TextRun({ text: subtitle, font: FONT, size: hpt(10), italics: true, color: "000000" }),
        ],
      })
    );
  }

  return paras;
}

function bulletPara(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 0, after: twip(1) },
    indent: { left: convertInchesToTwip(0.2) },
    children: [
      new TextRun({ text: `\u2022  ${text}`, font: FONT, size: hpt(10.5), color: "000000" }),
    ],
  });
}

function buildContact(contact: CVContact): Paragraph[] {
  const paras: Paragraph[] = [];

  if (contact.name) {
    paras.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: twip(2) },
        children: [
          new TextRun({ text: contact.name, font: FONT, size: hpt(18), bold: true, color: "000000" }),
        ],
      })
    );
  }

  const parts = [
    contact.phone,
    contact.email,
    contact.linkedin,
    contact.portfolio,
    contact.location,
  ].filter(Boolean) as string[];

  if (parts.length > 0) {
    paras.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: twip(6) },
        children: [
          new TextRun({ text: parts.join("  |  "), font: FONT, size: hpt(10), color: "000000" }),
        ],
      })
    );
  }

  return paras;
}

function buildCV(data: CVData): Paragraph[] {
  const paras: Paragraph[] = [];

  if (data.contact) paras.push(...buildContact(data.contact));

  if (data.summary) {
    paras.push(sectionHeading("Resumen Profesional"));
    paras.push(
      new Paragraph({
        spacing: { before: 0, after: twip(2) },
        children: [new TextRun({ text: data.summary, font: FONT, size: hpt(10.5), color: "000000" })],
      })
    );
  }

  if (data.education?.length) {
    paras.push(sectionHeading("Educación"));
    for (const edu of data.education) {
      paras.push(...entryHeader(edu.institution || "", edu.degree, edu.dates, edu.subtitle));
      for (const d of edu.details || []) paras.push(bulletPara(d));
    }
  }

  if (data.projects?.length) {
    paras.push(sectionHeading("Proyectos Académicos"));
    for (const proj of data.projects) {
      paras.push(...entryHeader(proj.title || "", proj.role, proj.dates, proj.subtitle));
      for (const b of proj.bullets || []) paras.push(bulletPara(b));
    }
  }

  if (data.experience?.length) {
    paras.push(sectionHeading("Experiencia"));
    for (const exp of data.experience) {
      paras.push(...entryHeader(exp.company || "", exp.role, exp.dates, exp.location));
      for (const b of exp.bullets || []) paras.push(bulletPara(b));
    }
  }

  if (data.skills && Object.keys(data.skills).length > 0) {
    paras.push(sectionHeading("Habilidades"));
    for (const [category, items] of Object.entries(data.skills)) {
      const value = Array.isArray(items) ? items.join(", ") : items;
      paras.push(
        new Paragraph({
          spacing: { before: twip(1), after: twip(1) },
          children: [
            new TextRun({ text: `${category}: `, font: FONT, size: hpt(10.5), bold: true, color: "000000" }),
            new TextRun({ text: value, font: FONT, size: hpt(10.5), color: "000000" }),
          ],
        })
      );
    }
  }

  if (data.extracurricular?.length) {
    paras.push(sectionHeading("Actividades Extracurriculares"));
    for (const item of data.extracurricular) {
      paras.push(...entryHeader(item.organization || "", item.role, item.dates));
      for (const b of item.bullets || []) paras.push(bulletPara(b));
    }
  }

  if (data.certifications?.length) {
    paras.push(sectionHeading("Certificaciones"));
    for (const cert of data.certifications) {
      const suffix = [cert.issuer, cert.date].filter(Boolean).join("  |  ");
      paras.push(
        new Paragraph({
          spacing: { before: twip(1), after: twip(1) },
          children: [
            new TextRun({ text: cert.name || "", font: FONT, size: hpt(10.5), bold: true, color: "000000" }),
            ...(suffix
              ? [new TextRun({ text: `  —  ${suffix}`, font: FONT, size: hpt(10.5), color: "000000" })]
              : []),
          ],
        })
      );
    }
  }

  return paras;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cvJson = (body.cvJson || body.cvData || {}) as CVData;
    const filename = (body.filename as string) || "CV_output.docx";

    if (!cvJson || typeof cvJson !== "object") {
      return new Response(JSON.stringify({ error: "Faltan datos de CV para generar el documento" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: FONT, size: hpt(10.5), color: "000000" },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
            },
          },
          children: buildCV(cvJson),
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const uint8 = new Uint8Array(buffer);

    return new Response(uint8, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating docx:", error);
    return new Response(
      JSON.stringify({ error: "Error al generar el documento Word .docx" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
