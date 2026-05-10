#!/bin/bash
# Script to run sqlite-web to browse the database
# Make sure you are in the backend directory or provide the correct path

DATABASE_PATH="db_data/database.sqlite"
PORT=8080

if [ ! -f "$DATABASE_PATH" ]; then
    echo "Database file not found at $DATABASE_PATH. Start the backend server first to initialize it."
    exit 1
fi

echo "Starting sqlite-web on http://localhost:$PORT"
sqlite_web "$DATABASE_PATH" --port "$PORT" --host 0.0.0.0
