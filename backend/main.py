from vector_math import rank_pantry_needs
from assigner import assign_food_dist

import os
from flask import Flask, request, jsonify
from db import db, Pantry 

app = Flask(__name__)
app.debug = True

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'pantry_pulse.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
with app.app_context():
    db.create_all()

def success_response(data, code=200):
    return jsonify({"success": True, "data": data}), code

def failure_response(message, code=404):
    return jsonify({"success": False, "error": message}), code 
    
    
# ROUTES
@app.route('/', methods=['GET'])
def home_welcome():
    return success_response("Welcome to PantryPulse!",200)


#onboard a new pantry
@app.route('/api/pantries', methods=["POST"])    
def create_pantry_record():
    data = request.json 
    pantry_name = data.get("name")
    need_vector = data.get("need_vector")
    free_space = data.get("free_space_lbs")
    distance = data.get("distance_miles")
    
    if not all([pantry_name, need_vector, free_space is not None, distance is not None]):
        return failure_response("Missing required data fields",400)
    
    existing_pantry = Pantry.query.filter_by(name=pantry_name).first()
    if existing_pantry:
        return failure_response(f"A pantry called {pantry_name} already exists",400)
    try:
        new_pantry = Pantry(
            name = pantry_name,
            need_vector = need_vector,
            free_space_lbs = free_space,
            distance_miles = distance
        )
        db.session.add(new_pantry)
        db.session.commit()
        
        return success_response(f"Successfully saved {pantry_name}!",201)
    except Exception as e:
        db.session.rollback()
        return failure_response(f"Database Error: {str(e)}",500)
    
#get all the pantries from the database
@app.route('/api/pantries',methods = ['GET'])   
def get_all_pantries():
    all_rows = Pantry.query.all()
    pantries_list = []
    for p in all_rows:
        pantries_list.append({
            "id": p.id,
            "name": p.name,
            "need_vector": p.need_vector,
            "free_space_lbs": p.free_space_lbs,
            "distance_miles": p.distance_miles          
        }) 
    
    return success_response({"pantries": pantries_list},200)
        
 #run the engine to solve the assignment problem   
@app.route("/api/optimize", methods=["POST"])
def run_optimization_pipeline():
    try:
        payload = request.json     
        donation_vector = payload.get("donation_vector") 
        
        if not donation_vector:
            return failure_response("Missing donation_vector array", 400)    
         
        db_pantries = Pantry.query.all()
        if not db_pantries:
            return failure_response("No pantries found in database.",400)
        
        pantries_dict = {}
        distances = {}
        
        for p in db_pantries:
            pantries_dict[p.name] = {
                "need_vector": p.need_vector,
                "free_space_lbs": p.free_space_lbs,
                "distance_miles": p.distance_miles
            }
            distances[p.name] = p.distance_miles
                       
        rankings = rank_pantry_needs(donation_vector, pantries_dict)
        for r in rankings:
            pantry_key = r["pantry_id"]
            pantries_dict[pantry_key]["match_score"] = r["match_score"]
        
        plan = assign_food_dist(donation_vector, pantries_dict, distances)       
        return success_response({"plan": plan},200)
    
    except KeyError as ke:
        return failure_response(f"Mapping mismatch: {str(ke)}",400)
    except Exception as e:
        return failure_response(f"Engine Error: {str(e)}",500)
    
#update a pantry
@app.route('/api/pantries/<int:pantry_id>', methods=["PUT"])
def update_pantry_record(pantry_id):
    pantry = Pantry.query.get(pantry_id)
    if not pantry:
        return failure_response(f"Pantry with ID {pantry_id} not found",404)
    data = request.json
    try:
        if "name" in data:
            pantry.name = data.get("name")
        if "need_vector" in data:
            pantry.need_vector = data.get("need_vector")
        if "free_space_lbs" in data:
            pantry.free_space_lbs = data.get("free_space_lbs")
        if "distance_miles" in data:
            pantry.distance_miles = data.get("distance_miles")
        db.session.commit()
        return success_response(f"Successfully updated {pantry.name}",200)
    
    except Exception as e:
        db.session.rollback()
        return failure_response(f"Database Error: {str(e)}",500)

#delete a pantry
@app.route('/api/pantries/<int:pantry_id>', methods=["DELETE"])
def delete_pantry_record(pantry_id):
    pantry = Pantry.query.get(pantry_id)
    if not pantry:
        return failure_response(f"Pantry with ID {pantry_id} not found",404)
    try:
        db.session.delete(pantry)
        db.session.commit()
        return success_response(f"Successfully deleted {pantry.name}",200)
    except Exception as e:
        db.session.rollback()
        return failure_response(f"Database Error: {str(e)}",500)


    
if __name__ == "__main__":
    app.run(port=8000,debug=True)
        
