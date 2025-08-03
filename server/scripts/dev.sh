#!/bin/bash

if [[ "$PWD" == *"\\wsl.localhost"* ]]; then
  echo "❌ Detected Windows shell. Please run this script inside WSL."
  exit 1
fi


echo "In the shell script, will set up redis and nodemon for development environment."
set -e

REDIS_STARTED=false

cleanup() {
    echo "Shutting down background processes..."
    if [ "$REDIS_STARTED" = true ]; then
        echo "🛑 Killing Redis process with PID $REDIS_PID"
        kill $REDIS_PID
    fi
}
trap cleanup EXIT

# Check if redis-server is already running on port 6379
if lsof -i :6379 >/dev/null; then
  echo "ℹ️ Redis already running on port 6379. Skipping start..."
else
  echo "🚀 Starting redis-server in the background..."
  redis-server &
  REDIS_PID=$!
  REDIS_STARTED=true
  sleep 2
fi

# Wait until Redis responds to PING
echo "Waiting for Redis to be ready..."
until redis-cli ping | grep -q PONG; do
    sleep 1
done

echo "Redis is ready. Starting Node.js with nodemon..."
if command -v nodemon >/dev/null; then
    echo "Using nodemon for development..."
    nodemon index.js
else
    echo "nodemon not found. Falling back to node."
    node index.js
fi

echo "✅ Dev script completed. Server shut down."
