#!/bin/bash

# Configuration
BACKEND_DIR=$(pwd)
DATA_DIR="$HOME/mongodb_data"
LOG_FILE="$DATA_DIR/mongod.log"
PID_FILE="$BACKEND_DIR/server.pid"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

function init() {
    echo -e "${GREEN}Initializing project environment...${NC}"
    mkdir -p "$DATA_DIR"
    
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        echo "MONGODB_URI=mongodb://localhost:27017/butcuacotam" > "$BACKEND_DIR/.env"
        echo "RUST_LOG=info" >> "$BACKEND_DIR/.env"
        echo "VITE_API_ENDPOINT=http://localhost:8080" >> "$BACKEND_DIR/.env"
        echo -e "${GREEN}Created .env file.${NC}"
    fi
}

function start() {
    echo -e "${GREEN}Starting MongoDB...${NC}"
    if pgrep -x "mongod" > /dev/null; then
        echo "MongoDB is already running."
    else
        mongod --dbpath "$DATA_DIR" --port 27017 --logpath "$LOG_FILE" --fork
    fi

    echo -e "${GREEN}Starting Backend Server...${NC}"
    # Run cargo build if binary doesn't exist
    if [ ! -f "target/debug/backend" ]; then
        cargo build
    fi
    
    # Run in background and save PID
    ./target/debug/backend > server.log 2>&1 &
    echo $! > "$PID_FILE"
    echo -e "${GREEN}Server started with PID $(cat "$PID_FILE")${NC}"
}

function stop() {
    echo -e "${RED}Stopping Backend Server...${NC}"
    if [ -f "$PID_FILE" ]; then
        kill "$(cat "$PID_FILE")" && rm "$PID_FILE"
    else
        pkill -f "target/debug/backend"
    fi

    echo -e "${RED}Stopping MongoDB...${NC}"
    mongod --dbpath "$DATA_DIR" --shutdown
}

function status() {
    if pgrep -x "mongod" > /dev/null; then
        echo -e "MongoDB: ${GREEN}RUNNING${NC}"
    else
        echo -e "MongoDB: ${RED}STOPPED${NC}"
    fi

    if pgrep -f "target/debug/backend" > /dev/null; then
        echo -e "Backend: ${GREEN}RUNNING${NC}"
    else
        echo -e "Backend: ${RED}STOPPED${NC}"
    fi
}

case "$1" in
    init)
        init
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 2
        start
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {init|start|stop|restart|status}"
        exit 1
esac
