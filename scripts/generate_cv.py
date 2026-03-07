#!/usr/bin/env python3
"""
CV Generator — produces an ATS-optimized .docx from structured CV data.
Usage: python3 generate_cv.py cv_data.json [--output my_cv.docx]

The JSON input follows the schema defined in the cv-optimizer skill.
All formatting decisions enforce ATS best practices:
  - Single-column layout
  - Standard fonts (Calibri)
  - No tables, no graphics, no headers/footers for contact info
  - Consistent heading hierarchy
"""

import json
import sys
import argparse
from pathlib import Path
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


# ── Styling constants ────────────────────────────────────────────────────────
FONT_NAME       = "Calibri"
NAME_SIZE       = Pt(18)
CONTACT_SIZE    = Pt(10)
SECTION_SIZE    = Pt(11.5)
BODY_SIZE       = Pt(10.5)
MARGIN          = Inches(0.75)
LINE_SPACING    = Pt(12)
COLOR_BLACK     = RGBColor(0, 0, 0)
COLOR_DARK_GRAY = RGBColor(50, 50, 50)


def set_font(run, size, bold=False, color=None):
    run.font.name = FONT_NAME
    run.font.size = size
    run.font.bold = bold
    run.font.color.rgb = color or COLOR_BLACK


def set_para_spacing(para, before=0, after=2, line=None):
    pf = para.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after  = Pt(after)
    if line:
        pf.line_spacing = line


def add_horizontal_rule(doc):
    """Adds a thin bottom-border line after a section heading."""
    para = doc.add_paragraph()
    set_para_spacing(para, before=0, after=2)
    pPr = para._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "4")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), "AAAAAA")
    pBdr.append(bottom)
    pPr.append(pBdr)
    return para


def add_section_heading(doc, title):
    para = doc.add_paragraph()
    set_para_spacing(para, before=6, after=1)
    run = para.add_run(title.upper())
    set_font(run, SECTION_SIZE, bold=True)
    add_horizontal_rule(doc)


def add_entry_header(doc, title, role, date_range, subtitle=None):
    """Adds a two-column-style entry header using tabs (ATS-safe)."""
    para = doc.add_paragraph()
    set_para_spacing(para, before=4, after=1)
    # Title + role on the left
    r1 = para.add_run(title)
    set_font(r1, BODY_SIZE, bold=True)
    if role:
        r1b = para.add_run(f"  |  {role}")
        set_font(r1b, BODY_SIZE, bold=False)
    # Date on the right (tab-aligned)
    if date_range:
        para.add_run("\t")
        r2 = para.add_run(date_range)
        set_font(r2, BODY_SIZE, bold=False)
        para.paragraph_format.tab_stops.add_tab_stop(Inches(6.5), WD_ALIGN_PARAGRAPH.RIGHT)
    if subtitle:
        sub = doc.add_paragraph(subtitle)
        set_para_spacing(sub, before=0, after=1)
        sub_run = sub.runs[0]
        set_font(sub_run, BODY_SIZE - Pt(0.5), bold=False)
        sub_run.italic = True


def add_bullet(doc, text):
    para = doc.add_paragraph(style="List Bullet")
    set_para_spacing(para, before=0, after=1)
    para.paragraph_format.left_indent = Inches(0.2)
    run = para.add_run(text)
    set_font(run, BODY_SIZE)


def add_body_text(doc, text, italic=False):
    para = doc.add_paragraph(text)
    set_para_spacing(para, before=0, after=2)
    for run in para.runs:
        set_font(run, BODY_SIZE)
        run.italic = italic


# ── Section builders ─────────────────────────────────────────────────────────

def build_contact(doc, data):
    # Name — largest element
    name_para = doc.add_paragraph()
    name_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_para_spacing(name_para, before=0, after=2)
    name_run = name_para.add_run(data.get("name", ""))
    set_font(name_run, NAME_SIZE, bold=True)

    # Contact line(s)
    parts = []
    if data.get("phone"):      parts.append(data["phone"])
    if data.get("email"):      parts.append(data["email"])
    if data.get("linkedin"):   parts.append(data["linkedin"])
    if data.get("portfolio"):  parts.append(data["portfolio"])
    if data.get("location"):   parts.append(data["location"])

    contact_para = doc.add_paragraph("  |  ".join(parts))
    contact_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_para_spacing(contact_para, before=0, after=6)
    for run in contact_para.runs:
        set_font(run, CONTACT_SIZE)


def build_summary(doc, summary_text):
    add_section_heading(doc, "Resumen Profesional")
    add_body_text(doc, summary_text)


