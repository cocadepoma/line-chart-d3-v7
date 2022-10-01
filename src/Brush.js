import * as d3 from "d3";

export const loadBrush = ({
  data,
  SIZE,
  x,
  y,
  xKey,
  yKey,
  xAxis,
  yAxis,
  yAxisCall,
  path,
  line,
  isTooltipEnabled,
}) => {
  const g = d3.select("#g-area");

  const brush = d3.brush()
    .extent([[0, 0], [SIZE.width, SIZE.height]])
    .on("end", updateChart)
    .on("start", cleanCircle);

  const brushElement = d3.select('.brush').node()
    ? d3.select('.brush')
    : g.append("g")
      .attr("class", "brush")
      .call(brush)
      .on("mousemove", isTooltipEnabled && mousemove)
      .on("mouseover", isTooltipEnabled && mousemove)
      .on("mouseout", isTooltipEnabled && cleanCircle)
      .on("click", click);

  let idleTimeout
  function idled() { idleTimeout = null; }

  function updateChart(event) {
    cleanCircle();
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

  function mousemove(event) {
    showCircle();
    const bisectDate = d3.bisector(d => d[xKey]).left;

    const pepe = d3.select('.circle-focus-container').node()
      ? d3.select('.circle-focus-container')
      : g.append("g")
        .style("overflow", "hidden")
        .attr("class", "circle-focus-container")
        .attr("width", SIZE.width + 150)
        .attr("height", SIZE.height)
        
    !d3.select('.circle-focus').node() &&(
      pepe.append("circle")
        .attr("r", 3.5)
        .attr("class", "circle-focus")
    )
    const currentZoom = d3.zoomTransform(this)
    const zoomedX = currentZoom.rescaleX(x)
    const zoomedY = currentZoom.rescaleY(y)

    const x0 = zoomedX.invert(d3.pointer(event, this)[0])
    const i = bisectDate(data, x0, 1)
    const d0 = i !== data.length ? data[i - 1] : data[i - 2]
    const d1 = i !== data.length ? data[i] : data[i - 1]

    const d = x0 - d0[xKey] > d1[xKey] - x0 ? d1 : d0;

    const xPoint = zoomedX(d[xKey]);
    const yPoint = zoomedY(d[yKey]);

    d3.select('.circle-focus-container')
      .transition()
      .duration(50)
      .style("opacity", 1)
      .attr("transform", `translate(${xPoint}, ${yPoint})`)
  }

  function click(event) {
    console.log(event);
  }

  function cleanCircle() {
    d3.select('.circle-focus-container')
      .style("opacity", 0)
  }

  function showCircle() {
    d3.select('.circle-focus-container')
      .style("opacity", 1)
  }
}