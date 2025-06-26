import { useState, useEffect } from 'react'
import Tree from './components/Tree'
import { useTreeData } from './hooks/useTreeData'
import Editor from '@monaco-editor/react'
import './App.css'

function App() {
  const [selectedNode, setSelectedNode] = useState<string>('')
  const [markdownContent, setMarkdownContent] = useState<string>('# Welcome to KnowHow Pages Editor\n\nStart editing your markdown content here...\n\n## Features\n- Syntax highlighting\n- Live preview\n- File management\n\n```javascript\nconsole.log("Hello, World!");\n```')
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false)
  const [selectedFilePath, setSelectedFilePath] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  // Use the tree data hook instead of sample data
  const { treeData, loading: treeLoading, error: treeError, refreshTree } = useTreeData()

  // Keyboard shortcut for saving (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault()
        if (selectedFilePath) {
          saveFileContent()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedFilePath, markdownContent])

  // Function to fetch file content
  const fetchFileContent = async (filePath: string) => {
    setIsLoadingContent(true)
    try {
      const response = await fetch(`/knowhow-api/file?path=${encodeURIComponent(filePath)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setMarkdownContent(data.content || '')
      setSelectedFilePath(filePath)
    } catch (error) {
      console.error('Error fetching file content:', error)
      setMarkdownContent(`# Error loading file\n\nFailed to load content for: ${filePath}\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoadingContent(false)
    }
  }

  const handleNodeSelect = (node: any) => {
    setSelectedNode(node.label)
    
    // If it's a file (not a directory), load its content
    if (node.type === 'file' && node.path) {
      fetchFileContent(node.path)
    }
  }

  // Function to save file content
  const saveFileContent = async () => {
    if (!selectedFilePath) {
      console.error('No file selected to save')
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      const response = await fetch('/knowhow-api/file', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: selectedFilePath,
          content: markdownContent
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000) // Clear success message after 3 seconds
    } catch (error) {
      console.error('Error saving file:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 5000) // Clear error message after 5 seconds
    } finally {
      setIsSaving(false)
    }
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
              {selectedFilePath && (
                <p style={{ fontSize: '0.9em', opacity: 0.8 }}>
                  Path: {selectedFilePath}
                </p>
              )}
            </div>
          )}
        </div>
          <div className="content-body">
          {isLoadingContent ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '70vh',
              color: 'var(--text-color, #cccccc)'
            }}>
              Loading file content...
            </div>
          ) : (
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
          )}
        </div>
        
        {/* Save Button */}
        {selectedFilePath && (
          <div className="save-button-container">
            <button
              className={`save-button ${saveStatus}`}
              onClick={saveFileContent}
              disabled={isSaving || !selectedFilePath}
            >
              {isSaving ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <span className="check-icon">✓</span>
                  Saved!
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <span className="error-icon">✗</span>
                  Error
                </>
              ) : (
                <>
                  <span className="save-icon">💾</span>
                  Save
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