def build_education(doc, entries):
    add_section_heading(doc, "Educación")
    for edu in entries:
        add_entry_header(
            doc,
            edu.get("institution", ""),
            edu.get("degree", ""),
            edu.get("dates", ""),
            subtitle=edu.get("subtitle")
        )
        for detail in edu.get("details", []):
            add_bullet(doc, detail)


def build_projects(doc, entries):
    add_section_heading(doc, "Proyectos Académicos")
    for proj in entries:
        add_entry_header(
            doc,
            proj.get("title", ""),
            proj.get("role", ""),
            proj.get("dates", ""),
            subtitle=proj.get("subtitle")
        )
        for bullet in proj.get("bullets", []):
            add_bullet(doc, bullet)


def build_experience(doc, entries):
    if not entries:
        return
    add_section_heading(doc, "Experiencia")
    for exp in entries:
        add_entry_header(
            doc,
            exp.get("company", ""),
            exp.get("role", ""),
            exp.get("dates", ""),
            subtitle=exp.get("location")
        )
        for bullet in exp.get("bullets", []):
            add_bullet(doc, bullet)


def build_skills(doc, skills_dict):
    add_section_heading(doc, "Habilidades")
    for category, items in skills_dict.items():
        para = doc.add_paragraph()
        set_para_spacing(para, before=1, after=1)
        label = para.add_run(f"{category}: ")
        set_font(label, BODY_SIZE, bold=True)
        value = para.add_run(items if isinstance(items, str) else ", ".join(items))
        set_font(value, BODY_SIZE)


def build_extracurricular(doc, entries):
    if not entries:
        return
    add_section_heading(doc, "Actividades Extracurriculares")
    for item in entries:
        add_entry_header(
            doc,
            item.get("organization", ""),
            item.get("role", ""),
            item.get("dates", "")
        )
        for bullet in item.get("bullets", []):
            add_bullet(doc, bullet)


def build_certifications(doc, certs):
    if not certs:
        return
    add_section_heading(doc, "Certificaciones")
    for cert in certs:
        para = doc.add_paragraph()
        set_para_spacing(para, before=1, after=1)
        r1 = para.add_run(cert.get("name", ""))
        set_font(r1, BODY_SIZE, bold=True)
        if cert.get("issuer") or cert.get("date"):
            suffix = []
            if cert.get("issuer"): suffix.append(cert["issuer"])
            if cert.get("date"):   suffix.append(cert["date"])
            r2 = para.add_run("  —  " + "  |  ".join(suffix))
            set_font(r2, BODY_SIZE)


# ── Main builder ─────────────────────────────────────────────────────────────

def generate_cv(data: dict, output_path: str):
    doc = Document()

    # Page margins — ATS safe: 0.75 inch all sides
    for section in doc.sections:
        section.top_margin    = MARGIN
        section.bottom_margin = MARGIN
        section.left_margin   = MARGIN
        section.right_margin  = MARGIN

    # Default paragraph style
    style = doc.styles["Normal"]
    style.font.name = FONT_NAME
    style.font.size = BODY_SIZE

    # Remove default spacing from List Bullet style
    try:
        lb = doc.styles["List Bullet"]
        lb.font.name = FONT_NAME
        lb.font.size = BODY_SIZE
    except Exception:
        pass

    # ── Build sections in ATS-optimal order for students ────────────────────
    contact = data.get("contact", {})
    if contact:
        build_contact(doc, contact)

    summary = data.get("summary", "")
    if summary:
        build_summary(doc, summary)

    education = data.get("education", [])
    if education:
        build_education(doc, education)

    projects = data.get("projects", [])
    if projects:
        build_projects(doc, projects)

    experience = data.get("experience", [])
    if experience:
        build_experience(doc, experience)

    skills = data.get("skills", {})
    if skills:
        build_skills(doc, skills)

    extracurricular = data.get("extracurricular", [])
    if extracurricular:
        build_extracurricular(doc, extracurricular)

    certifications = data.get("certifications", [])
    if certifications:
        build_certifications(doc, certifications)

    doc.save(output_path)
    print(f"CV guardado en: {output_path}")


# ── CLI entry point ──────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Generate ATS-optimized CV .docx")
    parser.add_argument("json_file", help="Path to JSON file with CV data")
    parser.add_argument("--output", "-o", default="cv_output.docx", help="Output .docx file path")
    args = parser.parse_args()

    with open(args.json_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    generate_cv(data, args.output)


if __name__ == "__main__":
    main()
