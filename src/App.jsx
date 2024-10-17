import './App.css';
import { Scatterplot, generateFakeWebMetrics } from './scatterplot';
const data = generateFakeWebMetrics('2023-01-01', '2023-03-15');

function App() {
  return (
    <div className="App">
      <Scatterplot data={data} />
    </div>
  );
}

export default App;
