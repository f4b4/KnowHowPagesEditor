import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const incrementCount = async () => {
    setError(null)
    try {
      const res = await fetch('/knowhow-api/count', { method: 'POST' })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setCount(data.count)
    } catch (err) {
      setError('Failed to update count')
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={incrementCount}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        {error && <p style={{color: 'red'}}>{error}</p>}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
