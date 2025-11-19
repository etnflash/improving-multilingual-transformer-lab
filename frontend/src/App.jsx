import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import PatternLearning from './modules/PatternLearning'
import SentenceCorrection from './modules/SentenceCorrection'
import DialogSimulation from './modules/DialogSimulation'
import TransformerIntrospection from './modules/TransformerIntrospection'
import languagesData from './data/languages.json'
import './App.css'

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const languages = Object.values(languagesData)

  return (
    <Router>
      <div className="app">
        <Header 
          languages={languages}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        
        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/patterns">Pattern Learning</Link>
          <Link to="/correction">Sentence Correction</Link>
          <Link to="/dialogs">Dialog Simulation</Link>
          <Link to="/introspection">Transformer Introspection</Link>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/patterns" 
              element={<PatternLearning language={languagesData[selectedLanguage]} />} 
            />
            <Route 
              path="/correction" 
              element={<SentenceCorrection language={languagesData[selectedLanguage]} />} 
            />
            <Route 
              path="/dialogs" 
              element={<DialogSimulation language={languagesData[selectedLanguage]} />} 
            />
            <Route 
              path="/introspection" 
              element={<TransformerIntrospection />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
