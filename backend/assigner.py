import pulp
from vector_math import rank_pantry_needs 

def assign_food_dist(donation_vector, pantries_dict, distances):
    categories = range(5) #Produce, Protein, Dairy, Grains, Shelf-Stable
    pantries = list(pantries_dict.keys())
    problem = pulp.LpProblem("Donor_Pantry_Pairing", pulp.LpMaximize)
    
    #decision variable: x[p,c] = amt of category c sent to pantry p
    x = pulp.LpVariable.dicts("shipment", ((p,c) for p in pantries for c in categories), lowBound=0,cat='Integer')
    
    #binary decision variable, 0 or 1, use it or not
    y = pulp.LpVariable.dicts("use_pantry",pantries, cat ='Binary')
    
    #objective function to max net utility of chosen pantry
    utility = []
    dist_penalty = 0.05 #adjustable
    for p in pantries:
        for c in categories:
            reward_perLb = pantries_dict[p]["match_score"] - (dist_penalty*distances[p])
            total = x[p,c]*reward_perLb
            utility.append(total)
    problem+=pulp.lpSum(utility)
        
    #CONSTRAINTS
    #donor makes one stop total
    problem+=pulp.lpSum(y[p] for p in pantries)==1 
    
    #don't promise more food than the donated amount for each category
    for c in categories:
        problem += pulp.lpSum(x[p,c] for p in pantries) <=donation_vector[c]
    
    #don't send more than the amount of space each pantry has
    for p in pantries:
        space_free = pantries_dict[p]["free_space_lbs"]
        problem +=pulp.lpSum(x[p,c] for c in categories) <= space_free*y[p]
                      
    status = problem.solve(pulp.PULP_CBC_CMD(msg=False))
    print(f"SOLVER STATUS: {pulp.LpStatus[status]}")

    distribution_plan = {}
    if pulp.LpStatus[status] == 'Optimal':
        for p in pantries:
            if y[p].varValue and y[p].varValue>0.9:              
                distribution_plan[p] = {}
                for c in categories:
                    amt = int(x[p,c].varValue)
                    if amt > 0:
                        distribution_plan[p][c] = amt
    
    return distribution_plan

if __name__ == "__main__":
    #Produce, Protein, Dairy, Grains, Shelf-Stable
    sample_donation = [10,20,15,30,10]
    sample_pantries = {
        "Community Fridge A": {
            "need_vector": [30,3,1,40,10],
            "free_space_lbs": 20,
            "distance_miles": 1.2
        },
        "Community Fridge B": {
            "need_vector": [10,60,45,0,20],
            "free_space_lbs": 150,
            "distance_miles": 4.5
        },
        "Community Fridge C": {
            "need_vector": [5,4,3,2,1],
            "free_space_lbs": 25,
            "distance_miles": 2.0
        }
    }
    
    distances = {name: data["distance_miles"] for name, data in sample_pantries.items()}
      
    rankings = rank_pantry_needs(sample_donation, sample_pantries)
    for r in rankings:
        pantry_key = r["pantry_id"]
        sample_pantries[pantry_key]["match_score"] = r["match_score"]
    
    plan = assign_food_dist(sample_donation, sample_pantries, distances)
      
    labels = ["Produce", "Protein", "Dairy", "Grains", "Shelf-Stable"]
    for pantry, items in plan.items():
        print(f"Destination: {pantry}")
        if items:
            for cat, amt in items.items():           
                print(f"Deliver {amt} lbs of {labels[cat]}")
        else: 
            print("Skip")              