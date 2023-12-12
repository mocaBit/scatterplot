import './App.css';
import { Scatterplot, generateFakeWebMetrics } from './Scatterplot';

function App() {
  return (
    <div className="App">
      <Scatterplot data={generateFakeWebMetrics('2023-01-01', '2023-12-31', 150)} />
    </div>
  );
}

export default App;
