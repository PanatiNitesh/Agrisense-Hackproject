import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const cropData = [
  { crop: "Wheat", yield: 45 },
  { crop: "Rice", yield: 60 },
  { crop: "Maize", yield: 35 },
  { crop: "Sugarcane", yield: 80 },
  { crop: "Pulses", yield: 25 },
];

const cropCategories = [
  {
    name: "Wheat",
    description: "High yield during Rabi season, requires cool climate.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/65/Wheat_close-up.JPG",
  },
  {
    name: "Rice",
    description: "Staple food crop, grows well in areas with high rainfall.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6f/Rice_paddy_field_in_Vietnam.JPG",
  },
  {
    name: "Maize",
    description: "Multi-purpose crop for food, fodder, and biofuel.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/69/Corncobs.jpg",
  },
  {
    name: "Sugarcane",
    description: "Important cash crop used for sugar and ethanol.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/4b/Sugarcane_field.JPG",
  },
  {
    name: "Pulses",
    description: "Rich in proteins, improves soil fertility by nitrogen fixation.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2f/Lentils.jpg",
  },
];

export default function FarmerDashboard() {
  const [farmerName, setFarmerName] = useState("Farmer");
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching farmer details after login
    const storedName = localStorage.getItem("farmerName");
    if (storedName) setFarmerName(storedName);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("farmerName");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">
          Welcome, {farmerName}! 🌱
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      {/* Graph Section */}
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Crop Yield Insights</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cropData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="crop" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="yield" fill="#16a34a" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Crop Categories */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Available Crop Types</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cropCategories.map((crop, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4"
            >
              <img
                src={crop.image}
                alt={crop.name}
                className="h-40 w-full object-cover rounded-xl mb-4"
              />
              <h3 className="text-lg font-bold text-green-700">{crop.name}</h3>
              <p className="text-gray-600 text-sm mt-2">{crop.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Insights */}
      <section className="mt-10 bg-green-50 p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-3">AI Insights 🌾</h2>
        <p className="text-gray-700">
          Based on your region and crop selection, we suggest focusing on{" "}
          <span className="font-bold text-green-700">Rice and Sugarcane</span>{" "}
          this season due to favorable climate conditions.
        </p>
      </section>
    </div>
  );
}
