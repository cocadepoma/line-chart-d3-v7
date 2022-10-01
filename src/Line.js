/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'
import * as d3 from "d3";
import { useLayoutEffect } from 'react';
import { loadZoom } from './Zoom';
import { loadTooltip } from './Tooltip';
import { loadBrush } from './Brush';

export const Line = ({ data, options, xKey, yKey }) => {
  const {
    margin,
    size,
    labelsPositions,
    labelsText,
    labelsClasses,
    tooltipEnabled,
    isZoomEnabled,
    isZoomFreeModeEnabled,
    xDateScale,
    lineClass = 'line',
    tooltipContainer,
    tooltipTextPositions,
    tooltipTextsLabels,
  } = options;

  const MARGIN = {
    ...(margin?.left ? { left: margin.left } : { left: 100 }),
    ...(margin?.right ? { right: margin.right } : { right: 100 }),
    ...(margin?.top ? { top: margin.top } : { top: 50 }),
    ...(margin?.bottom ? { bottom: margin.bottom } : { bottom: 100 }),
  };

  const SIZE = {
    ...(size?.width ? { width: size.width - MARGIN.left - MARGIN.right } : { width: 1200 - MARGIN.left - MARGIN.right }),
    ...(size?.height ? { height: size.height - MARGIN.top - MARGIN.bottom } : { height: 300 - MARGIN.top - MARGIN.bottom }),
  };

  const LABELS_POSITIONS = {
    xAxis: {
      ...(labelsPositions?.xAxis?.x ? { x: SIZE.width / 2 - labelsPositions.xAxis.x } : { x: SIZE.width / 2 }),
      ...(labelsPositions?.xAxis?.y ? { y: SIZE.height + 50 - labelsPositions.xAxis.y } : { y: SIZE.height + 50 }),
    },
    yAxis: {
      ...(labelsPositions?.yAxis?.x ? { x: labelsPositions.yAxis.x - 140 } : { x: -170 }),
      ...(labelsPositions?.yAxis?.y ? { y: labelsPositions.yAxis.y - 70 } : { y: -60 }),
    }
  };

  const LABELS_TEXT = {
    xAxis: labelsText?.xAxis || '',
    yAxis: labelsText?.yAxis || '',
  };

  const LABELS_CLASSES = {
    xAxis: labelsClasses?.xAxis || 'x-axisLabel',
    yAxis: labelsClasses?.yAxis || 'y-axisLabel',
  };


  useLayoutEffect(() => {
    if (!data?.length) return;
    createGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      cleanTooltip();
      cleanLabels();
      cleanBrush();
    }
  }, [data, xKey, yKey, options]);


  // fix for format values
  const formatSi = d3.format(".2s")
  function formatAbbreviation(x) {
    const s = formatSi(x)
    switch (s[s.length - 1]) {
      case "G": return s.slice(0, -1) + "B" // billions
      case "k": return s.slice(0, -1) + "K" // thousands
      default: return s
    }
  };

  const line = (linedata, x, y) => {
    const line = d3
      .line()
      .x((d, i) => x(d[xKey]))
      .y(d => y(d[yKey]))(linedata)

    return line;
  };

  const cleanTooltip = () => {
    d3.select(".focus-svg").remove()
    d3.select(".zoom-overlay").remove()
    d3.select(".tooltip-overlay").remove()
  };

  const cleanLabels = () => {
    d3.select('.x-axisLabel').remove()
    d3.select('.y-axisLabel').remove()
  };

  const cleanBrush = () => {
    d3.select('.brush').remove()
  };

  const createGraph = () => {
    const resetLine = () => {
      const t2 = d3.transition().duration(1000);
      g.select(".line")
        .transition(t2)
        .attr("d", line(data, x, y))

      yAxis.transition(t2).call(yAxisCall)
    }

    const svg = d3.select("#svg-area")
      .attr("viewBox", [
        0,
        0,
        SIZE.width + MARGIN.left + MARGIN.right,
        SIZE.height + MARGIN.top + MARGIN.bottom
      ])
      .on("dblclick", resetLine)


    const g = d3.select("#g-area").node()
      ? d3.select("#g-area")
      : svg.append("g")
        .attr("id", "g-area")
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)

    const t = d3.transition().duration(1000);

    //*******  SVG + LINE  *********//
    // add svg area to draw the line
    const svgPath = d3.select('.line-svg').node()
      ? d3.select('.line-svg')
      : g.append("svg")
        .attr("class", "line-svg")
        .style("overflow", "hidden")
        .attr("width", SIZE.width)
        .attr("height", SIZE.height);

    // add line to svg area
    const path = d3.select('.line').node()
      ? d3.select('.line')
      : svgPath
        .append("path")
        .attr("class", `line ${lineClass}`)
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", "1px");
    //*******  SVG + LINE  *********//

    //*******  LABELS  *********//
    // x axis label
    g.append("text")
      .attr("class", LABELS_CLASSES.xAxis)
      .attr("y", LABELS_POSITIONS.xAxis.y)
      .attr("x", LABELS_POSITIONS.xAxis.x)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text(LABELS_TEXT.xAxis)

    // y axis label
    g.append("text")
      .attr("class", LABELS_CLASSES.yAxis)
      .attr("transform", "rotate(-90)")
      .attr("y", LABELS_POSITIONS.yAxis.y)
      .attr("x", LABELS_POSITIONS.yAxis.x)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text(LABELS_TEXT.yAxis)

    //*******  LABELS *********//
    // scales
    const x = xDateScale
      ? d3.scaleTime().range([0, SIZE.width])
      : d3.scaleLinear().range([0, SIZE.width])

    const y = d3.scaleLinear().range([SIZE.height, 0]);

    // axis generators
    const xAxisCall = d3.axisBottom()
    const yAxisCall = d3.axisLeft()
      .ticks(6)
      .tickFormat(d => `${parseInt(d / 1000)}k`)

    // x axis ticks, will not create them if x-axis alrdy exists
    const xAxis = d3.select('.x-axis').node()
      ? d3.select('.x-axis')
      : g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${SIZE.height})`);

    // y axis ticks, will not create them if y-axis alrdy exists
    const yAxis = d3.select('.y-axis').node()
      ? d3.select('.y-axis')
      : g.append("g")
        .attr("class", "y-axis")

    // update scales
    x.domain(d3.extent(data, d => d[xKey]))
    y.domain([
      d3.min(data, d => d[yKey]) / 1.005,
      d3.max(data, d => d[yKey]) * 1.005
    ])

    // update axes
    xAxisCall.scale(x)
    xAxis.transition(t).call(xAxisCall)
    yAxisCall.scale(y)
    yAxis.transition(t).call(yAxisCall.tickFormat(formatAbbreviation))

    /******************************** Zoom Code ********************************/
    if (isZoomEnabled) {
      if (isZoomFreeModeEnabled) {
        loadZoom({ SIZE, path, x, y, xAxis, yAxis, line, data, xAxisCall, yAxisCall });
      } else {
        loadBrush({ data, SIZE, x, y, xKey, yKey, xAxis, yAxis, yAxisCall, path, line, g });
      }
    }

    /******************************** Tooltip Code ********************************/
    loadTooltip({
      SIZE,
      xKey,
      yKey,
      data,
      x,
      y,
      tooltipEnabled,
      tooltipContainer,
      tooltipTextPositions,
      tooltipTextsLabels,
      path, xAxis, yAxis, line, xAxisCall, yAxisCall
    });

    // const focusSvg = d3.select('.tooltip-overlay').node()
    //   ? d3.select('.tooltip-overlay')
    //   : g.append("rect")
    //     .attr("class", "tooltip-overlay")
    //     .attr("width", SIZE.width)
    //     .attr("height", SIZE.height)
    //     .style("fill", "transparent")
    //     .on("mouseover", mousemove)
    //     .on("mouseout", () => {
    //       focusSvg.transition().duration(20).style("opacity", 0)
    //     })
    //     .on("mousemove", mousemove)

    // focusSvg.append("circle")
    //   .attr("r", 3.5)

    // function mousemove(event) {
    //   console.log(event)
    //   const bisectDate = d3.bisector(d => d[xKey]).left

    //   const currentZoom = d3.zoomTransform(this)
    //   const zoomedX = currentZoom.rescaleX(x)
    //   const zoomedY = currentZoom.rescaleY(y)

    //   const x0 = zoomedX.invert(d3.pointer(event, this)[0])
    //   const i = bisectDate(data, x0, 1)
    //   const d0 = i !== data.length ? data[i - 1] : data[i - 2]
    //   const d1 = i !== data.length ? data[i] : data[i - 1]

    //   const d = x0 - d0[xKey] > d1[xKey] - x0 ? d1 : d0;

    //   const xPoint = zoomedX(d[xKey]);
    //   const yPoint = zoomedY(d[yKey]);

    //   focusSvg.transition()
    //     .duration(30)
    //     .style("opacity", 1)
    //     .attr("transform", `translate(${xPoint}, ${yPoint})`)
    //   focusSvg.select(".tooltip-text-x").text(tooltipTextsLabels.yBefore + d[yKey] + tooltipTextsLabels.yAfter);
    //   focusSvg.select(".tooltip-text-y").text('Date: ' + new Date(d[xKey]).toLocaleDateString());
    //   focusSvg.select(".x-hover-line").attr("y2", SIZE.height - yPoint)
    //   focusSvg.select(".y-hover-line").attr("x2", -xPoint)
    // }




    // const focusSvg = d3.select('.focus-svg').node()
    //   ? d3.select('.focus-svg')
    //   : g.append("g")
    //     .attr("class", "focus-svg")
    //     .style("overflow", "hidden")
    //     .attr("width", SIZE.width + 150)
    //     .attr("height", SIZE.height)
    //     .append("g")
    //     .attr("class", "focus")




    // focusSvg.append("rect")
    //   .attr("class", "tooltip")
    //   .attr("width", SIZE.width)
    //   .attr("height", SIZE.height)
    //   .style("fill", "transparent")
    //   .on("mouseover", mousemove)
    //   .on("mouseout", () => {
    //     focusSvg.transition().duration(20).style("opacity", 0)
    //   })
    //   .on("mousemove", mousemove)

    // focusSvg.append("circle")
    //   .attr("r", 3.5)
    //   .attr("class", "focus")

    // const bisectDate = d3.bisector(d => d[xKey]).left

    // function mousemove(event) {
    //   console.log(event)
    //   const currentZoom = d3.zoomTransform(this)
    //   const zoomedX = currentZoom.rescaleX(x)
    //   const zoomedY = currentZoom.rescaleY(y)

    //   const x0 = zoomedX.invert(d3.pointer(event, this)[0])
    //   const i = bisectDate(data, x0, 1)
    //   const d0 = i !== data.length ? data[i - 1] : data[i - 2]
    //   const d1 = i !== data.length ? data[i] : data[i - 1]

    //   const d = x0 - d0[xKey] > d1[xKey] - x0 ? d1 : d0;

    //   const xPoint = zoomedX(d[xKey]);
    //   const yPoint = zoomedY(d[yKey]);

    //   focusSvg.transition()
    //     .duration(30)
    //     .style("opacity", 1)
    //     .attr("transform", `translate(${xPoint}, ${yPoint})`);

    //   focusSvg.select(".tooltip-text-x").text(tooltipTextsLabels.yBefore + d[yKey] + tooltipTextsLabels.yAfter);
    //   focusSvg.select(".tooltip-text-y").text('Date: ' + new Date(d[xKey]).toLocaleDateString());
    //   focusSvg.select(".x-hover-line").attr("y2", SIZE.height - yPoint)
    //   focusSvg.select(".y-hover-line").attr("x2", -xPoint)
    // }

    // Update line path
    g.select(".line")
      .transition(t)
      .attr("d", line(data, x, y))
  };

  return (<svg id="svg-area" />);
};