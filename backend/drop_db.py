import os
from database.database import engine
from database.models import Base

print("Dropping tables...")
Base.metadata.drop_all(bind=engine)
print("Done!")
