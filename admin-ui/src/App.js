import { BrowserRouter,Routes,Route, Navigate,} from "react-router-dom";
import Admin from './admin/Admin';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useMetrics } from '@cabify/prom-react';

function App() {
  const { observe } = useMetrics();
  observe('user_visits', { custom_tag: 'user_visits' }, 1);
  return (
    <BrowserRouter>
    <div className="App">
      <Routes>
        <Route path="/health" element={<h1> The App is Healthy </h1>} />
        <Route path='/admin' element={<Admin/>} />
        <Route path="/" element={<Navigate replace to="/admin" />} />
      </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;
