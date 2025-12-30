#!/bin/bash
# LinguaFabric - Dependency Installation Script

echo "🚀 Installing LinguaFabric dependencies..."
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js from https://nodejs.org/"
    echo "   Then run this script again."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing npm packages..."
npm install

# Install Supabase client specifically
echo ""
echo "📦 Installing Supabase client..."
npm install @supabase/supabase-js

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. cd $(pwd)"
echo "   2. npm run dev"
echo "   3. Open http://localhost:5173 in your browser"
echo ""
echo "🔐 Verify .env.local is configured with your Supabase credentials"
echo "   Check: https://supabase.com → Your Project → Settings → API"
