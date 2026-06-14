import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function Dashboard() {
    //states
    const [pantries, setPantries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    //styling
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style = {styles.title}>PantryPulse Dashboard</h1>
                <p style={styles.subtitle}>Real-time community fridge capacities and distribution priorities</p>
            </header>

            <div style={styles.grid}>
                {pantries.map((pantry) => (
                    <div key={pantry.id} style={styles.card}>
                        <h3 style={styles.cardTitle}>{pantry.name}</h3>
                        <p style={styles.cardTitle}><strong>Distance:</strong>{pantry.distance_miles} miles</p>
                        <p style={styles.cardDetail}><strong>Available Space:</strong>{pantry.free_space_lbs} lbs</p>

                        <div style={styles.vectorBox}>
                            <strong style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Current Need Vector:</strong>
                            <div style={styles.vectorRow}>
                                {pantry.need_vector.map((val, idx) => (
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
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
    card: { padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
    cardTitle: { fontSize: '18px', marginBottom: '12px', color: '#2c3e50' },
    cardDetail: { fontSize: '14px', margin: '6px 0', color: '#555' },
    vectorBox: { marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed #eee' },
    vectorRow: { display: 'flex', gap: '6px', marginTop: '6px' },
    vectorBadge: { backgroundColor: '#f0f4f8', color: '#334e68', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' },
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontFamily: 'sans-serif' }
};