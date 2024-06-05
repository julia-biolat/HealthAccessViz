import { useEffect, useRef, useState } from 'react';
import { sankey, sankeyCenter, sankeyJustify, sankeyLinkHorizontal } from 'd3-sankey';
import * as d3 from 'd3';

const Sankey = () => {
  const svgRef = useRef();
  const [data, setData] = useState({ nodes: [], links: [] });
  const margin = { top: 50, right: 140, bottom: 13, left: 140 };
  const height = 700;
  const width = 1300;
  let isMouseOver = false;

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

      let links = [{'source': 5, 'target': 0, 'value': 30.58},
      {'source': 6, 'target': 1, 'value': 20.36},
      {'source': 7, 'target': 2, 'value': 21.58},
      {'source': 8, 'target': 2, 'value': 29.24},
      {'source': 9, 'target': 3, 'value': 43.74},
      {'source': 10, 'target': 3, 'value': 66.58},
      {'source': 11, 'target': 4, 'value': 87.86},
      {'source': 12, 'target': 4, 'value': 62.24},
      {'source': 13, 'target': 4, 'value': 37.82}];

      for (const file of files) {
        const response = await fetch(file.path);
        const csvData = await response.text();
        const parsedData = d3.csvParse(csvData);

        parsedData.slice(0, 12).forEach((row, index) => {
          const existingNode = nodes.find(node => node.name === row.항목);

          if (existingNode) {
            links.push({ source: file.id - 1, target: existingNode.id, value: 12 - index });
          } else {
            const nodeId = nodes.length;
            nodes.push({ id: nodeId, name: row.항목 });
            links.push({ source: file.id - 1, target: nodeId, value: 12 - index });
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
      .nodePadding(15)
      .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
      .nodeId(d => d.id)
      .nodeAlign(sankeyCenter);

    let { nodes, links } = sankeyGenerator({
      nodes: data.nodes.map(d => Object.assign({}, d)),
      links: data.links.map(d => Object.assign({}, d)),
    });

    const margin_top = 80;
    const move_x = 150;

    // Depth 0 노드를 id 순서대로 정렬하여 y 위치 설정
    const depth0Nodes = nodes.filter(node => node.depth === 0).sort((a, b) => a.id - b.id);
    depth0Nodes.forEach((node, index) => {
      const outgoingLinks = links.filter(link => link.source.id === node.id);
      const totalLinkHeight = d3.sum(outgoingLinks, link => link.width);
      node.y0 = index * 68 + margin_top;
      node.y1 = node.y0 + totalLinkHeight;
    });

    // depth 1 노드의 높이를 다시 계산하고 링크 높이를 동기화
    nodes.forEach(node => {
      if (node.depth === 1) {
        const incomingLinks = links.filter(link => link.target.id === node.id);
        const outgoingLinks = links.filter(link => link.source.id === node.id);
        const totalIncomingHeight = d3.sum(incomingLinks, link => link.width);
        const totalOutgoingHeight = d3.sum(outgoingLinks, link => link.width);

        outgoingLinks.forEach(link => {
          link.width *= totalIncomingHeight / totalOutgoingHeight;
        });

        node.x0 -= move_x;
        node.x1 -= move_x;
        node.y0 += margin_top;
        node.y1 = node.y0 + totalIncomingHeight;
      } else if (node.depth === 2) {
        const incomingLinks = links.filter(link => link.target.id === node.id);
        const totalLinkHeight = d3.sum(incomingLinks, link => link.width);
        node.y1 = node.y0 + totalLinkHeight;
      }
    });

    // 새로운 노드 높이에 따라 링크 위치를 조정
    sankeyGenerator.update({ nodes, links });

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

    const groupColorMap = {0:'#f39821', 1:'#d9b643', 2:'#f5f1b3', 3:'#bbcee2', 4:'#4f7bbf'};

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
      .style("opacity", 0)
      .style("color", "black");

    const highlightGroup = (group, highlight) => {
      svg.selectAll("rect")
        .attr("fill-opacity", d => group.links.some(l => l.source.id === d.id || l.target.id === d.id) ? (highlight ? 1 : 0.8) : 0.3);
      svg.selectAll("path")
        .attr("stroke-opacity", d => d.group === group.links[0].group ? (highlight ? 1 : 0.8) : 0.3);
    };

    // Reset highlight to initial state
    const resetHighlight = () => {
      if (!isMouseOver) {
        svg.selectAll("rect").attr("fill-opacity", 1);
        svg.selectAll("path").attr("stroke-opacity", 0.5);
      }
    };

    svg.append("g")
      .selectAll("rect")
      .data(nodes)
      .enter().append("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", sankeyGenerator.nodeWidth())
      .attr("fill-opacity", 1)  // 초기 상태로 모든 노드를 밝게 설정
      .attr("stroke", "white")
      .attr("stroke-opacity", 0.5)
      .attr("fill", d => {
        const groups = linkGroups.filter(g => g.links.some(l => l.source.id === d.id || l.target.id === d.id));
        if (groups.length > 1) {
          const colors = groups.map(g => groupColorMap[g.links[0].group]);
          return mixColors(colors);
        } else if (groups.length === 1) {
          return groupColorMap[groups[0].links[0].group];
        }
        console.log(groups.length)
        return "#ccc";
      })
      .on("mouseover", function (event, d) {
        isMouseOver = true;
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
        isMouseOver = false;
        const group = linkGroups.find(g => g.links.some(l => l.source.id === d.id || l.target.id === d.id));
        if (group) {
          highlightGroup(group, false);
          tooltip.transition().duration(500).style("opacity", 0);
        }
        setTimeout(resetHighlight, 10);  // 짧은 지연 후 초기 상태로 돌아가기
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
        isMouseOver = true;
        const group = linkGroups[d.group];
        if (group) {
          highlightGroup(group, true);
          tooltip.transition().duration(300).style("opacity", .9);
          tooltip.html(`그룹 정보: ${group.links[0].target.name}<br>${group.links.map(l => 
            `${l.target.name}`).join(",<br>").slice(group.links[0].target.name.length+1) }`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
        }
      })
      .on("mouseout", function (event, d) {
        isMouseOver = false;
        const group = linkGroups[d.group];
        if (group) {
          highlightGroup(group, false);
          tooltip.transition().duration(500).style("opacity", 0);
        }
        setTimeout(resetHighlight, 10);  // 짧은 지연 후 초기 상태로 돌아가기
      });

    svg.selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", d => (d.depth === 0 ? d.x0 - 10 : d.x1 + 10))
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => (d.depth === 0 ? "end" : "start"))
      .attr("font-size", 12)
      .attr("fill", "white")
      .text(d => d.name);
  }, [data, isMouseOver]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default Sankey;
