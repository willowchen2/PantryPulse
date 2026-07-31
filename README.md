**PantryPulse**

An algorithmic logistics platform that dynamically routes food donations to community fridges based on real-time category deficits and distance constraints. PantryPulse bridges the gap between food drivers and local community fridge networks. Instead of relying on manual estimates or static distribution schedules, PantryPulse utilizes vectors' cosine similarity scoring and linear programming (PuLP library) to compute mathematical drop-off plans that maximize community need fulfillment while minimizing logistics overhead.

**Demo**

<img width="800" height="456" alt="PantryPulse_DEMO-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/1a1b4415-89ca-489f-b64f-dfa05b2bef1c" />




**Tech Stack + Architecture**

Frontend: React.js, REST API, jsx, & css
Backend: Python, Flask REST API, SQLite w/ SQLAlchemy ORM, PuLP (Linear Programming solver), & Numpy
General system flow:
- Frontend maintains a slider & optimize button for inputting incoming donation requests and cards containing seed values of pantry needs
- REST API takes a json payload (POST/api/optimize)
- Data gets send to the backend where the vector math module ranks cosine similarity/priority scoring
- The LP engine runs to determine optimal matching


**Optimization Engine Rundown**

- Pantry shortages are represented by a 5 dimensional need vector --> [Produce, Protein, Dairy, Grains, Shelf-Stable]
- Given a donation vector, a sorted list of said vector in relation to all the pantry need vectors contains the calculated cosine similarity (ranked)
- LP objective function: max summation of ((allocated food * pantry priority score) - penalized travel distance value)
- LP constraints: total allocation to chosen pantry cannot exceed supply of donor & total weight delivered cannot exceed pantry's available space 


**Inspired by concepts from ENGR1101 - Engineering Operations: Data Science & Decision Making (Cornell Freshmen Intro Operations Research Course)**

- decision variables, objective function, constraint setting (supply/conservation + knapsack), & linear programming
- find out more: https://classes.cornell.edu/browse/roster/FA25/class/ENGRI/1101


