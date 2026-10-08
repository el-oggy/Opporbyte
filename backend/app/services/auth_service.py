"""Authentication service business logic."""

from typing import Optional
from sqlalchemy.orm import Session

from app.core.security import verify_password
from app.models.user import User


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Verify user credentials and return user model if valid."""
        user = db.query(User).filter(User.email == email.strip().lower()).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
