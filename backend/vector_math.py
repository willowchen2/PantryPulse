import numpy as np

def cosine_similarity(vec1, vec2):
    """Calculate the cosine similarity between two vectors."""
    vecA = np.array(vec1, dtype=np.float64)
    vecB = np.array(vec2, dtype=np.float64)
    dot_product = np.dot(vecA, vecB)
    norm_vec1 = np.linalg.norm(vecA)
    norm_vec2 = np.linalg.norm(vecB)
    
    if norm_vec1 == 0 or norm_vec2 == 0:
        return 0.0  # Avoid division by zero
    
    return float(dot_product / (norm_vec1 * norm_vec2))


def rank_pantry_needs(donation_vector, pantries_dict):
    """Rank pantries' need vectors based on cosine similarity to the donation vector."""
    rankings = []
    
    for pantry_id, pantry_data in pantries_dict.items():
        need_vector = pantry_data["need_vector"]
        match_score = cosine_similarity(donation_vector, need_vector)
        info = {
            "pantry_id": pantry_id,
            "match_score": round(match_score,4),
            "distance_miles": pantry_data["distance_miles"]
        }
        rankings.append(info)
    return sorted(rankings, key = lambda x : x["match_score"], reverse=True)

if __name__ == "__main__":
    # Sample Donation Vector: [Produce, Protein, Dairy, Grains, Shelf-Stable]
    sample_donation = [1, 2, 3, 4, 5]
    
    sample_pantries = {
        "Community Fridge A": {
            "need_vector": [2,3,1,4,5],
            "distance_miles": 1.2
        },
        "Community Fridge B": {
            "need_vector": [1,1,1,1,1],
            "distance_miles": 0.5
        },
        "Community Fridge C": {
            "need_vector": [5,4,3,2,1],
            "distance_miles": 2.0
        }
    }
    results = rank_pantry_needs(sample_donation, sample_pantries)
    for result in results:
        print(f"Pantry: {result['pantry_id']}, Match Score: {result['match_score']}, Distance: {result['distance_miles']} miles\n")