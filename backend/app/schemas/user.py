from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


def normalize_username(username: str) -> str:
    return username.strip()


def normalize_email(email: EmailStr) -> str:
    return str(email).strip().lower()


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr

    @field_validator("full_name")
    @classmethod
    def clean_full_name(cls, value: str) -> str:
        return " ".join(value.strip().split())

    @field_validator("username")
    @classmethod
    def clean_username(cls, value: str) -> str:
        return normalize_username(value)

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: EmailStr) -> str:
        return normalize_email(value)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, confirm_password: str, info) -> str:
        if "password" in info.data and confirm_password != info.data["password"]:
            raise ValueError("Passwords do not match")
        return confirm_password

    @field_validator("password")
    @classmethod
    def password_complexity(cls, password: str) -> str:
        if password.strip() != password:
            raise ValueError("Password must not start or end with whitespace")
        checks = [
            any(character.islower() for character in password),
            any(character.isupper() for character in password),
            any(character.isdigit() for character in password),
        ]
        if not all(checks):
            raise ValueError("Password must include uppercase, lowercase, and numeric characters")
        return password


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    username: str | None = Field(default=None, min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr | None = None

    @field_validator("full_name")
    @classmethod
    def clean_optional_full_name(cls, value: str | None) -> str | None:
        return " ".join(value.strip().split()) if value is not None else value

    @field_validator("username")
    @classmethod
    def clean_optional_username(cls, value: str | None) -> str | None:
        return normalize_username(value) if value is not None else value

    @field_validator("email")
    @classmethod
    def clean_optional_email(cls, value: EmailStr | None) -> str | None:
        return normalize_email(value) if value is not None else value

    @model_validator(mode="after")
    def require_at_least_one_field(self) -> "UserUpdate":
        if not self.model_dump(exclude_none=True):
            raise ValueError("At least one profile field must be provided")
        return self


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    username: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
