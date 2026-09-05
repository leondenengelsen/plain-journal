import { Routes, Route } from 'react-router-dom'
import EntryScreen from './EntryScreen.jsx'
import Timeline from './Timeline.jsx'
import './App.css'

function Settings() {
  return <p>Settings — coming soon</p>
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<EntryScreen />} />
        <Route path="/entry/:id" element={<EntryScreen />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}

export default App
