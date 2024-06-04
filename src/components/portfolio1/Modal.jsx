import { useRef, useEffect } from "react";
import * as d3 from "d3";
import './modal.scss';

const Modal = ({ selectedItem, onClose }) => {
  const modalRef = useRef();

  useEffect(() => {
    const modalSvg = d3.select(modalRef.current).select("svg")
    modalSvg.selectAll("*").remove();

    const width = 600;
    const height = 500;
    const radius = Math.min(width, height) / 4;
    const arc = d3.arc().innerRadius(0).outerRadius(radius);
    const pie = d3.pie().value(d => d.value).sort(null);
    const pieData = pie([
      { name: selectedItem.항목, value: selectedItem.비율 },
      { name: "Other", value: 100 - selectedItem.비율 }
    ]);

    const g = modalSvg.append("g").attr("transform", `translate(${width / 2 }, ${height / 2 - 50})`);;
  
  // 파이 차트 그리기
  g.selectAll("path")
    .data(pie(pieData))
    .enter()
    .append("path")
    .attr("class", (d, i) => `slice slice-${i}`)
    .attr("fill", (d, i) => (i === 0 ? "#B0E0E6" : "#4682B4"))
    .each(function(d) {
      this._current = { startAngle: 0, endAngle: 0 }; // 초기 상태 설정
    })
    .transition() // 트랜지션 시작
    .duration(1000) // 애니메이션 지속 시간
    .attrTween("d", function(d) {
      const interpolate = d3.interpolate(this._current, d);
      this._current = interpolate(0);
      return function(t) {
        return arc(interpolate(t));
      };
    });
  
  // 마우스 오버/아웃 이벤트 추가
  g.selectAll("path")
    .on("mouseover", function(event, d) {
      d3.select(this).classed("hovered", true);
      modalSvg.classed("hasHighlight", true);
    })
    .on("mouseout", function(event, d) {
      d3.select(this).classed("hovered", false);
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

  // 설명 텍스트
const description = [
  { text: `${selectedItem.항목}`, highlight: true },
  { text: `은(는) `, highlight: false },
  { text: `${selectedItem.연령층}`, highlight: true },
  { text: `에서 `, highlight: false },
  { text:  `${selectedItem.비율}%`, highlight: true },
  { text: `의 발생률을 보이며, `, highlight: false },
  { text: `${selectedItem.순위+1}위`, highlight: true },
  { text: `에 위치한 중요한 질병입니다.`, highlight: false },
  { text: `이 질병에 대한 인식과 예방이 중요하며,`, highlight: false },
  { text: `적절한 치료를 받을 수 있는 접근성이 확보되어야 합니다.`, highlight: false }
];

// SVG 텍스트 요소 추가
const textElement = modalSvg.append("text")
  .attr("x", width / 2)
  .attr("y", 370)
  .attr("text-anchor", "middle")
  .attr("class", "close")
  .style("font-size", "17px");

// 각 부분에 대한 tspan 요소 추가
description.forEach((part, i) => {
  textElement.append("tspan")
    .attr("x", i < 8 ? (i == 0 || i == 4 || i == 6 ? width / 2: null) : width/2)
    .attr("dy", i < 8 ? (i == 4 || i == 6 ? "1.2em" : 0) : i == 8 ? "1.8em":"1.2em")
    .attr("fill", part.highlight ? "yellow" : "white") // 특정 단어에 색상 적용
    .text(part.text);
});

  }, [selectedItem, onClose]);

  return (
    <div className="modal" ref={modalRef}>
      <div className="modal-content" width={600} >
        <svg width={600} height={500}></svg>
      </div>
    </div>
  );
};

export default Modal;
