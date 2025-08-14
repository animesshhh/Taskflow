# TaskFlow - Modern To-Do List Application

A feature-rich to-do list application built with React, TypeScript, and Express.js. Features a clean, intuitive interface with advanced task management capabilities.

## Features

- **Clean Interface**: Minimalist design with smooth animations
- **Quick Task Creation**: Add tasks instantly with Enter key support
- **Smart Organization**: Categories, priorities, and due dates
- **Advanced Filtering**: Filter by status, priority, overdue tasks
- **Drag & Drop**: Reorder tasks with intuitive drag and drop
- **Search**: Find tasks quickly with real-time search
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark Mode Ready**: Built-in dark theme support

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: In-memory storage (easily replaceable with PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Build Tools**: Vite for frontend, esbuild for backend

## Quick Start

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server (both frontend and backend)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── pages/        # Page components
├── server/               # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage layer
├── shared/               # Shared types and schemas
└── components.json       # shadcn/ui configuration
```

## Deployment

### Deploy to Replit

1. Fork this repository on GitHub
2. Import the repository into Replit
3. The app will automatically start with the configured workflow

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Node.js project
3. Set environment variable: `NODE_ENV=production`
4. Deploy

## Environment Variables

For production deployment, you may want to configure:

- `NODE_ENV` - Set to `production` for production builds
- `PORT` - Server port (defaults to 5000)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions, please open an issue on GitHub.