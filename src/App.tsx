import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.tsx';
import DApp from './pages/DApp.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<DApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
