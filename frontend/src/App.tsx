import { useState, useEffect } from 'react'
import './App.css'
import { PolicyList, YearPolicy } from './components/PolicyList'
import MenuBar from './components/MenuBar'

function App() {
 
  const [policies, setPolicies] = useState<YearPolicy[]>([]);

  useEffect(() => {
    fetch('http://54.174.249.167:3000/policies/academic-year')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setPolicies(data.policies);
        }
      });
  }, []);

  return (
    <>
      <MenuBar />
      <div className="container mx-auto p-4">
        <PolicyList policies={policies} />
      </div>
      <footer className="bg-gray-800 text-white py-4">
        <p>&copy; 2024 Lin Lin Hlaing. All Rights Reserved.</p>
        <a 
          href="https://linlinhlaing.com/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-400 hover:text-blue-500 underline">Visit My Profile
        </a>
      </footer>

    </>
  )
}

export default App
