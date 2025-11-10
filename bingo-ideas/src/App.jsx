
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TileGenerator from 'pages/TileGenerator';
import TileOrdering from 'pages/tileOrdering/TileOrdering';
import './App.css'

function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<TileGenerator />} />
          <Route path="/order" element={<TileOrdering />}/>
        </Routes>
      </Router>
  )
}

export default App
