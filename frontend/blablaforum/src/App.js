import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './Router';
import CustomCursor from './cursor/CustomCursor';
import { AuthProvider } from './AuthContext';
import { ThreadsProvider } from './ThreadsContext'; // Добавляем импорт
import './App.css';
import { BrowserRouter } from 'react-router-dom';


function App() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <ThreadsProvider>
          <div className="app-container">
            <CustomCursor />
            
            <main className="app-content">
              <AppRoutes /> {/* Здесь уже должен быть BrowserRouter */}
            </main>
            
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </ThreadsProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}

export default App;