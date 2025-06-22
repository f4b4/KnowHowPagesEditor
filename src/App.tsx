import { useState } from 'react'
import Tree from './components/Tree'
import { useTreeData } from './hooks/useTreeData'
import Editor from '@monaco-editor/react'
import './App.css'

function App() {
  const [selectedNode, setSelectedNode] = useState<string>('')
  const [markdownContent, setMarkdownContent] = useState<string>('# Welcome to KnowHow Pages Editor\n\nStart editing your markdown content here...\n\n## Features\n- Syntax highlighting\n- Live preview\n- File management\n\n```javascript\nconsole.log("Hello, World!");\n```')
  
  // Use the tree data hook instead of sample data
  const { treeData, loading: treeLoading, error: treeError, refreshTree } = useTreeData()

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
      <main className="main-content">        <div className="content-header">
          <h1>KnowHow Pages Editor</h1>
          {selectedNode && (
            <div className="selected-info">
              <p>Editing: <strong>{selectedNode}</strong></p>
            </div>
          )}
        </div>
          <div className="content-body">
          <Editor
            height="70vh"
            defaultLanguage="markdown"
            value={markdownContent}
            onChange={(value) => setMarkdownContent(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              folding: true,
              foldingStrategy: 'indentation'
            }}
          />
        </div>
      </main>
    </div>
  )
}

export default App
