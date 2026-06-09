# AmarQuiz

AmarQuiz is a polished, enterprise-inspired quiz generation platform built for modern teams, educators, and product designers. It delivers instant quiz creation, adaptive question sets, and real-time answer evaluation through direct integration with Gemini, OpenAI, and Claude AI models.

Watch the demo video: [https://youtu.be/SGZkGHqyyOk](https://youtu.be/SGZkGHqyyOk)

Live URL: [amarquiz.netlify.app](https://amarquiz.netlify.app)

---

## Overview

AmarQuiz is engineered to feel like a production-grade SaaS experience. It combines intuitive UI, fast API orchestration, and strong privacy controls to help users generate quizzes with confidence and speed.

- Trusted AI providers: Gemini, OpenAI, Anthropic Claude
- Flexible quiz formats: multiple choice, true/false, and mixed-style assessments
- Optimized for low latency, rich interaction, and clean presentation

---

## What Makes AmarQuiz Stand Out

- **Unified AI Provider Support**: One interface across Gemini, OpenAI, and Claude for consistent quiz authoring and scoring.
- **Smart Quiz Customization**: Configure total questions, difficulty levels, subject focus, and response layout in seconds.
- **Secure Client-First Architecture**: All API keys stay in browser memory, avoiding server-side credential storage.
- **Modern UI/UX**: Responsive glassmorphism design, polished typography, and interactive feedback components provide a premium product feel.
- **Mobile-First Presentation**: A dedicated mobile layout for quiz flow with optimized question card scaling for very small screens.
- **Production-Ready Documentation**: Clear setup guidance, well-organized architecture, and polished release notes for contributors.

---

## Product Highlights

- Rapid quiz creation from any user prompt or topic
- Compact, maintainable static front-end with zero backend dependency
- Real-time quiz scoring and answer validation in-browser
- Clean, developer-friendly codebase for fast iteration

---

## Getting Started

### Prerequisites
- Modern web browser: Chrome, Firefox, Safari, Edge
- Active API key from one of the supported providers:
  - Google AI Studio (Gemini)
  - OpenAI Developer Platform
  - Anthropic Console (Claude)

### Local Setup
AmarQuiz is a static application and requires no build system.

1. Clone the repository:
   ```bash
   git clone https://github.com/thewiztanvir/AmarQuiz.git
   cd AmarQuiz
   ```

2. Serve the files locally:
   ```bash
   python -m http.server 8000
   ```
   or
   ```bash
   npx serve .
   ```

3. Open your browser and visit:
   ```text
   http://localhost:8000
   ```

---

## Architecture

- `index.html` — clean semantic markup for the quiz interface and configuration controls
- `style.css` — refined styling, responsive layouts, and polished animation states
- `app.js` — application engine managing user input, API payloads, provider selection, and scoring workflows

### Privacy and Data Flow
AmarQuiz is built as a client-side API client. User credentials and request payloads are handled directly in the browser, with zero backend logging:
- Gemini: `generativelanguage.googleapis.com`
- OpenAI: `api.openai.com`
- Claude: `api.anthropic.com`

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
