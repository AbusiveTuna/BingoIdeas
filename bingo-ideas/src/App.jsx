
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TileGenerator from 'pages/TileGenerator';
import './App.css'

function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<TileGenerator />} />
        </Routes>
      </Router>
  )
}

export default App
