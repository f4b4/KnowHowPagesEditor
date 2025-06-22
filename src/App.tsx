import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Tree from './components/Tree'
import './App.css'

// Sample tree data for demonstration
const sampleTreeData = [
  {
    id: '1',
    label: 'Pages',
    isExpanded: true,
    children: [
      {
        id: '1-1',
        label: 'Home',
        children: [
          { id: '1-1-1', label: 'Introduction' },
          { id: '1-1-2', label: 'Getting Started' }
        ]
      },
      {
        id: '1-2',
        label: 'Documentation',
        isExpanded: true,
        children: [
          { id: '1-2-1', label: 'API Reference' },
          { id: '1-2-2', label: 'Examples' }
        ]
      }
    ]
  },
  {
    id: '2',
    label: 'Templates',
    children: [
      { id: '2-1', label: 'Basic Template' },
      { id: '2-2', label: 'Advanced Template' }
    ]
  },
  {
    id: '3',
    label: 'Assets',
    children: [
      { id: '3-1', label: 'Images' },
      { id: '3-2', label: 'Documents' }
    ]
  }
]

function App() {
  const [count, setCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string>('')

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

  const handleNodeSelect = (node: any) => {
    setSelectedNode(node.label)
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <Tree data={sampleTreeData} onNodeSelect={handleNodeSelect} />
      </aside>
      <main className="main-content">
        <div className="content-header">
          <div>
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>KnowHow Pages Editor</h1>
        </div>
        
        <div className="content-body">
          {selectedNode && (
            <div className="selected-info">
              <p>Selected: <strong>{selectedNode}</strong></p>
            </div>
          )}
          
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
        </div>
      </main>
    </div>
  )
}

export default App
