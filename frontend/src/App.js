// import Board from "./../components/Board";
// import Toolbar from "./../components/Toolbar";
// import BoardProvider from "./../store/BoardProvider"
// import ToolboxProvider from "./../store/ToolboxProvider"
// import Toolbox from "./../components/Toolbox";

// function App() {
//   return (
//     <>
//       <BoardProvider>
//         <ToolboxProvider>
//           <Board />
//           <Toolbar />
//           <Toolbox />
//         </ToolboxProvider>
//       </BoardProvider>
//     </>
//   )
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import CanvasPage from './pages/CanvasPage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/" element={<LandingPage />}/>
                <Route path="/canvas/:id" element={<CanvasPage />} />
            </Routes>
        </Router>
    );
};

export default App;