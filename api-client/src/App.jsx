import { useState } from 'react';
import CoursesExplorer   from './features/courses/CoursesExplorer';
import EnrolmentsViewer  from './features/enrolments/EnrolmentsViewer';
import UsersPanel        from './features/users/UsersPanel';

const TABS = [
  { id: 'courses',    label: 'Courses'    },
  { id: 'enrolments', label: 'Enrolments' },
  { id: 'users',      label: 'Users'      },
];

// Global JWT token state
const App = () => {
  const [token,     setToken]     = useState('');
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className="min-h-screen flex flex-col">

      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-white">MyEduConnect REST API Client</h1>
            <p className="text-xs text-gray-400 mt-0.5">Vulnerable-baseline build</p>
          </div>

          {/* JWT token input */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste JWT token here…"
              className="input-dark text-xs flex-1 sm:w-80 font-mono"
            />
            {token && (
              <button onClick={() => setToken('')} className="text-gray-500 hover:text-gray-300 text-sm">
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="border-b border-gray-800 bg-gray-900 px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        {activeTab === 'courses'    && <CoursesExplorer  token={token} />}
        {activeTab === 'enrolments' && <EnrolmentsViewer token={token} />}
        {activeTab === 'users'      && <UsersPanel       token={token} />}
      </main>

      <footer className="border-t border-gray-800 px-6 py-3 text-center text-xs text-gray-600">
        MyEduConnect Sdn Bhd — security research target · local use only
      </footer>
    </div>
  );
};

export default App;


