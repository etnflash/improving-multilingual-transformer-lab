import React from 'react'

function Header({ languages, selectedLanguage, onLanguageChange }) {
  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <h1 style={styles.title}>🌍 Multilingual Transformer Lab</h1>
        <div style={styles.languageSelector}>
          <label htmlFor="language" style={styles.label}>Language: </label>
          <select 
            id="language"
            value={selectedLanguage} 
            onChange={(e) => onLanguageChange(e.target.value)}
            style={styles.select}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}

const styles = {
  header: {
    backgroundColor: '#3498db',
    color: 'white',
    padding: '1.5rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold'
  },
  languageSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  label: {
    fontSize: '1rem'
  },
  select: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer'
  }
}

export default Header
