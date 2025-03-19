import { useState } from 'react'
import './css/index.css'

function App() {
	const [count, setCount] = useState(0)
	
	return (
		<>
			<h1>Event QR scanner app!</h1>
			<div onClick={() => setCount(count + 1)}>
				
			</div>
		</>
	)
}

export default App
