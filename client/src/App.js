import logo from './logo.svg';
import './App.css';
import Home from './Components/Home';
import Headers from './Components/Headers';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Error from './Components/Error';
import {Routes, Route} from 'react-router-dom';

function App() {
  return (
    <>
      <Headers /> {/*This is the header component and since it is wrapping the Routes, it will be displayed on every page.*/}
      <Routes>
        <Route path = '/' element={<Home />}/>
        <Route path = '/login' element={<Login />}/>
        <Route path = '/dashboard' element={<Dashboard />}/>
        <Route path = '*' element={<Error />}/>
      </Routes>
    </>
  );
}

export default App;
