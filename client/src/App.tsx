import { Route, Routes } from 'react-router-dom';
import { NavBar } from './components/navbar';
import './css/index.css';
import { Home } from './pages/home';
import { Login } from './pages/login';

function App() {
	return (
		<>
			<NavBar title="Home Page"></NavBar>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/scanner" element={<Login />} />
				<Route path="/login" element={<Login />} />
			</Routes>
		</>
	)
}

export default App
