import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { sankey, sankeyJustify, sankeyLinkHorizontal } from "d3-sankey";
import { useDimensions } from "./UseDimensions";

const MARGIN_Y = 25;
const MARGIN_X = 5;
const COLORS = ["#e0ac2b", "#e85252", "#6689c6", "#9a6fb0", "#a53253"];

const Sankey = ({ data }) => {
  const containerRef = useRef();
  const { width, height } = useDimensions(containerRef);

  useEffect(() => {
    if (width === 0 || height === 0) return;

    const svg = d3.select(containerRef.current).select("svg");
    svg.selectAll("*").remove();

    const colorScale = d3.scaleOrdinal()
      .domain([...new Set(data.nodes.map(d => d.category))])
      .range(COLORS);

    const sankeyGenerator = sankey()
      .nodeWidth(26)
      .nodePadding(10)
      .extent([
        [MARGIN_X, MARGIN_Y],
        [width - MARGIN_X, height - MARGIN_Y],
      ])
      .nodeId(d => d.name)
      .nodeAlign(sankeyJustify);

    try {
      const { nodes, links } = sankeyGenerator(data);

      // Draw nodes
      svg.append("g")
        .selectAll("rect")
        .data(nodes)
        .enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", sankeyGenerator.nodeWidth())
        .attr("fill", d => colorScale(d.category))
        .attr("stroke", "black");

      // Draw links
      const linkGenerator = sankeyLinkHorizontal();
      svg.append("g")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("d", linkGenerator)
        .attr("stroke", d => colorScale(d.source.category))
        .attr("fill", "none")
        .attr("stroke-opacity", 0.1)
        .attr("stroke-width", d => d.width);

      // Draw labels
      svg.append("g")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("x", d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
        .attr("y", d => (d.y0 + d.y1) / 2)
        .attr("dy", "0.35rem")
        .attr("text-anchor", d => (d.x0 < width / 2 ? "start" : "end"))
        .attr("font-size", 12)
        .text(d => d.name);
    } catch (error) {
      console.error("Error generating Sankey diagram:", error);
    }
  }, [width, height, data]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg width={width} height={height}></svg>
    </div>
  );
};

export default Sankey;