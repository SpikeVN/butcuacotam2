from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any


class Progress(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    timestamp: int
    path: str
    index: int


class UserData(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    spell_hash: str = Field(..., alias="_id")
    name: str
    email: str
    progress: Optional[Progress] = None


class UserAnswer(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    spell_hash: str = Field(..., alias="_id")
    challenges: Dict[str, Dict[str, str]] = {}


class RegisterRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    email: str
    spell: str


class TokenRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    spell: str


class TokenResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: str = "OK"
    access_token: str
    token_type: str = "bearer"
