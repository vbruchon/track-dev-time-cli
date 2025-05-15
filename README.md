# track-dev-time

**track-dev-time** is a CLI tool designed to automatically track your development sessions. When installed in a project, it modifies the startup scripts and tracks time seamlessly, without requiring any additional input from the user.

## Features

- **Automatic Tracking**: As soon as you run the development script (`npm run dev` or equivalent), **track-dev-time** automatically starts tracking the session.
- **Session Management**: It automatically starts, pauses, and stops tracking time when the development server is started or stopped.
- **Data Recording**: The session data is automatically saved in a JSON file, including details about the duration of each development session.

## Installation

You can install **track-dev-time** using any of the following package managers:

#### Using npm:

```bash
  npm install track-dev-time --save-dev
```

#### Using pnpm:

```bash
  pnpm add track-dev-time --save-dev
```

#### Using yarn:

```bash
  yarn add track-dev-time --dev
```

## Setup

Once installed, run the setup command to automatically configure your project:

#### Using npm:

```bash
  npx track-dev-time setup
```

#### Using pnpm:

```bash
  pnpm dlx track-dev-time setup
```

#### Using yarn:

```bash
  yarn track-dev-time setup
```

This command will:

- Add and configure the track-dev-time start script in your package.json.
- Modify .gitignore to exclude the generated tracking files.

## How It Works

Once the package is installed and configured with the setup command, every time you run your project’s development script, the time tracking will be automatically triggered. The track-dev-time start command will be executed alongside your development server.

### Example dev script in package.json

After running the setup command, your dev script in package.json will look like this:

```json
// Before
"scripts": {
  "dev": "next dev"
}

// After setup
"scripts": {
  "dev": "next dev && track-dev-time start"
}

```

## Data File

Development time will automatically be recorded in a JSON file located in your project directory. This file contains information about the duration of each development session.

### Data File Format

The session data is automatically recorded in a JSON file located in your project directory. This file contains information about the duration of each development session.

Example of the data stored:

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
- **duration**: The total duration of the session, in secondes.

#### Pauses:

Each session can include multiple pauses:

- **id**: A unique identifier for each pause.
- **start**: The timestamp when the pause started.
- **end**: The timestamp when the pause ended.

This format allows easy tracking of both the development time and any pauses taken during the session. The pauses are tracked separately within the session, making it clear when work was interrupted and when it resumed.

## Automatic Functionality

Once the setup is complete, you won’t need to manually run the `track-dev-time start` command. The tool integrates seamlessly into your existing development workflow.

Each time you execute the development script (`next dev` or equivalent), **track-dev-time** automatically starts and tracks the session without requiring any additional input from the user. When the development server stops, the session is automatically ended and saved.

You can continue to focus on your development work while **track-dev-time** handles all the time tracking in the background.
