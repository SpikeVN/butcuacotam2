import json
from typing import Optional
from sqlalchemy import Column, String, Text, Integer, LargeBinary
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from backend.config import settings


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    spell_hash: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String)
    registration_ip: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    progress_json: Mapped[str] = mapped_column(Text, default="{}")


class Answer(Base):
    __tablename__ = "answers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    spell_hash: Mapped[str] = mapped_column(String, index=True)
    challenge_id: Mapped[str] = mapped_column(String)
    answer_data: Mapped[str] = mapped_column(Text)


class Checkpoint(Base):
    __tablename__ = "checkpoints"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    spell_hash: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String)
    timestamp: Mapped[int] = mapped_column(Integer)


class UploadedFile(Base):
    __tablename__ = "uploads"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    spell_hash: Mapped[str] = mapped_column(String, index=True)
    filename: Mapped[str] = mapped_column(String)
    content: Mapped[bytes] = mapped_column(LargeBinary)
    timestamp: Mapped[int] = mapped_column(Integer)


engine = create_async_engine(f"sqlite+aiosqlite:///{settings.DB_PATH}")
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def init_db():
    print(f"Initializing database at {settings.DB_PATH}...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database schema initialized successfully.")


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
