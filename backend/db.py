from flask_sqlalchemy import SQLAlchemy

# Create the unified database object. 
# This single object handles your engine, your sessions, and your table blueprints!
db = SQLAlchemy()

class Pantry(db.Model):
    __tablename__ = "pantries"
    
    id = db.Column(db.Integer, primary_key = True, autoincrement = True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    need_vector = db.Column(db.JSON, nullable=False)
    free_space_lbs = db.Column(db.Float, nullable=False)
    distance_miles = db.Column(db.Float,nullable=False)
    
    def __repr__(self):
        return f"Pantry {self.name}"
    