import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import './stackedBarChart.scss';  // CSS 파일 임포트

const StackedBarChart = ({ data, stackOrder, onBarClick, previousData}) => { // onBarClick 추가
  const svgRef = useRef();
  const [selectedItem, setSelectedItem] = useState(null);
  const height = 450;
  const margin = { top: 20, right: 0, bottom: 20, left: 200 };
  const width = 1100 - margin.left - margin.right;

  const handleClick = (item) => {
    setSelectedItem(item);
    if (onBarClick) {
      onBarClick(item);
    }
  };

  useEffect(() => {
    if (data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const y = d3.scaleBand()
      .domain(data.map(d => d.항목))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);
    
    const prev = d3.scaleBand()
      .domain(previousData.map(d => d.항목))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.총)]).nice()
      .range([margin.left, width - margin.right]);

    const color = d3.scaleOrdinal()
      .domain(["남", "여"])
      .range(["#57648C", "#934A5F"]);  // 막대 색상 변경

    const series = d3.stack()
      .keys(stackOrder === 'male-first' ? ["남", "여"] : ["여", "남"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)(data);

    const groups = svg.append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("class", d => `row rect-${d.항목.replace(/\s+/g, '-')}`)
      .on("mouseover", function (event, d) {
        d3.selectAll(".row").classed("hovered", false);
        d3.selectAll(`.rect-${d.항목.replace(/\s+/g, '-')}`).classed("hovered", true);
        d3.selectAll(".row").classed("faded", true);
        d3.selectAll(`.rect-${d.항목.replace(/\s+/g, '-')}`).classed("faded", false);
      })
      .on("mouseout", function () {
        d3.selectAll(".row").classed("hovered", false);
        d3.selectAll(".row").classed("faded", false);
      })
      .on("click", (event, d) => handleClick(d));

    const drawBars = (group, key, delayMultiplier) => {

      if(previousData.length !== 0 && previousData[0].연령층 === data[0].연령층){
        return group.selectAll(`.${key}-rect`)
        .data(d => {
          const barData = series.find(s => s.key === key).find(v => v.data.항목 === d.항목);
          return [{ key, value: barData, data: d}];
        })
        .enter()
        .append("rect")
        .attr("class", `${key}-rect`)
        .attr("x", d => x(d.value[0]))
        .attr("y", d => prev(d.data.항목))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.value[1]) - x(d.value[0]))
        .attr("fill", color(key))
        .attr("stroke", "rgba(255, 255, 255, 0.4)")
        .attr("stroke-width", 1) // 경계 두께를 1로 설정
        .transition() // 트랜지션 추가
        .duration(800)
        .attr("y", d => y(d.data.항목));
      }

      return group.selectAll(`.${key}-rect`)
        .data(d => {
          const barData = series.find(s => s.key === key).find(v => v.data.항목 === d.항목);
          return [{ key, value: barData, data: d }];
        })
        .enter()
        .append("rect")
        .attr("class", `${key}-rect`)
        .attr("x", d => x(d.value[0]))
        .attr("y", d => y(d.data.항목))
        .attr("height", y.bandwidth())
        .attr("width", 0) // 초기 너비를 0으로 설정
        .attr("fill", color(key))
        .attr("stroke", "rgba(255, 255, 255, 0.4)")
        .attr("stroke-width", 1) // 경계 두께를 1로 설정
        .transition() // 트랜지션 추가
        .delay(delayMultiplier)
        .duration(800)
        .attr("width", d => x(d.value[1]) - x(d.value[0]));
    };

    const delayMultiplier = 550; // 막대 간 딜레이 조정

    if (stackOrder === 'male-first') {
      drawBars(groups, "남", 0);
      drawBars(groups, "여", delayMultiplier);
    } else {
      drawBars(groups, "여", 0);
      drawBars(groups, "남", delayMultiplier);
    }

    // 막대 끝에 총 인원 레이블 추가
    groups.append("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.총) + 5)
      .attr("y", d => y(d.항목) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("fill", "#ffffff")
      .text(d => d3.format(",")(d.총))
      .style("opacity", 0) // 초기 투명도를 0으로 설정
      .transition() // 트랜지션 추가
      .delay(delayMultiplier+300)
      .duration(300)
      .style("opacity", 1); // 최종 투명도를 1로 설정

    if(previousData.length !== 0 && previousData[0].연령층 === data[0].연령층){
      // 카테고리 텍스트 애니메이션 추가
      groups.append("text")
      .attr("x", margin.left - 10)
      .attr("y", d => prev(d.항목) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "#ffffff")
      .text(d => d.항목)
      .transition() // 트랜지션 추가
      .duration(800)
      .attr("y", d => y(d.항목) + y.bandwidth() / 2)
    }else{
      groups.append("text")
      .attr("x", margin.left - 10)
      .attr("y", d => y(d.항목) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "#ffffff")
      .style("opacity", 0) // 초기 투명도를 0으로 설정
      .text(d => d.항목)
      .transition() // 트랜지션 추가
      .duration(800)
      .style("opacity", 1); // 최종 투명도를 1로 설정
    }

    // x축 추가
    svg.append("g")
      .call(d3.axisBottom(x)
        .ticks(5)
        .tickFormat(d3.format(",.0f"))
        .tickSizeOuter(0))
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .selectAll("text")
      .attr("fill", "#ffffff");
  }, [data, stackOrder, selectedItem, margin.bottom, margin.left, margin.right, margin.top, width]);

  return (
    <div className="rowsContainer">
      <svg ref={svgRef} width={1000} height={450}></svg>
      <p className="source-text"> 출처:국민관심질병통계 2023년 성별/연령10세구간별 (단위: 명) </p>
    </div>
  );
};

export default StackedBarChart;
