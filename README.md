# AmarQuiz

AmarQuiz is an open-source, client-side web application designed to generate dynamic quizzes on any topic instantly. Built with a focus on speed, style, and data privacy, it integrates directly with Gemini, OpenAI, and Claude API providers to deliver real-time quiz generation and interactive evaluations.

Live URL: [amarquiz.netlify.app](https://amarquiz.netlify.app)

---

## Key Features

- **Multi-Provider Architecture**: Fully compatible with Google Gemini, OpenAI, and Anthropic Claude APIs.
- **Dynamic Model Selection**: Curated presets for optimized latency and cost (e.g., Gemini 2.5 Flash, GPT-4o Mini, Claude 3.5 Haiku) with support for custom model IDs.
- **Configurable Generator Options**: Custom control over question counts, difficulty settings, and format types (Multiple Choice, True/False, or Mixed layouts).
- **Client-Side Security**: All API credentials and session keys are kept strictly in-memory. Requests are sent directly to AI providers from the client browser without intermediate server logging or retention.
- **Premium User Experience**: Responsive interface styled with modern typography, smooth micro-animations, glassmorphism design layouts, and detailed interactive review panels.

---

## Getting Started

### Prerequisites
A modern, standard web browser (Chrome, Firefox, Safari, Edge) is required. You will also need an active API key from at least one of the supported model providers:
- Google AI Studio (Gemini)
- OpenAI Developer Platform
- Anthropic Console (Claude)

### Running Locally
AmarQuiz runs as a static web client and requires no backend compilation.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thewiztanvir/AmarQuiz.git
   cd AmarQuiz
   ```

2. **Serve the project**:
   You can open `index.html` directly in your browser or run a simple local web server to preserve session context:
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (npx)
   npx serve .
   ```

3. **Navigate to the application**:
   Open `http://localhost:8000` (or the URL provided by your local server).

---

## Technical Details

### File Structure
- `index.html` - Semantic structure containing application views and form fields.
- `style.css` - Custom styling rules, component states, layouts, responsive layouts, and UI transitions.
- `app.js` - Application runtime engine. Handles client-side API requests, payload construction, JSON schema parsing, scoring logic, and UI states.

### Data Flow and Privacy
AmarQuiz acts strictly as an API client interface. Under no circumstances are your API keys or prompts sent to third-party endpoints. Communication occurs directly between the browser and the official endpoints:
- Gemini: `generativelanguage.googleapis.com`
- OpenAI: `api.openai.com`
- Claude: `api.anthropic.com`

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
