import os
import json
import logging
import time
import hashlib
from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
    Response,
    Request,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from contextlib import asynccontextmanager

from backend.config import settings
from backend.models import (
    RegisterRequest,
    TokenRequest,
    TokenResponse,
    UserData,
    Progress,
    UserAnswer,
)
from backend.db import get_db, init_db, User, Answer, UploadedFile, Checkpoint
from backend.auth import create_access_token, get_current_user_hash

# Logging setup
log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format=log_format,
    handlers=[
        logging.FileHandler(os.path.join(settings.LOG_DIR, "backend.log")),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("Database initialized")
    yield


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# CORS setup - allowing localhost for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://butcuacotam.cteftu.id.vn",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/register", response_model=TokenResponse)
async def register(
    req: RegisterRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    # Hash the raw spell to get the spell_hash
    spell_hash = hashlib.blake2b(req.spell.encode(), digest_size=32).hexdigest()

    # Get real IP if behind proxy
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        client_ip = x_forwarded_for.split(",")[0].strip()
    else:
        client_ip = request.headers.get("X-Real-IP", request.client.host)

    if settings.DEBUG:
        logger.debug(f"Registering user: {spell_hash} from {client_ip}")

    result = await db.execute(select(User).where(User.spell_hash == spell_hash))
    user = result.scalars().first()
    if user:
        raise HTTPException(status_code=400, detail="User already registered")

    new_user = User(
        spell_hash=spell_hash,
        name=req.name,
        email=req.email,
        registration_ip=client_ip,
        progress_json=json.dumps(
            {"path": "intro_game1", "index": 0, "timestamp": int(time.time() * 1000)}
        ),
    )
    db.add(new_user)
    await db.commit()

    # Generate token and set cookie after successful registration
    access_token = create_access_token(data={"sub": spell_hash})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="none",
        secure=True,
    )

    return {
        "status": "OK",
        "access_token": access_token,
        "token_type": "bearer",
    }


@app.post("/auth/token", response_model=TokenResponse)
async def login(
    req: TokenRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    # Hash the raw spell to get the spell_hash
    spell_hash = hashlib.blake2b(req.spell.encode(), digest_size=32).hexdigest()

    if settings.DEBUG:
        logger.debug(f"Login attempt for spell (hashed): {spell_hash}")

    result = await db.execute(select(User).where(User.spell_hash == spell_hash))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    access_token = create_access_token(data={"sub": user.spell_hash})

    # Set cookie as well since client uses credentials: "include"
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="none",
        secure=True,
    )

    return {"status": "OK", "access_token": access_token, "token_type": "bearer"}


@app.get("/user/profile", response_model=UserData)
async def get_profile(
    spell_hash: str = Depends(get_current_user_hash), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.spell_hash == spell_hash))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    progress = json.loads(user.progress_json) if user.progress_json else None

    return UserData(
        _id=user.spell_hash,
        name=user.name,
        email=user.email,
        progress=Progress(**progress) if progress else None,
    )


@app.post("/user/saveProgress")
async def save_progress(
    progress: Progress,
    spell_hash: str = Depends(get_current_user_hash),
    db: AsyncSession = Depends(get_db),
):
    if settings.DEBUG:
        logger.debug(f"Saving progress for {spell_hash}: {progress}")

    result = await db.execute(select(User).where(User.spell_hash == spell_hash))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.progress_json = json.dumps(progress.model_dump())
    await db.commit()
    return {"status": "OK"}


@app.post("/checkpoint/{name}")
async def set_checkpoint(
    name: str,
    spell_hash: str = Depends(get_current_user_hash),
    db: AsyncSession = Depends(get_db),
):
    if settings.DEBUG:
        logger.debug(f"Recording checkpoint {name} for {spell_hash}")

    current_time = int(time.time() * 1000)

    new_checkpoint = Checkpoint(
        spell_hash=spell_hash, name=name, timestamp=current_time
    )
    db.add(new_checkpoint)
    await db.commit()
    return {"status": "OK"}


@app.post("/challengeSubmit/{challenge_id}")
async def submit_challenge(
    challenge_id: str,
    answer: dict,
    spell_hash: str = Depends(get_current_user_hash),
    db: AsyncSession = Depends(get_db),
):
    if settings.DEBUG:
        logger.debug(f"Submitting challenge {challenge_id} for {spell_hash}")

    new_answer = Answer(
        spell_hash=spell_hash, challenge_id=challenge_id, answer_data=json.dumps(answer)
    )
    db.add(new_answer)
    await db.commit()
    return {"status": "OK"}


@app.post("/uploadSolution")
async def upload_solution(
    file: UploadFile = File(...),
    spell_hash: str = Depends(get_current_user_hash),
    db: AsyncSession = Depends(get_db),
):
    if settings.DEBUG:
        logger.debug(f"Uploading file {file.filename} for {spell_hash} to DB as BLOB")

    content = await file.read()
    new_upload = UploadedFile(
        spell_hash=spell_hash,
        filename=file.filename,
        content=content,
        timestamp=int(time.time()),
    )
    db.add(new_upload)
    await db.commit()

    return {"status": "OK", "filename": file.filename}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
