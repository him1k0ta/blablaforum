import React from 'react';
import { Route, Routes} from 'react-router-dom';

import Main from './pages/main';
import Auth from './pages/auth';
import Registration from './pages/registration';
import Threads from './pages/threads';
import Rules from './pages/rules';
import About from './pages/about';
import Create from './pages/create';
import AdminPanel from './pages/admin';
import ThreadPage from './pages/threadpage';
import Profile from './pages/profile';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Main/>}/>
            <Route path="/auth" element={<Auth/>}/>
            <Route path="/register" element={<Registration/>}/>
            <Route path="/threads" element={<Threads/>}/>
            <Route path="/rules" element={<Rules/>}/>
            <Route path="/about" element={<About/>}/>
            <Route path="/create" element={<Create/>}/>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/thread/:id" element={<ThreadPage />} />
            <Route path="/profile" element={<Profile />} />
        </Routes>
    );
};

export default AppRoutes;