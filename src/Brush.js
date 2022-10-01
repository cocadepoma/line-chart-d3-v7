import * as d3 from "d3";

export const loadBrush = ({ data, SIZE, x, y, xKey, yKey, xAxis, yAxis, yAxisCall, path, line }) => {
  const g = d3.select("#g-area");

  const brush = d3.brush()
    .extent([[0, 0], [SIZE.width, SIZE.height]])
    .on("end", updateChart)

  const brushElement = d3.select('.brush').node()
    ? d3.select('.brush')
    : g.append("g")
      .attr("class", "brush")
      .call(brush);

  let idleTimeout
  function idled() { idleTimeout = null; }

  function updateChart(event) {
    const extent = event.selection;

    if (!extent) {
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
      x.domain(d3.extent(data, d => d[xKey]))
      y.domain([
        d3.min(data, d => d[yKey]) / 1.005,
        d3.max(data, d => d[yKey]) * 1.005
      ])
    } else {
      x.domain([x.invert(extent[0][0]), x.invert(extent[1][0])])
      y.domain([y.invert(extent[1][1]), y.invert(extent[0][1])])
      brushElement.call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
    }

    // Update axis and circle position
    xAxis.transition().duration(1000).call(d3.axisBottom(x))
    yAxis.transition().duration(1000).call(yAxisCall.ticks(6))

    // Update line
    path
      .transition()
      .duration(1000)
      .attr("d", d => line(data, x, y));
  }
}