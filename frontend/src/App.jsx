import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import Header from './components/Header'
import Home from './components/Home'
import PatternLearning from './modules/PatternLearning'
import SentenceCorrection from './modules/SentenceCorrection'
import DialogSimulation from './modules/DialogSimulation'
import TransformerIntrospection from './modules/TransformerIntrospection'
import LabOverview from './pages/LabOverview'
import Appendix from './pages/Appendix'
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
          <NavLink to="/" end>Overview</NavLink>
          <NavLink to="/modules">Modules</NavLink>
          <NavLink to="/patterns">Pattern Learning</NavLink>
          <NavLink to="/correction">Sentence Correction</NavLink>
          <NavLink to="/dialogs">Dialog Simulation</NavLink>
          <NavLink to="/introspection">Transformer Introspection</NavLink>
          <NavLink to="/appendix">Appendix</NavLink>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<LabOverview />} />
            <Route path="/modules" element={<Home />} />
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
            <Route path="/appendix" element={<Appendix />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
