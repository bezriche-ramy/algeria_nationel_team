#!/bin/bash

# Algeria National Football Team - Deployment Script
# This script prepares the project for Vercel deployment

echo "🇩🇿 Algeria National Football Team - Deployment Preparation"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Running linter..."
npm run lint

echo "🏗️  Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Ready for Vercel deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Connect your repository to Vercel"
    echo "3. Deploy automatically or run: npx vercel"
    echo ""
    echo "📊 Build output:"
    ls -la dist/
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
