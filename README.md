# HabitFlow

A lightweight habit tracker built with Vite and vanilla JavaScript.

## Features

- Daily habit tracking
- Weekly and custom recurrence options
- Category organization and management
- Streak tracking and progress stats
- History view and timeline
- Local browser storage persistence
- Theme support and notification preferences

## Tech Stack

- Vite
- Vanilla JavaScript
- HTML
- CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

This starts the Vite dev server and opens the app in your browser.

### Build for production

```bash
npm run build
```

The production build output is generated in the `dist/` folder.

## Project Structure

```text
habit_tracker/
├── index.html
├── package.json
├── vite.config.js
├── verify_logic.js
├── src/
│   ├── components/
│   ├── models/
│   ├── state/
│   ├── styles/
│   ├── utils/
│   └── main.js
├── .gitignore
├── README.md
└── dist/
```

## Notes

- Data is stored locally in the browser using `localStorage`.
- This project is designed for web/mobile-friendly usage and can later be wrapped as a mobile app using Capacitor or a PWA approach.

## License

This project is licensed under the MIT License.
