#!/bin/bash

echo "✅ Script is running"
echo "📍 Current directory: $(pwd)"
echo "📦 Node version: $(node -v)"
echo "🧪 Electron version: $(electron -v)"

electron . --enable-logging


# Optional: trap exit signals
trap "echo '🛑 Electron exited'" EXIT
