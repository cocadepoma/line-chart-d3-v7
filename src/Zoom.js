import * as d3 from "d3";

export const loadZoom = ({ SIZE, path, x, y, xAxis, yAxis, line, data, xAxisCall, yAxisCall }) => {
  const zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [SIZE.width, SIZE.height]])
    .extent([[0, 0], [SIZE.width, SIZE.height]])
    .on("start", startZoom)
    .on("zoom", zoomed)
    .on("end", endZoom);

  function startZoom() {
    d3.select('.focus').style("display", "none")
  };

  function endZoom() {
    d3.select('.focus').style("display", null)
  };

  function zoomed({ transform }) {
    const newX = transform.rescaleX(x);
    const newY = transform.rescaleY(y);

    path.attr("d", d => line(data, newX, newY));

    xAxis.call(xAxisCall.scale(newX))
    yAxis.call(yAxisCall.scale(newY))
  };

  d3.select('.overlay').call(zoom);
};