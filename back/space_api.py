
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, SpaceshipModel, create_db, get_db, UserModel
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from fastapi.security import OAuth2PasswordRequestForm

app = FastAPI(title='Space Control API')


app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)
create_db()

class UserCreate(BaseModel):
    username: str
    password: str

@app.post('/register_user')
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail='Username already exists')
    new_user = UserModel(
        username=user.username,
        hashed_password=get_password_hash(user.password),
    )
    db.add(new_user)
    db.commit()
    return {'message': 'User created'}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type":"bearer"}


class Spaceship(BaseModel):
    name: str = Field(..., example='Discovery-1') #обязательное поле
    # name: str = Field('Discovery-1') - по умолчанию
    # name: Optional[str] = Field(None) - необязательное
    speed: float = Field(..., gt=0, example=15000.0) #скорость >0
    destination: str = Field(..., example='Mars')#пункт назначения
    fuel_level: float = Field(100.0, ge=0, le=100) #от 0 до 100 топливо
    is_active: bool = True # статус полета


#  ЭНДПОИНТЫ
@app.get('/ships')
def get_all_ships(db: Session = Depends(get_db)):
    ships = db.query(SpaceshipModel).all()
    return {"total_ships": len(ships), "ships": ships}



@app.post("/ships/register")
def register_ship(ship: Spaceship, db: Session = Depends(get_db),current_user: str = Depends(get_current_user)):
    distance_to_mars = 225000000
    arrival_time = round(distance_to_mars / ship.speed, 2)
    new_ship = SpaceshipModel(
         name=ship.name,
         speed=ship.speed,
         destination=ship.destination,
         fuel_level=ship.fuel_level,
         estimated_arrival_hours=arrival_time
    )
    db.add(new_ship)
    db.commit()
    return {"message": f"Корабль {ship.name} зарегистрирован  пользователем {current_user}"}

# npx create-react-app space-front
# npm start
# #  npm create vite@latest space-front -- --template react
# npm run dev
# cd space-front
# npm install
# npm install axios
