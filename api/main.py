from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

import jwt
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
TOKEN_TTL_MINUTES = 60
DB_PATH = os.path.join(os.path.dirname(__file__), "shop.sqlite3")

app = FastAPI(title="Garden Shop API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
bearer = HTTPBearer(auto_error=False)

# ---------- модели Pydantic (совпадают с TypeScript-интерфейсами фронтенда) ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4, max_length=128)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class User(BaseModel):
    id: int
    email: EmailStr
    full_name: str

class Item(BaseModel):
    id: int
    title: str
    category: str
    price: int
    description: str
    in_stock: bool

class ItemCreate(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=60)
    price: int = Field(gt=0)
    description: str = Field(default="", max_length=2000)
    in_stock: bool = True

# ---------- работа с БД ----------
def db() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def hash_password(password: str, salt: Optional[bytes] = None) -> str:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
    return f"{salt.hex()}${digest.hex()}"

def verify_password(password: str, stored: str) -> bool:
    salt_hex, digest_hex = stored.split("$", 1)
    salt = bytes.fromhex(salt_hex)
    expected = bytes.fromhex(digest_hex)
    actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
    return hmac.compare_digest(expected, actual)

def init_db() -> None:
    with db() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                full_name TEXT NOT NULL,
                password_hash TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                price INTEGER NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                in_stock INTEGER NOT NULL DEFAULT 1
            );
            """
        )
        if connection.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
            connection.execute(
                "INSERT INTO users (email, full_name, password_hash) VALUES (?, ?, ?)",
                ("student@example.com", "Сергей Лебедев", hash_password("password123")),
            )
        if connection.execute("SELECT COUNT(*) FROM items").fetchone()[0] == 0:
            rows = [
                ("Секатор классический", "Инструменты", 1890, "Сталь, рез до 18 мм", 1),
                ("Лопатка садовая", "Инструменты", 1190, "Компактная, для рассады", 1),
                ("Лейка 5 л", "Инструменты", 990, "Съёмный рассеиватель", 0),
                ("Монстера деликатесная", "Растения", 2490, "Высота 60 см", 1),
                ("Базилик зелёный", "Растения", 290, "Горшочек 9 см", 1),
                ("Кашпо терракотовое", "Кашпо", 690, "Объём 3 л, дренаж", 1),
                ("Подвесное кашпо «Макраме»", "Кашпо", 1290, "Хлопок, до 4 кг", 0),
                ("Грунт универсальный 10 л", "Уход", 490, "С перлитом и биогумусом", 1),
                ("Удобрение жидкое 0,5 л", "Уход", 590, "1 колпачок на 2 л", 1),
                ("Опрыскиватель 1 л", "Уход", 740, "Мелкодисперсное распыление", 1),
            ]
            connection.executemany(
                "INSERT INTO items (title, category, price, description, in_stock) VALUES (?, ?, ?, ?, ?)",
                rows,
            )
    db().close()

def create_token(user_id: int, email: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=TOKEN_TTL_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer)],
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Требуется токен")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Токен истёк") from None
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный токен") from None

    with db() as connection:
        row = connection.execute("SELECT id, email, full_name FROM users WHERE id = ?", (payload["sub"],)).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Пользователь не найден")
    return User(**dict(row))

@app.on_event("startup")
def on_startup() -> None:
    init_db()

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    with db() as connection:
        row = connection.execute(
            "SELECT id, email, password_hash FROM users WHERE email = ?", (payload.email,)
        ).fetchone()
    if row is None or not verify_password(payload.password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный e-mail или пароль")
    return TokenResponse(access_token=create_token(row["id"], row["email"]))

@app.get("/auth/me", response_model=User)
def me(user: Annotated[User, Depends(current_user)]) -> User:
    return user

@app.get("/items", response_model=list[Item])
def list_items(
    category: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
) -> list[Item]:
    query = "SELECT id, title, category, price, description, in_stock FROM items WHERE 1 = 1"
    params: list[object] = []
    if category:
        query += " AND category = ?"
        params.append(category)
    if search:
        query += " AND (title LIKE ? OR description LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    query += " ORDER BY title"
    with db() as connection:
        rows = connection.execute(query, params).fetchall()
    return [Item(**{**dict(row), "in_stock": bool(row["in_stock"])}) for row in rows]

@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int) -> Item:
    with db() as connection:
        row = connection.execute(
            "SELECT id, title, category, price, description, in_stock FROM items WHERE id = ?", (item_id,)
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Товар не найден")
    return Item(**{**dict(row), "in_stock": bool(row["in_stock"])})

@app.post("/items", response_model=Item, status_code=status.HTTP_201_CREATED)
def create_item(item: ItemCreate, user: Annotated[User, Depends(current_user)]) -> Item:
    with db() as connection:
        cursor = connection.execute(
            "INSERT INTO items (title, category, price, description, in_stock) VALUES (?, ?, ?, ?, ?)",
            (item.title, item.category, item.price, item.description, int(item.in_stock)),
        )
        item_id = cursor.lastrowid
    return Item(id=int(item_id), **item.model_dump())
