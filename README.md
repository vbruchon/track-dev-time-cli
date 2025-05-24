# track-dev-time

[![npm version](https://img.shields.io/npm/v/track-dev-time.svg)](https://www.npmjs.com/package/track-dev-time)

**track-dev-time** is a CLI tool designed to automatically track your development sessions. When installed in a project, it modifies the startup scripts and tracks time seamlessly, without requiring any additional input from the user.

## Features

- **Automatic Tracking**: As soon as you run the development script (`npm run dev` or equivalent), **track-dev-time** automatically starts tracking the session.
- **Session Management**: It automatically starts, pauses, and stops tracking time when the development server is started or stopped.
- **Data Recording**: The session data is automatically saved in a JSON file, including details about the duration of each development session.

## Installation

You can install **track-dev-time** using any of the following package managers:

```bash
  #npm
  npm install track-dev-time --save-dev

  # pnpm
  pnpm add -D track-dev-time

  # yarn
  yarn add track-dev-time --dev
```

⚠️ concurrently is required by track-dev-time to run both the server and the tracker in parallel. Please install it as a development dependency:

```bash
  # pnpm
  pnpm add -D concurrently

  # npm
  npm install --save-dev concurrently

  # yarn
  yarn add --dev concurrently
```

## Setup

Once installed, run the setup command to automatically configure your project:

```bash
  # npm
  npx track-dev-time setup

  # pnpm
  pnpm dlx track-dev-time setup

  # yarn
  yarn track-dev-time setup
```

This will:

- Update your package.json to run the tracker and dev server concurrently.
- Add .track-dev-time/ to your .gitignore to exclude session files from version control.

## How It Works

Once the package is installed and configured using the setup command, track-dev-time automatically hooks into your development workflow. Every time you run your project’s development script, time tracking is launched in parallel with your server.

#### Example dev script in package.json

After running the setup command, your dev script will be updated to run both the development server and the tracker using concurrently:

```json
// Before
"scripts": {
  "dev": "next dev"
}

// After setup
"scripts": {
  "dev": "concurrently -n server,track -c ,green \"next dev\" \"track-dev-time start\""
}
```

- **server**: This is your usual development server process (e.g., next dev). It runs your app as normal.
- **track**: This is the track-dev-time process that automatically tracks your coding sessions in the background.

The **-n server,track** option names the two processes in the console output, so you can easily distinguish their logs.

The **-c ,green** option sets the color of the track process logs to green, making it easy to identify time-tracking related messages among other console output.

This setup ensures that both your development server and the tracking tool run simultaneously without interfering with your usual workflow.

## Data File

Your development time is automatically recorded in a JSON file located in your project directory. This file contains detailed information about each development session, including any pauses.

### Data File Format

The session data is stored as an array of session objects. Each session records the start and end times, total duration, and any pauses during the session.

#### Example of the data stored:

```json
[
  {
    "id": "session-1",
    "start": "2025-05-12T10:00:00Z",
    "pauses": [
      {
        "id": "pause-1",
        "start": "2025-05-12T10:15:00Z",
        "end": "2025-05-12T10:20:00Z"
      }
    ],
    "end": "2025-05-12T10:45:00Z",
    "duration": 45.0
  },
  {
    "id": "session-2",
    "start": "2025-05-12T14:00:00Z",
    "pauses": [
      {
        "id": "pause-2",
        "start": "2025-05-12T14:10:00Z",
        "end": "2025-05-12T14:15:00Z"
      }
    ],
    "end": "2025-05-12T14:45:00Z",
    "duration": 45.0
  }
]
```

#### Each session includes:

- **id**: A unique identifier for each session.
- **start**: The timestamp when the session started.
- **end**: The timestamp when the session ended.
- **duration**: The total duration of the session, in seconds.

#### Pauses:

Each session can include multiple pauses:

- **id**: A unique identifier for each pause.
- **start**: The timestamp when the pause started.
- **end**: The timestamp when the pause ended.

This structure helps clearly differentiate active development time from pauses, allowing for precise tracking of work and breaks during each session.

## Automatic Functionality

Once setup is complete, you won’t need to manually run the track-dev-time start command. The tool integrates seamlessly into your existing development workflow.

Every time you run your development script (like **next dev** or an equivalent command), track-dev-time will automatically start tracking your session—no extra input needed. When the development server stops, the session ends and the data is saved automatically.

You can focus entirely on coding while **track-dev-time** quietly handles the time tracking in the background.

### How Sessions End Automatically

**track-dev-time** detects the end of a session when your development server stops. This typically happens when:

- When the process receives a termination signal (`SIGINT`, `SIGTERM`, etc.)
- When the Node.js process naturally exits (`process.on('exit')`)
- When the terminal is closed or the dev command is interrupted (`Ctrl+C`)

The CLI uses these system signals to automatically stop the session and write the final session data to the JSON file. This way, you don’t need to manually run `track-dev-time stop`.

> 💡 If the server is restarted within 5 minutes, the same session can be resumed automatically instead of starting a new one.
