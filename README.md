# Thabang Dikotope — Engineering, AI & Research Portfolio

[![Site Status](https://img.shields.io/badge/status-production--ready-emerald)](https://thabangs-portfolio.netlify.app)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)
[![Verification Suite](https://img.shields.io/badge/tests-452%20passed-brightgreen)](#testing--verification)

Welcome to the official engineering, AI, and research portfolio of **Thabang Dikotope**, Graduate Software Engineer based in Johannesburg, South Africa.

> *"I build software that solves real problems, engineer systems that people can use, and explore how AI and emerging technologies can create meaningful impact."*

🔗 **Live Portfolio:** [thabangs-portfolio.netlify.app](https://thabangs-portfolio.netlify.app)

---

## 🏛️ LOAM Design System & Visual Identity

The portfolio implements the **LOAM** design language: *a universal, earth-grounded, humanist system. Soil, clay, moss, stone, water. Built so people feel accompanied, not managed.*

Rooted in the humanist AI stance (presence without pretending: a pebble, not a person), LOAM treats computing with physical care:

- **Color Materials (Each has one specific job):**
  - **Neutral Ramp (Loam):** Default Dark *"Night Soil"* (`#1A1611` base, `#231E17` raised, `#F0E9DB` primary ink) with Light mode *"Daylight on Sand"* (`#F4EFE6` base, `#2A2118` ink).
  - **Clay (`#B5532F`):** Human action, primary CTAs, user messages, and brand agency.
  - **Moss (`#5B7A3A`):** Growth, success, confirmation, and "safe to proceed."
  - **Tide (`#2F6F7E`):** System voice, AI activity, links, focus halos, and provenance citations.
  - **Ochre (`#C8932B`):** Caution, highlights, and dotted underlines for inferred claims.
  - **Madder (`#A8362F`):** Destructive actions and errors (used rarely).
  - **Horizon Gradient:** `linear-gradient(160deg, #D98E64 0%, #E8C48A 50%, #9CC3C9 100%)` (for presence and onboarding only, never on text or data).
- **Screen Color Ratio:** Strictly 88% loam, 7% tide, 4% clay, 1% other.
- **Humanist Typography:** Display headlines set in **Fraunces** (variable serif with soft axis up, tracking -0.015em) for physical editorial warmth; body and UI set in **Source Sans 3** (16/26 ratio, max 66ch reading measure); technical code and data contracts in **JetBrains Mono**.
- **Human Scale & Touch Targets:** All interactive buttons and inputs enforce touch targets $\ge 48$px with continuous-curvature squircle radii (`xs 6px, sm 10px, md 16px, lg 24px, pill 999px`) and warm-tinted elevation shadows.

---

## 🤖 The Seed & AI Portfolio Assistant Architecture

The portfolio assistant (`js/assistant.js` + `api/chat.js`) is an epistemic, evidence-grounded system accompanied by **The Seed** presence engine:

- **The Seed (A Pebble, Not a Person):** A smooth, faceless pebble form (no faked consciousness, no anthropomorphic expressions) with a 6-state continuous state machine:
  1. `idle`: 5-second slow breathing curve.
  2. `listening`: edge ripples outward as the visitor types or focuses the input.
  3. `thinking`: single Tide ring drifts organically around the perimeter (no mechanical spinning).
  4. `responding`: soft pulse on the leading edge of generated text.
  5. `uncertain`: slightly dimmed form, motionless, stays still.
  6. `error`: desaturated, settles to ground color without flashing.
- **Unboxed Responses (LOAM §7):** System responses sit **unboxed** directly on the dialog ground in body typography, accompanied by a quiet Seed attribution mark rather than enclosed in artificial widget cards.
- **Provenance & Citations:** Every claim is tied to verified case study records with numbered Tide chips (`[1]`, `[2]`).
- **Epistemic Honesty Copy Pattern (LOAM §8):** Adheres strictly to factual language (*"According to verified portfolio records [1]..."*, *"I don't know. That isn't in Thabang's public records."*, *"I can't do that here."*) with zero performative apologies or fake emotions.
- **Hybrid Integration Model:** Operates server-side with rate limiting (10 req/min), timeouts (8s AbortSignal), and anti-injection delimiters, backed by a deterministic local Curated Knowledge Index when deployed statically.
2. **Curated Grounded Index Mode (Automatic Fallback):** When hosted statically (e.g. GitHub Pages) or without API keys, the assistant switches to the Curated Knowledge Retrieval Engine backed by `assets/data/portfolio-knowledge.json`. Queries produce factual, cited answers with direct links to project case studies without hallucination.

📖 **Detailed Specification & Guardrails:** See [`docs/AI_ASSISTANT.md`](docs/AI_ASSISTANT.md) for full architecture, threat model, and evaluation benchmarks.

---

## 🛠️ Local Development & Testing

### Prerequisites
- Node.js (v18+)

### Commands

```bash
# Run full verification suite (453 site tests + 46 assistant evaluation tests)
npm test

# Run dedicated AI Assistant evaluation suite
npm run test:assistant

# Start the local preview server
npm start
# Server running at http://localhost:3000
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` or configure variables in your hosting dashboard:

```ini
# Optional Server-Side LLM Keys (For Live Assistant Generation)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# EmailJS Client Keys (For Direct Contact Form Routing)
EMAILJS_PUBLIC_KEY=1p9HBSo5fJ6fUKWfx
EMAILJS_SERVICE_ID=service_myxkzgt
EMAILJS_TEMPLATE_ID=template_oypxfhg
```

---

## 📬 Approved Contact Details

- **Name:** Thabang Dikotope
- **Role:** Graduate Software Engineer | Full-Stack Developer | AI & Software Systems Developer
- **Email:** [thabangdikotope624@gmail.com](mailto:thabangdikotope624@gmail.com)
- **Phone:** [+27 79 594 8790](tel:+27795948790)
- **Location:** Johannesburg, Gauteng, South Africa
- **LinkedIn:** [linkedin.com/in/drey780822](https://www.linkedin.com/in/drey780822)
- **GitHub:** [github.com/Drey780822](https://github.com/Drey780822)
- **WhatsApp:** [wa.me/27795948790](https://wa.me/27795948790)

---

## 📄 License
MIT License. © 2026 Thabang Dikotope.
