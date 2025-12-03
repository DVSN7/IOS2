# Generative Art - p5.js Shader Project

A generative art project using p5.js and WebGL shaders, deployed on Vercel.

## Features

- Real-time generative art with WebGL shaders
- Multiple theme presets (Filament, Bloom, Cellular, Vortex, Crystal, Organic, Fractal, Liquid, Neural, Cosmic, Magnetic, Wave, Particle)
- Interactive controls (zoom, pan, animation toggle)
- Bundled code for deployment (code remains readable but bundled)

## Local Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build

To build for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## Deployment to Vercel

**📖 For detailed step-by-step instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Test locally:**
   ```bash
   npm run dev
   ```

3. **Create GitHub repository and push code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

4. **Deploy to Vercel:**
   - Go to [Vercel](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

5. **Get your live URL:**
   - After deployment, Vercel provides a URL like `your-project.vercel.app`
   - Every push to GitHub automatically updates your live site!

**For complete instructions with troubleshooting, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

## Project Structure

```
.
├── index.html          # Main HTML file
├── sketch.js           # Main p5.js sketch code
├── shader.vert         # Vertex shader
├── shader.frag         # Fragment shader
├── style.css           # Styles
├── package.json         # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── vercel.json         # Vercel deployment configuration
└── README.md           # This file
```

## Controls

- **Arrow Keys (Up/Down)**: Zoom in/out
- **Mouse Drag**: Pan around the canvas
- **S Key**: Toggle animation
- **R Key**: Reset pan position
- **1/2 Keys**: Adjust palette threshold

## Code Protection

The code is bundled into single files using Vite, making it less accessible while remaining readable (no minification or obfuscation). The shader files are imported as raw text and bundled with the JavaScript.

## License

This project is for personal/educational use.

