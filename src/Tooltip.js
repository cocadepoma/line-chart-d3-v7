import * as d3 from "d3";

export const loadTooltip = ({
  SIZE,
  xKey,
  yKey,
  data,
  x,
  y,
  tooltipEnabled,
  tooltipContainer = { width: 200, height: 200, x: 0, y: 0 },
  tooltipTextPositions = { xAxis: { x: -38, y: -35 }, yAxis: { x: -38, y: -35 } },
  tooltipTextsLabels = { xBefore: "", xAfter: "", yBefore: "", yAfter: "" },
}) => {
  const bisectDate = d3.bisector(d => d[xKey]).left
  const g = d3.select("#g-area");

  const focusSvg = d3.select('.focus-svg').node()
    ? d3.select('.focus-svg')
    : g.append("svg")
      .attr("class", "focus-svg")
      .style("overflow", "hidden")
      .attr("width", SIZE.width + 150)
      .attr("height", SIZE.height)
      .append("g")
      .attr("class", "focus")


  if (tooltipEnabled) {
    focusSvg.append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", SIZE.height)

    focusSvg.append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("x1", 0)
      .attr("x2", SIZE.width)

    focusSvg.append("circle")
      .attr("r", 3.5)

    focusSvg.append("rect")
      .attr("class", "tooltip")
      .attr("width", tooltipContainer.width)
      .attr("height", tooltipContainer.height)
      .attr("x", tooltipContainer.x)
      .attr("y", tooltipContainer.y)
      .style("fill", "black")
      .style("opacity", 0.7)

    focusSvg.append("polygon")
      .attr("class", "tooltip-arrow")
      .attr("points", "0,0 -6,6 6,6")
      .style("fill", "black")
      .style("opacity", 0.7)
      .attr("transform", ["rotate(180)", "translate(0, 4.15)"])

    focusSvg.append("text")
      .attr("class", "tooltip-text-x")
      .attr("x", tooltipTextPositions.xAxis.x)
      .attr("dy", tooltipTextPositions.xAxis.y)
      .style("font-size", "10px")
      .style("fill", "white")

    focusSvg.append("text")
      .attr("class", "tooltip-text-y")
      .attr("x", tooltipTextPositions.yAxis.x)
      .attr("dy", tooltipTextPositions.yAxis.y)
      .style("font-size", "10px")
      .style("fill", "white")
  }

  g.append("rect")
    .attr("class", "overlay")
    .attr("width", SIZE.width)
    .attr("height", SIZE.height)
    .style("fill", "transparent")
    .on("mouseover", mousemove)
    .on("mouseout", () => {
      focusSvg.transition().duration(20).style("opacity", 0)
    })
    .on("mousemove", mousemove)

  function mousemove(event) {
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

    focusSvg.transition()
      .duration(30)
      .style("opacity", 1)
      .attr("transform", `translate(${xPoint}, ${yPoint})`)
    focusSvg.select(".tooltip-text-x").text(tooltipTextsLabels.yBefore + d[yKey] + tooltipTextsLabels.yAfter);
    focusSvg.select(".tooltip-text-y").text('Date: ' + new Date(d[xKey]).toLocaleDateString());
    focusSvg.select(".x-hover-line").attr("y2", SIZE.height - yPoint)
    focusSvg.select(".y-hover-line").attr("x2", -xPoint)
  }
};