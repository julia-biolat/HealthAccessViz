import { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./rankChangeChart.scss";

const RankChangeChart = ({ data, previousData }) => {
  const svgRef = useRef();
  const height = 400;
  const margin = { top: 0, right: 5, bottom: 5, left: 5 };
  const width = 250; // 박스의 너비를 설정

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.항목))
      .range([margin.top, height - margin.bottom])
      .padding(0.4); // 패딩 값을 줄여 박스 크기를 키웁니다.

    const g = svg.append("g").attr("transform", `translate(${margin.left},0)`);

    const previousRanks = previousData.reduce((acc, item, index) => {
      acc[item.항목] = index;
      return acc;
    }, {});

    const rankGroups = g.selectAll(".rank-group")
      .data(data, d => d.항목);

    const rankGroupsEnter = rankGroups.enter()
      .append("g")
      .attr("class", "rank-group")
      .attr("transform", d => {
        const previousRank = previousRanks[d.항목];
        if (previousRank !== undefined && previousRank < 15) {
          return `translate(0, ${yScale(data[previousRank].항목)})`;
        } else {
          return `translate(0, ${height})`;
        }
      });

    rankGroupsEnter.append("rect")
      .attr("class", "rank-box")
      .attr("x", 0)
      .attr("width", 220)
      .attr("height", yScale.bandwidth() + 2) // 박스 높이를 더 키웁니다.
      .attr("fill", "#333")
      .attr("stroke", "#fff")
      .attr("rx", 5)
      .attr("ry", 5);

    rankGroupsEnter.append("text")
      .attr("class", "rank-label")
      .attr("x", 10)
      .attr("y", (yScale.bandwidth() + 2) / 2) // 텍스트의 y 위치를 조정합니다.
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("fill", "#ffffff")
      .text((d, i) => `${i + 1}. ${d.항목}`);

    rankGroupsEnter.append("text")
      .attr("class", d => {
        const rankChange = previousRanks[d.항목] - data.findIndex(item => item.항목 === d.항목);
        return `rank-arrow ${rankChange > 0 ? "green" : rankChange < 0 ? "red" : "gray"}`;
      })
      .attr("x", 200)
      .attr("y", (yScale.bandwidth() + 10) / 2) // 텍스트의 y 위치를 조정합니다.
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", d => {
        const rankChange = previousRanks[d.항목] - data.findIndex(item => item.항목 === d.항목);
        return rankChange > 0 ? "green" : rankChange < 0 ? "red" : "gray";
      })
      .text(d => {
        const rankChange = previousRanks[d.항목] - data.findIndex(item => item.항목 === d.항목);
        return rankChange > 0 ? `↑${rankChange}` : rankChange < 0 ? `↓${-rankChange}` : "-";
      });

    const rankGroupsUpdate = rankGroupsEnter.merge(rankGroups);

    rankGroupsUpdate.transition()
      //.delay((d, i) => i * 200)
      .duration(1000)
      .attr("transform", d => `translate(0, ${yScale(d.항목)})`);

    rankGroupsUpdate.select(".rank-box")
      .attr("height", yScale.bandwidth() + 10); // 박스 높이를 더 키웁니다.

    rankGroupsUpdate.select(".rank-label").transition()
      .duration(1000)
      .attr("y", (yScale.bandwidth() + 10) / 2); // 텍스트의 y 위치를 조정합니다.

    rankGroupsUpdate.select(".rank-arrow").transition()
      .duration(1000)
      .attr("y", (yScale.bandwidth() + 10) / 2); // 텍스트의 y 위치를 조정합니다.

    rankGroups.exit()
      .transition()
      .duration(1000)
      .attr("transform", `translate(0, ${height})`)
      .style("opacity", 0)
      .remove();

  }, [data, previousData, margin.bottom, margin.left, margin.top, width]);

  return (
    <svg ref={svgRef} width={300} height={height+30}></svg>
  );
};

export default RankChangeChart;
