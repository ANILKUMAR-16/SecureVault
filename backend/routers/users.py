from fastapi import APIRouter, Depends
from models.user import User
from schemas.user import UserResponse
from api.deps import get_current_user, get_current_admin

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
def read_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current logged in user profile.
    """
    return current_user

# Note: The GET /users endpoint (for Admin) will be placed in the admin router later.
