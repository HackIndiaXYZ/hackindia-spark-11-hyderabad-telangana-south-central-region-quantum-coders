from fastapi import APIRouter, Depends, HTTPException, status  # type: ignore
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm  # type: ignore
from pydantic import BaseModel, EmailStr  # type: ignore
from typing import Any
from ..storage.database import get_database
from ..storage.repositories import UserRepository
from .service import get_password_hash, verify_password, create_access_token, decode_access_token

router = APIRouter(prefix="/v1/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="v1/auth/login")

# --- Models ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    lifestyle_data: dict[str, Any] = {
        "age": 32,
        "sex": "male",
        "bmi": 27,
        "sleep": 7,
        "activity": 3,
        "smoking": False,
        "alcohol": False,
        "diet": "average"
    }

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    email: EmailStr
    full_name: str
    uid: str
    photo_url: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: str
    lifestyle_data: dict[str, Any]

# --- Dependencies ---
def get_user_repository():
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is unavailable. Please ensure MongoDB is running or MONGO_URI is configured."
        )
    return UserRepository(db)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    repo: UserRepository = Depends(get_user_repository)
):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user = repo.find_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- Routes ---
@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, repo: UserRepository = Depends(get_user_repository)):
    # Check if user exists
    existing = repo.find_by_email(user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed = get_password_hash(user_data.password)
    
    # Create user
    user_id = repo.create(
        email=user_data.email,
        password_hash=hashed,
        full_name=user_data.full_name,
        lifestyle_data=user_data.lifestyle_data
    )
    return {"message": "User created successfully", "user_id": user_id}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), repo: UserRepository = Depends(get_user_repository)):
    user = repo.find_by_email(form_data.username) # OAuth2PasswordRequestForm uses 'username' field for email/input
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create token
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google")
async def google_auth(data: GoogleAuthRequest, repo: UserRepository = Depends(get_user_repository)):
    user = repo.find_by_email(data.email)
    if user:
        access_token = create_access_token(data={"sub": user.id, "email": user.email})
        return {
            "is_existing": True,
            "access_token": access_token,
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "lifestyle_data": user.lifestyle_data
            }
        }
    else:
        return {
            "is_existing": False,
            "google_profile": {
                "fullName": data.full_name,
                "email": data.email,
                "uid": data.uid
            }
        }

@router.get("/me", response_model=UserProfile)
async def read_users_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "lifestyle_data": current_user.lifestyle_data
    }

@router.put("/profile")
async def update_profile(
    lifestyle_data: dict[str, Any], 
    current_user = Depends(get_current_user),
    repo: UserRepository = Depends(get_user_repository)
):
    success = repo.update_lifestyle(current_user.id, lifestyle_data)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update profile")
    return {"message": "Profile updated successfully"}
