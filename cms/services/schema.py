from pydantic import BaseModel
from pydantic import EmailStr

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    name: str
    password: str