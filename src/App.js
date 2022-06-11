import * as d3 from "d3";
import { useEffect, useState } from "react";
import { Line } from './Line';

function App() {
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    d3.json("./data/coins.json").then(data => {
      setParsedData(data);
    })
    return () => undefined;
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>D3 Line</h1>
        {parsedData && <Line data={parsedData} />}
      </header>
    </div>
  );
}

export default App;
