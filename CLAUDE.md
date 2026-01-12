# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A stopwatch web application with lap timing and averaging features, built with React and configured for mobile deployment via Capacitor. The app tracks lap times, calculates averages, and can export data to CSV.

## Commands

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build at http://localhost:5173
npm run lint         # Run ESLint
```

### Mobile Development (Capacitor)
```bash
npx cap sync         # Sync web build to native platforms (copy + update)
npx cap copy         # Copy web build to native platforms only
npx cap update       # Update native plugins/dependencies
npx cap open ios     # Open iOS project in Xcode
npx cap open android # Open Android project in Android Studio
npx cap run ios      # Build and run on iOS
npx cap run android  # Build and run on Android
```

**Important**: Always run `npm run build` before syncing to mobile platforms. Capacitor serves from the `dist` directory.

## Architecture

### Tech Stack
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4 (via @tailwindcss/vite)
- **Icons**: lucide-react
- **Charts**: Recharts
- **Mobile**: Capacitor 7 (iOS and Android platforms configured)
- **Language**: JavaScript (no TypeScript)

### Project Structure
- `src/App.jsx` - Single-component architecture. All stopwatch logic, state management, and UI are in this one file.
- `src/main.jsx` - Entry point that mounts the React app
- `src/App.css` - Component styles
- `src/index.css` - Global styles
- `capacitor.config.json` - Capacitor configuration (appId: com.joelbreit.stopwatch)
- `dist/` - Build output directory (gitignored, used by Capacitor)
- `android/` - Native Android project
- `ios/` - Native iOS project

### Key Features Implemented in App.jsx
- **Timer logic**: Uses `setInterval` with 10ms precision, tracking elapsed time via `Date.now()`
- **Lap tracking**: Records individual lap durations and cumulative times
- **Statistics**: Calculates average lap time for completed laps and overall average including active lap
- **Current lap time**: Displays time for active lap separately from total time
- **Min/Max highlighting**: Fastest lap shown in green, slowest in red (requires 2+ laps)
- **CSV export**: Downloads lap data with statistics
- **Complete lap button**: Stops timer and records final lap in one action

### State Management
All state is managed with React hooks in App.jsx:
- `time` - Total elapsed time in milliseconds
- `isActive` - Timer running state
- `laps` - Array of lap objects with `{lap, duration, totalTime}`
- Uses `useMemo` for performance-critical calculations (averages, min/max)

## Notes

- Currently on the `capacitor` branch (main branch is `main`)
- Hosted on AWS with Amplify at stopwatch.joelbreit.com
- No test suite configured
- ESLint configured with React hooks rules and react-refresh plugin
- Single-component architecture keeps all logic in App.jsx - consider splitting into components if adding significant new features
