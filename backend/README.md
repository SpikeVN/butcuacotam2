# ShitBase Backend

A FastAPI implementation of the game backend.

## Requirements

- Python 3.12+
- Dependencies listed in `pyproject.toml` (install via `pip install -e .` or `pip install fastapi uvicorn[standard] python-jose[cryptography] python-multipart sqlalchemy aiosqlite pydantic-settings`)

## Running the server

From the project root:

```bash
python -m backend.main
```

Or from the `backend/` directory:

```bash
uvicorn main:app --host 0.0.0.0 --port 6942 --reload
```

## Database Browser (sqlite-web)

You can browse the database using `sqlite-web`. A script is provided for convenience:

```bash
./run_sqlite_web.sh
```

This will start a web UI at `http://localhost:8080`.

## Features

- JWT Authentication via `spell_hash`.
- SQLite database (document-store style).
- Logging to `logs/backend.log`.
- Progress and Answer storage.
- File uploads stored as BLOBs in the database.

## Configuration

Edit `.env` or `config.py` for settings.

- `DEBUG`: Toggle verbose logging.
- `SECRET_KEY`: JWT secret.
- `PORT`: Server port (default 6942).
