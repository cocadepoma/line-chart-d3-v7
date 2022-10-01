import * as d3 from "d3";

export const loadZoom = ({ SIZE, path, x, y, xAxis, yAxis, line, data, xAxisCall, yAxisCall }) => {
  const g = d3.select("#g-area");

  g.append("rect")
    .attr("class", "zoom-overlay")
    .attr("width", SIZE.width)
    .attr("height", SIZE.height)
    .style("fill", "transparent")
    .style('cursor', 'move')

  const zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [SIZE.width, SIZE.height]])
    .extent([[0, 0], [SIZE.width, SIZE.height]])
    // .on("start", startZoom)
    .on("zoom", zoomed)
  // .on("end", endZoom);

  function zoomed({ transform }) {
    console.log('zoom')
    const newX = transform.rescaleX(x);
    const newY = transform.rescaleY(y);

    path.attr("d", d => line(data, newX, newY));
    xAxis.call(xAxisCall.scale(newX))
    yAxis.call(yAxisCall.scale(newY))
  };

  // function startZoom() {
  //   d3.select('.focus-svg')
  //     .style("opacity", 0)
  //     .attr("transform", `translate(${SIZE.width / 2}, ${SIZE.height + 100})`)
  // };

  // function endZoom() {
  //   setTimeout(() => {
  //     d3.select('.focus-svg')
  //       .style("opacity", 1)
  //   }, 300);
  // };

  d3.select('.zoom-overlay').call(zoom);
};