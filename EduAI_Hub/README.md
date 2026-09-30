# EduAI Hub — Corrected

### Fixed
- Express 5 wildcard route error.
- Gemini 503/429 retry with exponential backoff.
- Automatic Gemini model fallback.
- All tools open in a new browser tab/page.
- Tool pages have a Back to EduAI Hub button.
- API key remains server-side in `.env`.

### Run
1. Extract the ZIP.
2. Open the folder containing `package.json` in VS Code.
3. `npm install`
4. Copy `.env.example` to `.env`
5. Add your NEW Gemini API key.
6. `npm start`
7. Open `http://localhost:3000`

Do not put the API key in frontend files. Since the previous key was shared in chat, rotate it and use a new key.
