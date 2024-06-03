import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const StackedBarChart = ({ data, stackOrder }) => {
  const svgRef = useRef();
  const [selectedItem, setSelectedItem] = useState(null);
  const height = 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 150 };
  const width = 800 - margin.left - margin.right;

  const handleClick = (item) => {
    setSelectedItem(item);
  };

  const handleBackClick = () => {
    setSelectedItem(null);
  };

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (selectedItem) {
      // Hide the background chart
      svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 800)
        .attr("height", 400)

      // 파이 차트를 위한 설정
      const radius = Math.min(width, height) / 2 - 30;
      const arc = d3.arc().innerRadius(0).outerRadius(radius);

      const pie = d3.pie().value(d => d.value).sort(null);

      const pieData = pie([
        { name: selectedItem.항목, value: selectedItem.비율 },
        { name: "Other", value: 100 - selectedItem.비율 }
      ]);

      const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

      g.selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => (i === 0 ? "red" : "rgba(255, 0, 0, 0.2)"))
        .on("click", handleBackClick);

      g.selectAll("text")
        .data(pieData)
        .enter()
        .append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .text(d => `${d.data.name}: ${d.data.value}%`);

      svg.append("text")
        .attr("x", 15)
        .attr("y", 35)
        .attr("dy", "-0.5em")
        .attr("text-anchor", "start")
        .attr("fill", "#ffffff")
        .style("cursor", "pointer")
        .text("Back")
        .on("click", handleBackClick);

    } else {
      const y = d3.scaleBand()
        .domain(data.map(d => d.항목))
        .range([margin.top, height - margin.bottom])
        .padding(0.1);

      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.총)]).nice()
        .range([margin.left, width - margin.right]);

      const color = d3.scaleOrdinal()
        .domain(["남", "여"])
        .range(["#1f77b4", "#ff7f0e"]);

      const series = d3.stack().keys(stackOrder === 'male-first' ? ["남", "여"] : ["여", "남"])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone)(data);

      svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("y", d => y(d.data.항목))
        .attr("x", d => x(d[0]))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d[1]) - x(d[0]))
        .on("click", (event, d) => handleClick(d.data));

      svg.append("g")
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("x", margin.left - 10)
        .attr("y", d => y(d.항목) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("fill", "#ffffff")
        .text(d => d.항목);

      svg.append("g")
        .call(d3.axisBottom(x)
          .ticks(5)
          .tickFormat(d3.format(",.0f"))
          .tickSizeOuter(0))
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .selectAll("text")
        .attr("fill", "#ffffff");
    }
  }, [data, stackOrder, selectedItem, margin.bottom, margin.left, margin.right, margin.top, width]);

  return (
    <svg ref={svgRef} width={800} height={400}></svg>
  );
};

export default StackedBarChart;
