import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import AgriSenseDashboard from "./pages/AgriSenseDashboard";
import FarmerAuthPage from "./pages/FarmerAuthPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<FarmerAuthPage />} />
        <Route path="/dashboard" element={<AgriSenseDashboard/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
