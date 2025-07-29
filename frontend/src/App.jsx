import Insert from './components/insert';
import Admin from './components/home';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Admin/>}></Route>
        <Route path="/users" element={<Insert/>}></Route>
      </Routes>
    </Router>
    </>
  );
}

export default App;