import * as d3 from "d3";
import { useEffect, useState } from "react";
import { FormSelectors } from "./FormSelectors";
import { Line } from './Line';

const options = {
  margin: { left: 100, right: 100, top: 50, bottom: 100 },
  size: { width: 1000, height: 400 },
  labelsPositions: { xAxis: { x: 0, y: -10 }, yAxis: { x: 10, y: 20 } },
  labelsText: { xAxis: "year", yAxis: "value ($)" },
  labelsClasses: { xAxis: "x-axisLabel", yAxis: "y-axisLabel" },
  tooltipContainer: { width: 120, height: 40, x: -60, y: -50 },
  tooltipTextPositions: { xAxis: { x: -53, y: -35 }, yAxis: { x: -53, y: -19 } },
  tooltipTextsLabels: { xBefore: "Date: ", xAfter: "", yBefore: "Value:  ", yAfter: " ($)" },
  lineClass: "line2",
  zoomEnabled: true,
  tooltipEnabled: true,
  xDateScale: true,
};

// const parseTime = d3.timeParse("%Y");
const parseTime = d3.timeParse("%d/%m/%Y");

function App() {
  const [data, setData] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [formData, setFormData] = useState({
    coin: 'bitcoin',
    var: 'price_usd',
    minDate: new Date().toISOString().slice(0, 10),
    maxDate: new Date().toISOString().slice(0, 10)
  });

  const [availableDates, setAvailableDates] = useState({});
  useEffect(() => {
    // d3.json("./data/example.json").then(data => {

    d3.json("./data/coins.json").then(data => {
      if (!data) return;
      const dataCopy = JSON.parse(JSON.stringify(data));

      Object.keys(dataCopy).forEach(id => {
        dataCopy[id] = dataCopy[id]
          .filter(d => (d['24h_vol'] && d['market_cap'] && d['price_usd'] && d['date']))
          .map(d => {
            d['24h_vol'] = Number(d['24h_vol']);
            d['market_cap'] = Number(d['market_cap']);
            d['price_usd'] = Number(d['price_usd']);
            d['date'] = parseTime(d['date']);
            return d
          })
      });

      setData(dataCopy);
      setParsedData(dataCopy);
      getAvailableDates(dataCopy);

      // dataCopy.map(row => {
      //   row.year = Number(row.year);
      //   row.value = Number(row.value);
      // })

      // setData(dataCopy);
      // setParsedData(dataCopy);
    })
    return () => undefined;
  }, []);

  const getAvailableDates = (data) => {
    const dates = {};
    Object.keys(data).forEach(coin => {
      dates[coin] = data[coin].map(d => d['date']);
    })

    setAvailableDates(dates);

    setFormData({
      ...formData,
      ...(dates[formData.coin].at(0) && { minDate: new Date(dates[formData.coin].at(0)).toISOString().slice(0, 10) }),
      ...(dates[formData.coin].at(0) && { maxDate: new Date(dates[formData.coin].at(-1)).toISOString().slice(0, 10) })
    })
  };

  const updateData = () => {
    const coinData = data[formData.coin];
    const dataTimeFiltered = coinData
      .filter(d =>
        new Date(d['date']).getTime() >= new Date(formData.minDate)
        && new Date(d['date']) <= new Date(formData.maxDate));

    setParsedData({
      ...parsedData,
      [formData.coin]: dataTimeFiltered
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>D3 Line</h1>

        <FormSelectors
          updateData={updateData}
          options={options}
          formData={formData}
          setFormData={setFormData}
          availableDates={availableDates}
        />
        {/* <div style={{
          maxWidth: '60rem'
        }}> */}
        {parsedData && <Line
          data={parsedData[formData.coin]}
          options={options}
          availableDates={availableDates}
          formData={formData}
          setFormData={setFormData}
          xKey="date"
          yKey={formData.var}

        // xKey="year"
        // yKey={"value"}
        />
        }
        {/* </div> */}
      </header>
    </div>
  );
}

export default App;
