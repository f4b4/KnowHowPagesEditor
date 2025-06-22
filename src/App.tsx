import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Tree from './components/Tree'
import { useTreeData } from './hooks/useTreeData'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string>('')
  
  // Use the tree data hook instead of sample data
  const { treeData, loading: treeLoading, error: treeError, refreshTree } = useTreeData()

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
        {treeLoading ? (
          <div className="tree-container">
            <h3 className="tree-title">Navigation</h3>
            <div style={{ padding: '16px', color: 'var(--text-color, #cccccc)' }}>
              Loading content tree...
            </div>
          </div>
        ) : treeError ? (
          <div className="tree-container">
            <h3 className="tree-title">Navigation</h3>
            <div style={{ padding: '16px', color: 'var(--error-color, #ff6b6b)' }}>
              Error: {treeError}
              <br />
              <button 
                onClick={refreshTree}
                style={{ 
                  marginTop: '8px', 
                  padding: '4px 8px', 
                  backgroundColor: 'var(--button-bg, #0078d4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <Tree data={treeData} onNodeSelect={handleNodeSelect} />
        )}
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
