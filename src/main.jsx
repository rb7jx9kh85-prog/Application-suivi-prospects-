import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  componentDidCatch(error) {
    this.setState({ error })
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:'40px',fontFamily:'monospace',background:'#fef2f2',minHeight:'100vh'}}>
          <h2 style={{color:'#dc2626',marginBottom:'16px'}}>Erreur de l'application</h2>
          <pre style={{color:'#991b1b',whiteSpace:'pre-wrap',wordBreak:'break-word',background:'#fff',padding:'20px',borderRadius:'8px',border:'1px solid #fecaca'}}>
            {this.state.error.toString()}
            {'\n\nStack:\n'}
            {this.state.error.stack}
          </pre>
          <button onClick={() => window.location.reload()} style={{marginTop:'16px',padding:'10px 20px',background:'#dc2626',color:'white',border:'none',borderRadius:'8px',cursor:'pointer'}}>
            Recharger
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HashRouter>
)
