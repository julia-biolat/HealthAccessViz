import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import * as d3 from "d3";
import "./koreaMap.scss";
import { geoPath, geoMercator } from "d3-geo";
import SIDO_MAP_2022 from "./SIDO_MAP_2022.json"; // Adjust path as needed
import populationData from "./populationData.json"; // Adjust path as needed

const KoreaMap = () => {
    const svgRef = useRef();
    const [selectedRegion, setSelectedRegion] = useState(null);
  
    useEffect(() => {
      const svg = d3.select(svgRef.current);
      const width = 800;
      const height = 600;
  
      const projection = d3.geoMercator().scale(8000).translate([-2300, 2200]);
      const path = d3.geoPath().projection(projection);
  
      console.log("Loading GeoJSON data:", SIDO_MAP_2022);
  
      svg
        .selectAll("path")
        .data(SIDO_MAP_2022.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#ccc")
        .attr("stroke", "#333")
        .on("click", (event, d) => {
          console.log("Region clicked:", d.properties.CTP_ENG_NM);
          setSelectedRegion(d.properties.CTP_ENG_NM); // Use English name as the key
        });
    }, []);
  
    useEffect(() => {
      if (selectedRegion) {
        console.log("Selected Region:", selectedRegion);
  
        // Find the population data for the selected region
        const regionData = populationData.Sheet1.find(region => region.행정기관.trim() === selectedRegion);
        if (!regionData) {
          console.warn("No population data found for region:", selectedRegion);
          return;
        }
  
        console.log("Region Data:", regionData);
  
        // Assuming populationData has fields '남 인구수' and '여 인구수' for counts
        const genderData = [
          { gender: "Male", count: parseInt(regionData["남 인구수"].replace(/,/g, '')) },
          { gender: "Female", count: parseInt(regionData["여 인구수"].replace(/,/g, '')) },
        ];
  
        console.log("Gender Data:", genderData);
  
        const svg = d3.select("#barchart");
        svg.selectAll("*").remove(); // Clear previous chart
  
        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = 400 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
  
        const x = d3
          .scaleBand()
          .domain(genderData.map((d) => d.gender))
          .range([0, width])
          .padding(0.1);
  
        const y = d3.scaleLinear().domain([0, d3.max(genderData, (d) => d.count)]).nice().range([height, 0]);
  
        const chart = svg
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
  
        chart
          .append("g")
          .selectAll(".bar")
          .data(genderData)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", (d) => x(d.gender))
          .attr("y", (d) => {
            const yValue = y(d.count);
            console.log("y:", yValue); // Debugging y value
            return yValue;
          })
          .attr("width", x.bandwidth())
          .attr("height", (d) => {
            const barHeight = height - y(d.count);
            console.log("Height:", barHeight); // Debugging height
            return barHeight;
          })
          .attr("fill", "orange");
  
        chart.append("g").call(d3.axisLeft(y));
        chart
          .append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x));
      }
    }, [selectedRegion]);
  
    return (
      <div className="korea-map-container">
        <svg ref={svgRef} width={800} height={600}></svg>
        <svg id="barchart" width={400} height={300}></svg>
      </div>
    );
  };
  
  export default KoreaMap;