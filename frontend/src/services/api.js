//Bridge to the Flask service.
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const apiService = {
    //Fetch all the community pantries from the database
    getPantries: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/pantries`);
            if (!response.ok) throw new Error(`Network response was not ok`);
            const jsonResponse = await response.json();
            return jsonResponse.data.pantries; //arrary of pantries
        } catch (error) {
            console.error("Error fetching pantries: ", error);
            throw error;
        }
    },

    //Submit a donation vector to get most optimal plan/fridge assignment
    optimizeDistribution: async (donationVector) => {
        try {
            const response = await fetch(`${API_BASE_URL}/optimize`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({donation_vector: donationVector}),
            });
            if(!response.ok) throw new Error("Optimization request failed");
            const jsonResponse = await response.json();
            return jsonResponse;
        } catch (error) {
            console.error("Error running optimization: ", error);
            throw error;
        }
    }
};

