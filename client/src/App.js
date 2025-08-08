import './App.css';

import { Route, Routes } from 'react-router-dom';
import Home from './components/home';
import Editor from './components/editor';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
    <Toaster position='bottom-right' ></Toaster>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/editor/:roomId" element={<Editor />}/>
      </Routes>
    </>
  );
}

export default App;
