import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import FarmerDashboard from "./pages/dashboard"
import FarmerAuthPage from "./pages/FarmerAuthPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<FarmerAuthPage />} />
        <Route path="/dashboard" element={<FarmerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
