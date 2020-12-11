import datetime
import enum

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship

from .db import Base


class UserRole(enum.Enum):
    user = 1
    admin = 2


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), unique=True)
    name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.user)
    posts = relationship('Post', back_populates="author",
                         cascade="all, delete-orphan")


class POST_STATUS(enum.Enum):
    draft = 0
    publihed = 1


class Post(Base):
    __tablename__ = 'posts'

    id = Column(String, primary_key=True)
    slug = Column(String(200), unique=True)
    content = Text(String)
    author_id = Column(Integer, ForeignKey('users.id'), index=True)
    created_on = Column(DateTime, default=datetime.datetime.utcnow)
    updated_on = Column(DateTime, onupdate=datetime.datetime.utcnow)
    status = Column(Enum(POST_STATUS), default=POST_STATUS.draft)

    author = relationship('User', back_populates='posts')
