from sqlalchemy import  create_engine, String, Float, Boolean
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase, Mapped, mapped_column
from typing import Optional

# pip install "python-jose[cryptography]" "passlib[bcrypt]"

DATABASE_URL = 'postgresql://postgres:1010@localhost:5432/space_ship'
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

class UserModel(Base):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    hashed_password: Mapped[str] = mapped_column(String)


class SpaceshipModel(Base):
    __tablename__ = 'spaceships'
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[Optional[str]] = mapped_column(String)
    speed: Mapped[Optional[float]] = mapped_column(Float)
    destination: Mapped[Optional[str]] = mapped_column(String)
    fuel_level: Mapped[Optional[float]] = mapped_column(Float)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    estimated_arrival_hours: Mapped[Optional[float]] = mapped_column(Float)

def create_db():
    Base.metadata.create_all(bind=engine)

def get_db(): #для получения сессии БД в эндпоинтах
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()