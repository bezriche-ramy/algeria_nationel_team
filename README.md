# Algeria National Football Team Website

A modern, interactive website showcasing the Algeria National Football Team with 3D trophy visualizations, team history, squad information, and latest news.

## Features

- 🏆 Interactive 3D trophy models using Three.js
- 📰 Latest news and updates section
- 👥 Complete squad roster with player information
- 📜 Historical timeline with AFCON victories
- 📱 Responsive design for all devices
- ⚡ Fast performance with Vite

## Tech Stack

- **Frontend**: React 19, Vite
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Styling**: CSS3 with modern design patterns
- **Deployment**: Vercel-ready configuration

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd national-team
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment on Vercel

This project is optimized for Vercel deployment with:

- Pre-configured `vercel.json` for optimal settings
- Automatic builds and deployments
- Static file caching headers
- SPA routing configuration

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the framework and deploy

Or use the Vercel CLI:

```bash
npx vercel
```

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx      # Navigation header
│   ├── Hero.jsx        # Hero section
│   ├── History.jsx     # Historical timeline
│   ├── LatestNews.jsx  # News section
│   ├── Squad.jsx       # Team roster
│   └── Trophy3D.jsx    # 3D trophy component
├── assets/             # Static assets
├── App.jsx            # Main App component
├── App.css            # Global styles
├── main.jsx           # Application entry point
└── index.css          # Base styles
```

## 3D Assets

The project includes a 3D trophy model (`african_cup_of_nations.glb`) that displays during significant historical events (1990 and 2019 AFCON victories).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email your-email@example.com or create an issue in the GitHub repository.
