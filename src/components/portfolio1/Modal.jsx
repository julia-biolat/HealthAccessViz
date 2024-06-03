import { useRef, useEffect } from "react";
import * as d3 from "d3";
import './modal.scss';

const Modal = ({ selectedItem, onClose }) => {
  const modalRef = useRef();

  useEffect(() => {
    const modalSvg = d3.select(modalRef.current).select("svg");
    modalSvg.selectAll("*").remove();

    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 4;
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const pie = d3.pie().value(d => d.value).sort(null);
    const pieData = pie([
      { name: selectedItem.항목, value: selectedItem.비율 },
      { name: "Other", value: 100 - selectedItem.비율 }
    ]);

    const g = modalSvg.append("g").attr("transform", `translate(${width / 2}, ${height / 2 - 30})`);

    g.selectAll("path")
      .data(pieData)
      .enter()
      .append("path")
      .attr("class", (d, i) => `slice slice-${i}`)
      .attr("d", arc)
      .attr("fill", (d, i) => (i === 0 ? "#B0E0E6" : "#4682B4"))
      .on("mouseover", function(event, d) {
        modalSvg.selectAll(`.slice-${pieData.indexOf(d)}`).classed("hovered", true);
        modalSvg.classed("hasHighlight", true);
      })
      .on("mouseout", function(event, d) {
        modalSvg.selectAll(`.slice-${pieData.indexOf(d)}`).classed("hovered", false);
        modalSvg.classed("hasHighlight", false);
      })
      .on("click", onClose);

    // 파이 차트 라벨 그리기
    const labelGroup = g.append("g").attr("class", "labels");
    const lineGroup = g.append("g").attr("class", "lines");

    pieData.forEach((d, i) => {
      const sliceInfo = {
        innerRadius: 0,
        outerRadius: radius,
        startAngle: d.startAngle,
        endAngle: d.endAngle
      };
      const centroid = arc.centroid(sliceInfo);

      const inflexionPoint = [
        centroid[0] * 1.5,
        centroid[1] * 1.5
      ];

      const labelPosX = inflexionPoint[0] + 60 * (centroid[0] > 0 ? 1 : -1);
      const textAnchor = centroid[0] > 0 ? "start" : "end";

      lineGroup.append("line")
        .attr("x1", centroid[0])
        .attr("y1", centroid[1])
        .attr("x2", inflexionPoint[0])
        .attr("y2", inflexionPoint[1])
        .attr("stroke", "black");

      lineGroup.append("line")
        .attr("x1", inflexionPoint[0])
        .attr("y1", inflexionPoint[1])
        .attr("x2", labelPosX)
        .attr("y2", inflexionPoint[1])
        .attr("stroke", "black");

      const label = labelGroup.append("text")
        .attr("x", labelPosX)
        .attr("y", inflexionPoint[1])
        .attr("text-anchor", textAnchor)
        .attr("fill", "white")
        .attr("class", `slice slice-${i}`)
        .selectAll("tspan")
        .data([d.data.name, `${d.data.value}%`])
        .enter()
        .append("tspan")
        .attr("x", labelPosX)
        .attr("dy", (t, j) => `${j * 1.2}em`)
        .text(t => t);

      label.on("mouseover", function() {
          modalSvg.classed("hasHighlight", true);
          modalSvg.selectAll(`.slice-${i}`).classed("hovered", true);
        })
        .on("mouseout", function() {
          modalSvg.classed("hasHighlight", false);
          modalSvg.selectAll(`.slice-${i}`).classed("hovered", false);
        });
    });

    // 닫기 버튼
    modalSvg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("class", "close")
      .style("cursor", "pointer")
      .text("돌아가기")
      .on("click", onClose);

    // 설명
    modalSvg.append("text")
      .attr("x", width / 2)
      .attr("y", 395)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("class", "close")
      .style("font-size", "17px")
      .text(`${selectedItem.항목} 에 관한 설명이 들어가지 않을까..`);

  }, [selectedItem, onClose]);

  return (
    <div className="modal" ref={modalRef}>
      <div className="modal-content">
        <svg width={500} height={500}></svg>
      </div>
    </div>
  );
};

export default Modal;
