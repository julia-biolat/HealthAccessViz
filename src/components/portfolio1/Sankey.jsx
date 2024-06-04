import { useEffect, useRef, useState } from 'react';
import { sankey, sankeyJustify, sankeyLinkHorizontal } from 'd3-sankey';
import * as d3 from 'd3';

const Sankey = () => {
  const svgRef = useRef();
  const [data, setData] = useState({ nodes: [], links: [] });
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const height = 700;
  const width = 1200;

  useEffect(() => {
    const files = [
      { id: 1, title: "유아(0-9)", path: "/data/infants.csv" },
      { id: 2, title: "청소년(10-19)", path: "/data/adolescents.csv" },
      { id: 3, title: "청년(20-39)", path: "/data/middle.csv" },
      { id: 4, title: "중년(40-59)", path: "/data/young.csv" },
      { id: 5, title: "노년(60이상)", path: "/data/seniors.csv" }
    ];

    const loadData = async () => {
      let nodes = [
        { id: 0, name: "유아" },
        { id: 1, name: "청소년" },
        { id: 2, name: "청년" },
        { id: 3, name: "중년" },
        { id: 4, name: "노년" },
        { id: 5, name: "0-9세" },
        { id: 6, name: "10-19세" },
        { id: 7, name: "20-29세" },
        { id: 8, name: "30-39세" },
        { id: 9, name: "40-49세" },
        { id: 10, name: "50-59세" },
        { id: 11, name: "60-69세" },
        { id: 12, name: "70-79세" },
        { id: 13, name: "80세 이상" }
      ];

      let links = [
        { source: 5, target: 0, value: 15.29 }, // 0-9세 -> 유아
        { source: 6, target: 1, value: 10.18 }, // 10-19세 -> 청소년
        { source: 7, target: 2, value: 10.79 }, // 20-29세 -> 청년
        { source: 8, target: 2, value: 14.62 }, // 30-39세 -> 청년
        { source: 9, target: 3, value: 21.87 }, // 40-49세 -> 중년
        { source: 10, target: 3, value: 33.29 }, // 50-59세 -> 중년
        { source: 11, target: 4, value: 43.93 }, // 60-69세 -> 노년
        { source: 12, target: 4, value: 31.12 }, // 70-79세 -> 노년
        { source: 13, target: 4, value: 18.91 }  // 80세 이상 -> 노년
      ];

      for (const file of files) {
        const response = await fetch(file.path);
        const csvData = await response.text();
        const parsedData = d3.csvParse(csvData);

        parsedData.slice(0, 15).forEach((row, index) => {
          const existingNode = nodes.find(node => node.name === row.항목);

          if (existingNode) {
            links.push({ source: file.id - 1, target: existingNode.id, value: 15 - index });
          } else {
            const nodeId = nodes.length;
            nodes.push({ id: nodeId, name: row.항목 });
            links.push({ source: file.id - 1, target: nodeId, value: 15 - index });
          }
        });
      }

      setData({ nodes, links });
    };

    loadData();
  }, []);

  useEffect(() => {
    if (data.nodes.length === 0 || data.links.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const sankeyGenerator = sankey()
      .nodeWidth(15)
      .nodePadding(10) // 노드 간의 간격을 넓게 설정
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
      .nodeId(d => d.id)
      .nodeAlign(sankeyJustify);

    const { nodes, links } = sankeyGenerator({
      nodes: data.nodes.map(d => Object.assign({}, d)),
      links: data.links.map(d => Object.assign({}, d)),
    });

    // 링크를 그룹화
    const linkGroups = [];
    let currentGroup = 0;

    const assignGroup = (link, group) => {
      const stack = [link];
      while (stack.length) {
        const currentLink = stack.pop();
        if (currentLink.group === undefined) {
          currentLink.group = group;
          if (!linkGroups[group]) {
            linkGroups[group] = { links: [] };
          }
          linkGroups[group].links.push(currentLink);
          links.forEach(l => {
            if ((l.source.id === currentLink.target.id || l.target.id === currentLink.source.id) && l.group === undefined) {
              stack.push(l);
            }
          });
        }
      }
    };

    links.forEach(link => {
      if (link.group === undefined) {
        assignGroup(link, currentGroup++);
      }
    });

    const groupColorMap = {};
    linkGroups.forEach((group, i) => {
      groupColorMap[i] = d3.schemeCategory10[i % 10];
    });

    const mixColors = (colors) => {
      const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const toRgb = (color) => {
        const rgb = d3.color(color);
        return [rgb.r, rgb.g, rgb.b];
      };
      const [r, g, b] = colors.map(toRgb).reduce((a, b) => [avg([a[0], b[0]]), avg([a[1], b[1]]), avg([a[2], b[2]])]);
      return `rgb(${r}, ${g}, ${b})`;
    };

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("text-align", "center")
      .style("width", "auto")
      .style("height", "auto")
      .style("padding", "5px")
      .style("font", "12px sans-serif")
      .style("background", "lightsteelblue")
      .style("border", "0px")
      .style("border-radius", "8px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const highlightGroup = (group, highlight) => {
      svg.selectAll("rect")
        .attr("fill-opacity", d => group.links.some(l => l.source.id === d.id || l.target.id === d.id) ? (highlight ? 1 : 0.5) : 0.1);
      svg.selectAll("path")
        .attr("stroke-opacity", d => d.group === group.links[0].group ? (highlight ? 1 : 0.5) : 0.1);
    };

    svg.append("g")
      .selectAll("rect")
      .data(nodes)
      .enter().append("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", sankeyGenerator.nodeWidth())
      .attr("fill", d => {
        const groups = linkGroups.filter(g => g.links.some(l => l.source.id === d.id || l.target.id === d.id));
        if (groups.length > 1) {
          const colors = groups.map(g => groupColorMap[g.links[0].group]);
          return mixColors(colors);
        } else if (groups.length === 1) {
          return groupColorMap[groups[0].links[0].group];
        }
        return "#ccc";
      })
      .attr("stroke", "#000")
      .on("mouseover", function (event, d) {
        const group = linkGroups.find(g => g.links.some(l => l.source.id === d.id || l.target.id === d.id));
        if (group) {
          highlightGroup(group, true);
          tooltip.transition().duration(200).style("opacity", .9);
          tooltip.html(`그룹 정보: ${group.links.map(l => `${l.source.name} → ${l.target.name}`).join(", ")}<br>총 값: ${d3.sum(group.links, l => l.value)}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        }
      })
      .on("mouseout", function (event, d) {
        const group = linkGroups.find(g => g.links.some(l => l.source.id === d.id || l.target.id === d.id));
        if (group) {
          highlightGroup(group, false);
          tooltip.transition().duration(500).style("opacity", 0);
        }
      });

    svg.append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.5)
      .selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", d => groupColorMap[d.group])
      .attr("stroke-width", d => Math.max(1, d.width))
      .on("mouseover", function (event, d) {
        const group = linkGroups[d.group];
        if (group) {
          highlightGroup(group, true);
          tooltip.transition().duration(200).style("opacity", .9);
          tooltip.html(`그룹 정보: ${group.links.map(l => `${l.source.name} → ${l.target.name}`).join(", ")}<br>총 값: ${d3.sum(group.links, l => l.value)}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        }
      })
      .on("mouseout", function (event, d) {
        const group = linkGroups[d.group];
        if (group) {
          highlightGroup(group, false);
          tooltip.transition().duration(500).style("opacity", 0);
        }
      });

    svg.selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => (d.x0 < width / 2 ? "start" : "end"))
      .attr("font-size", 12)
      .text(d => d.name);
    }, [data]);

    return <svg ref={svgRef} width={width} height={height}></svg>;
  };
  
  export default Sankey;
