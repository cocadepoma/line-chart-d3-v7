/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react'
import * as d3 from "d3";
import { useEffect, useLayoutEffect } from 'react';

export const Line = ({ data }) => {
  const [parsedData, setParsedData] = useState({});
  const [formData, setFormData] = useState({
    coin: 'bitcoin',
    var: 'price_usd'
  });

  const parseTime = d3.timeParse("%d/%m/%Y");
  const formatDate = d3.timeFormat("%d-%b");

  useEffect(() => {
    if (!data) return;
    // time parser for x-scale

    Object.keys(data).forEach(id => {
      data[id] = data[id]
        .filter(d => (d['24h_vol'] && d['market_cap'] && d['price_usd'] && d['date']))
        .map(d => {
          d['24h_vol'] = Number(d['24h_vol']);
          d['market_cap'] = Number(d['market_cap']);
          d['price_usd'] = Number(d['price_usd']);
          d['date'] = parseTime(d['date']);
          return d
        })
    });
    setParsedData(data);
  }, [data]);

  useLayoutEffect(() => {
    if (!Object.keys(parsedData).length) return;

    createGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedData, formData]);

  // fix for format values
  const formatSi = d3.format(".2s")
  function formatAbbreviation(x) {
    const s = formatSi(x)
    switch (s[s.length - 1]) {
      case "G": return s.slice(0, -1) + "B" // billions
      case "k": return s.slice(0, -1) + "K" // thousands
    }
    return s
  }
  const MARGIN = { LEFT: 100, RIGHT: 100, TOP: 50, BOTTOM: 100 }
  const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
  const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM


  const createGraph = () => {
    // clear old tooltips
    d3.select(".focus").remove()
    d3.select(".overlay").remove()
    d3.select('.x-axisLabel').remove()
    d3.select('.y-axisLabel').remove()

    const svg = d3.select("#svg-area")
      .attr("viewBox", [
        0,
        0,
        WIDTH + MARGIN.LEFT + MARGIN.RIGHT,
        HEIGHT + MARGIN.TOP + MARGIN.BOTTOM
      ]);

    const g = d3.select("#g-area")
      .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

    const t = d3.transition().duration(1000);

    // for tooltip
    const bisectDate = d3.bisector(d => d.date).left

    // add svg are to draw the line
    const svgPath = g.append("svg")
      .attr("class", "line-svg")
      .style("overflow", "hidden")
      .attr("width", WIDTH)
      .attr("height", HEIGHT);

    // add line to svg area
    const path = d3.select('.line').node()
      ? d3.select('.line')
      : svgPath
        .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", "3px")

    // x axis label
    g.append("text")
      .attr("class", "x-axisLabel")
      .attr("y", HEIGHT + 50)
      .attr("x", WIDTH / 2)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Time")

    // y axis label
    const yLabel = g.append("text")
      .attr("class", "y-axisLabel")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -170)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Price ($)")

    // scales
    const x = d3.scaleTime().range([0, WIDTH])
    const y = d3.scaleLinear().range([HEIGHT, 0])

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
        .attr("transform", `translate(0, ${HEIGHT})`);

    // y axis ticks, will not create them if y-axis alrdy exists
    const yAxis = d3.select('.y-axis').node()
      ? d3.select('.y-axis')
      : g.append("g")
        .attr("class", "y-axis")

    const dataTimeFiltered = parsedData[formData.coin]

    // update scales
    x.domain(d3.extent(dataTimeFiltered, d => d.date))
    y.domain([
      d3.min(dataTimeFiltered, d => d[formData.var]) / 1.005,
      d3.max(dataTimeFiltered, d => d[formData.var]) * 1.005
    ])

    // update axes
    xAxisCall.scale(x)
    xAxis.transition(t).call(xAxisCall)
    yAxisCall.scale(y)
    yAxis.transition(t).call(yAxisCall.tickFormat(formatAbbreviation))

    /******************************** Tooltip Code ********************************/
    const focus = g.append("g")
      .attr("class", "focus")
      .style("display", "none")

    focus.append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", HEIGHT)

    focus.append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("x1", 0)
      .attr("x2", WIDTH)

    focus.append("circle")
      .attr("r", 3.5)

    focus.append("text")
      .attr("x", 15)
      .attr("dy", ".31em")

    g.append("rect")
      .attr("class", "overlay")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .style("fill", "transparent")
      .on("mouseover", () => focus.style("display", null))
      .on("mouseout", () => focus.style("display", "none"))
      .on("mousemove", mousemove)

    function mousemove(event) {
      const currentZoom = d3.zoomTransform(this)
      const zoomedX = currentZoom.rescaleX(x)
      const zoomedY = currentZoom.rescaleY(y)

      const x0 = zoomedX.invert(d3.pointer(event, this)[0])
      const i = bisectDate(dataTimeFiltered, x0, 1)
      const d0 = dataTimeFiltered[i - 1]
      const d1 = dataTimeFiltered[i]
      const d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      const xPoint = zoomedX(d.date);
      const yPoint = zoomedY(d[formData.var]);

      focus.attr("transform", `translate(${xPoint}, ${yPoint})`)
      focus.select("text").text(d[formData.var] + " $")
      focus.select(".x-hover-line").attr("y2", HEIGHT - yPoint)
      focus.select(".y-hover-line").attr("x2", -xPoint)
    }

    /******************************** Tooltip Code ********************************/

    const line = (linedata, x, y) => {
      const line = d3
        .line()
        .x((d, i) => x(d.date))
        .y(d => y(d[formData.var]))(linedata)

      return line;
    }

    // Update our line path
    g.select(".line")
      .transition(t)
      .attr("d", line(dataTimeFiltered, x, y))

    // Update y-axis label
    const newText = (formData.var === "price_usd")
      ? "Price ($)"
      : (formData.var === "market_cap")
        ? "Market Capitalization ($)"
        : "24 Hour Trading Volume ($)"
    yLabel.text(newText)


    // ZOOM //
    const zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [WIDTH, HEIGHT]])
      .extent([[0, 0], [WIDTH, HEIGHT]])
      .on("zoom", zoomed);


    function zoomed({ transform }) {
      const newX = transform.rescaleX(x);
      const newY = transform.rescaleY(y);

      path.attr("d", d => line(dataTimeFiltered, newX, newY));

      xAxis.call(xAxisCall.scale(newX))
      yAxis.call(yAxisCall.scale(newY))
    }

    d3.select('.overlay').call(zoom)
    // .transition()
    // .duration(100)
    // .call(zoom.scaleTo, 1, [x(Date.UTC(2012, 1, 1)), 0]);
  };

  const onSelectChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  };

  return (
    <>
      <select
        id="coin-select"
        className="form-control"
        onChange={onSelectChange}
        name="coin"
        value={formData.coin}
      >
        <option value="bitcoin">Bitcoin</option>
        <option value="ethereum">Ethereum</option>
        <option value="bitcoin_cash">Bitcoin Cash</option>
        <option value="litecoin">Litecoin</option>
        <option value="ripple">Ripple</option>
      </select>
      <select
        id="var-select"
        className="form-control"
        onChange={onSelectChange}
        name="var"
        value={formData.var}
      >
        <option value="price_usd">Price in dollars</option>
        <option value="market_cap">Market capitalization</option>
        <option value="24h_vol">24 hour trading volume</option>
      </select>

      <div id="chart-area">
        <svg id="svg-area">
          <g id="g-area" />
        </svg>
      </div>
    </>
  )
}