import React, { useState, useEffect } from 'react';
import { Loader, AlertTriangle, RefreshCw } from 'lucide-react';

const SoilHealthAnalysis = ({ latitude, longitude }) => {
  const [soilNutrients, setSoilNutrients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update: API endpoint for real soil data
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://agrisense-hackproject.onrender.com';

  const fetchSoilData = async () => {
    if (!latitude || !longitude) {
      setError('Latitude and longitude are required');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/soil/live?lat=${latitude}&lon=${longitude}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch soil data');
      setSoilNutrients(data.nutrients || []);
    } catch (err) {
      setError(err.message);
      setSoilNutrients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude) fetchSoilData();
  }, [latitude, longitude]);

  const handleRetry = () => fetchSoilData();

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
      <Loader className="animate-spin h-8 w-8 text-blue-600 mb-4" />
      <p className="text-gray-600">Loading soil health data...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
      <AlertTriangle className="h-8 w-8 text-red-600 mb-4" />
      <p className="text-red-700 text-center mb-4">{error}</p>
      <button
        onClick={handleRetry}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Soil Nutrients Analysis</h3>
      {soilNutrients.length > 0 ? (
        <table className="min-w-full border border-gray-200 rounded">
          <thead>
            <tr>
              <th className="px-4 py-2">Nutrient</th>
              <th className="px-4 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {soilNutrients.map((nutrient, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2">{nutrient.nutrient}</td>
                <td className="px-4 py-2">{nutrient.value !== null ? nutrient.value : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p>No nutrient data available for this location</p>
        </div>
      )}
    </div>
  );
};

export default SoilHealthAnalysis;