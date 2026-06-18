import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Grains', 'Shelf-Stable']

export default function Dashboard() {
    //states
    const [pantries, setPantries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [donation, setDonation] = useState([0, 0, 0, 0, 0]); // Produce, Protein, Dairy, Grains, Shelf-Stable
    const [optimizationResults, setOptimizationResults] = useState(null);
    const [optimizing, setOptimizing] = useState(false)

    useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true);
                const data = await apiService.getPantries(); //js messenger to get Flask backend
                setPantries(data);
            } catch (err) {
                setError("Couldn't connect to the PantryPulse server.");
            } finally {
                setLoading(false);
            }
        }
        loadDashboardData();
    }, []);

    if (loading) return <div style={styles.center}>Loading community fridges...</div>;
    if (error) return <div style={{ ...styles.center, color: 'red' }}>{error}</div>;

    const handleSliderChange = (index, value) => {
        const nextDonation = [...donation];
        nextDonation[index] = parseInt(value) || 0;
        setDonation(nextDonation);
    };

    const handleRunOptimization = async () => {
        try{
            setOptimizing(true);
            setError(null);
            const result = await apiService.optimizeDistribution(donation);

            console.log("True Payload received from Flask:", result);
            if(result.success){
                setOptimizationResults(result.data.plan)
            } else {
                setError("The optimization engine encountered an issue solving the constraints.")
            }
        } catch(err){
            setError("Failure to communicate with the engine backend.")
        } finally {
            setOptimizing(false)
        }
    };


    //styling
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>PantryPulse Dashboard</h1>
                <p style={styles.subtitle}>Real-time community fridge capacities and distribution priorities</p>
            </header>
            <div style={styles.controlPanel}>
                <h2 style={styles.panelTitle}>🚚 New Donation Delivery Truck Intake</h2>
                <p style={styles.panelSubtitle}>Drag the sliders to log the weight (lbs) of arriving donation categories:</p>

                <div style={styles.sliderGrid}>
                    {CATEGORIES.map((category, idx) => (
                        <div key={category} style={styles.sliderWrapper}>
                            <div style={styles.sliderLabelRow}>
                                <span style={styles.categoryName}>{category}</span>
                                <span style={styles.weightBadge}>{donation[idx]} lbs</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={donation[idx]}
                                onChange={(e) => handleSliderChange(idx, e.target.value)}
                                style={styles.rangeInput}
                            />
                        </div>
                    ))}
                </div>
                <button style={{...styles.button,
                    backgroundColor: optimizing? '#94a3b8' : '#3b82f6',
                    cursor: optimizing ? 'not-allowed' : 'pointer'
                }} onClick={handleRunOptimization}
                   disabled={optimizing}
                >
                    {optimizing ? 'Computing optimal allocation plan...' : 'Run Resource Optimization Engine'}
                </button>
            </div>

            {/* Main Fridge Grid Display */}
            <div style={styles.grid}>
                {pantries.map((pantry) => (
                    <div key={pantry.id} style={styles.card}>
                        <h3 style={styles.cardTitle}>{pantry.name}</h3>
                        <p style={styles.cardDetail}><strong>Distance:</strong> {pantry.distance_miles} miles</p>
                        <p style={styles.cardDetail}><strong>Available Space:</strong> {pantry.free_space_lbs} lbs</p>

                        <div style={styles.vectorBox}>
                            <strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Current Need Vector:</strong>
                            <div style={styles.vectorRow}>
                                {pantry.need_vector && pantry.need_vector.map((val, idx) => (
                                    <span key={idx} style={styles.vectorBadge}>{val}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' },
    header: { marginBottom: '32px', borderBottom: '1px solid #eee', paddingBottom: '16px' },
    title: { fontSize: '28px', color: '#111', marginBottom: '4px' },
    subtitle: { color: '#666', fontSize: '14px' },

    // Control Panel Styles
    controlPanel: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
    panelTitle: { fontSize: '18px', color: '#1e293b', marginBottom: '6px', marginTop: 0 },
    panelSubtitle: { color: '#64748b', fontSize: '13px', marginBottom: '20px', marginTop: 0 },
    sliderGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
    sliderWrapper: { display: 'flex', flexDirection: 'column', gap: '6px' },
    sliderLabelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    categoryName: { fontSize: '13px', fontWeight: '600', color: '#475569' },
    weightBadge: { backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', color: '#334155' },
    rangeInput: { width: '100%', cursor: 'pointer', accentColor: '#3b82f6' },
    button: { width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '32px' },
    card: { padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    cardTitle: { fontSize: '18px', marginBottom: '12px', color: '#2c3e50' },
    cardDetail: { fontSize: '14px', margin: '6px 0', color: '#555' },
    vectorBox: { marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #eee' },
    vectorRow: { display: 'flex', gap: '6px', marginTop: '6px' },
    vectorBadge: { backgroundColor: '#f0f4f8', color: '#334e68', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' },
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontFamily: 'sans-serif' }
};