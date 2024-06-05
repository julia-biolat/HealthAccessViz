import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import * as d3 from 'd3';
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";
import "./services.scss";

const genderColors = { '남성': '#ADD8E6', '여성': '#FFB6C1' };
const ageColors = {
  '유아': '#f08080', // 0-9세
  '청소년': '#db7093', // 10-19세
  '청년': '#ffd700', // 20-29세, 30-39세
  '중년': '#90ee90', // 40-49세, 50-59세
  '노년': '#1e90ff' // 60-69세, 70-79세, 80-89세, 90-99세, 100세 이상
};

const ageGroupMapping = {
  '0~9세': '유아',
  '10~19세': '청소년',
  '20~29세': '청년',
  '30~39세': '청년',
  '40~49세': '중년',
  '50~59세': '중년',
  '60~69세': '노년',
  '70~79세': '노년',
  '80~89세': '노년',
  '90~99세': '노년',
  '100세 이상': '노년'
};

const variants = {
  initial: {
    x: -500,
    y: 100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      staggerChildren: 0.1,
    },
  },
};

const Services = () => {
  const [region, setRegion] = useState(null);
  const [chartType, setChartType] = useState('gender');
  const svgRef = useRef();

  const handleRegionClick = (region) => {
    setRegion(region);
  };

  const data = chartType === 'age' ? ageData[region] : genderData[region];

  useEffect(() => {
    if (!region) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000;  // 그래프 크기 조절
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 40, left: 100 };  // 그래프 크기 조절

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.인구수)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const colorScale = chartType === 'gender' ?
      d3.scaleOrdinal().domain(Object.keys(genderColors)).range(Object.values(genderColors)) :
      d3.scaleOrdinal().domain(Object.keys(ageColors)).range(Object.values(ageColors));

    const xAxis = d3.axisBottom(xScale).tickSize(0).tickPadding(10);
    const yAxis = d3.axisLeft(yScale).ticks(5).tickSize(0).tickPadding(10);

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", chartType === 'gender' ? "20px" : "12px");

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "white");

    svg.append("text")
      .attr("transform", `rotate(-90)`)
      .attr("y", margin.left - 90)  // 인구수 수정
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "white")
      .text("인구수");

    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.name))
      .attr("y", height - margin.bottom)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .attr("fill", d => colorScale(chartType === 'gender' ? d.name : ageGroupMapping[d.name]))
      .attr("opacity", 0.7)
      .transition()
      .duration(800)
      .attr("y", d => yScale(d.인구수))
      .attr("height", d => yScale(0) - yScale(d.인구수));

    svg.selectAll(".bar")
      .on("click", (event, d) => {
        const [x, y] = d3.pointer(event);
        svg.selectAll(".tooltip").remove();
        svg.append("rect")
          .attr("class", "tooltip")
          .attr("x", x - 60)
          .attr("y", y - 40)
          .attr("width", 120)
          .attr("height", 30)
          .attr("fill", "rgba(0, 0, 0, 0.7)")
          .attr("rx", 5)
          .attr("ry", 5);

        svg.append("text")
          .attr("class", "tooltip")
          .attr("x", x)
          .attr("y", y - 20)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("fill", "white")
          .text(`인구수: ${d.인구수}`);
      })
      .on("mouseout", () => {
        svg.selectAll(".tooltip").remove();
      });

    // Adding grid lines behind bars
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height + margin.top + margin.bottom)
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.5);  // Modified grid opacity

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.5);  // Modified grid opacity

    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`) //legend edit
      .attr("class", "legend");

    const legendData = chartType === 'gender' ? Object.keys(genderColors) : Object.keys(ageColors);
    legendData.forEach((key, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", chartType === 'gender' ? genderColors[key] : ageColors[key]);

      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("fill", "white")
        .text(key);
    });

  }, [region, chartType]);

  return (
    <motion.div
      className="services"
      variants={variants}
      initial="initial"
      animate="animate"
    >
      <motion.div className="textContainer" variants={variants}>
        <hr />
      </motion.div>
      <motion.div 
        className="titleContainer" 
        variants={variants}
        style={{ marginTop: '-380px' }}
        >
        <div className="title">
        <h1 className="jua-regular">
            "<motion.b className="jua-regular"  whileHover={{ color: "orange" }}>인구 특성</motion.b>은 의료접근성 지표에 
          </h1>
        </div>
        <div className="title">
          <h1 className="jua-regular">
            <motion.b className="jua-regular"  whileHover={{ color: "orange" }}>필수적</motion.b>으로 들어가야할 요소이다."
          </h1>
        </div>
      </motion.div>
      <motion.div 
        className="contentContainer" 
        variants={variants}
        style={{ marginTop: '-200px' }}
        >
        <motion.div className="mapContainer" variants={variants}>
          <MapContainer
            center={[-50, 127.5]}
            zoom={7}
            style={{ height: "600px", width: "500px" }}
            maxBounds={[[33, 124], [39, 132]]}
            maxBoundsViscosity={1.0}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {Object.keys(positions).map((key) => (
              <Marker key={key} position={positions[key]} eventHandlers={{ click: () => handleRegionClick(key) }}>
                <Popup>{key}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>
        <motion.div className="chartContainer" variants={variants}>
          {region && (
            <div>
              <div className="buttonContainer">
                <button className="chartButton dark fast" onClick={() => setChartType('age')}>
                  <span>나이별</span>
                </button>
                <button className="chartButton dark fast" onClick={() => setChartType('gender')}>
                  <span>성별</span>
                </button>
              </div>
              <svg ref={svgRef} width="1110" height="500"></svg> {/* 그래프 크기 조절 */}
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};


const ageData = {
  "서울특별시": [
    { name: '0~9세', 인구수: 250114 },
    { name: '10~19세', 인구수: 357865 },
    { name: '20~29세', 인구수: 712582 },
    { name: '30~39세', 인구수: 713490 },
    { name: '40~49세', 인구수: 717072 },
    { name: '50~59세', 인구수: 760797 },
    { name: '60~69세', 인구수: 693083 },
    { name: '70~79세', 인구수: 404394 },
    { name: '80~89세', 인구수: 202190 },
    { name: '90~99세', 인구수: 33287 },
    { name: '100세 이상', 인구수: 1129 }
  ],
  "부산광역시": [
    { name: '0~9세', 인구수: 94714 },
    { name: '10~19세', 인구수: 128257 },
    { name: '20~29세', 인구수: 183595 },
    { name: '30~39세', 인구수: 189350 },
    { name: '40~49세', 인구수: 239896 },
    { name: '50~59세', 인구수: 277255 },
    { name: '60~69세', 인구수: 296461 },
    { name: '70~79세', 인구수: 176151 },
    { name: '80~89세', 인구수: 88494 },
    { name: '90~99세', 인구수: 13388 },
    { name: '100세 이상', 인구수: 370 }
  ],
  "대구광역시": [
    { name: '0~9세', 인구수: 73242 },
    { name: '10~19세', 인구수: 103606 },
    { name: '20~29세', 인구수: 133509 },
    { name: '30~39세', 인구수: 130877 },
    { name: '40~49세', 인구수: 179716 },
    { name: '50~59세', 인구수: 215399 },
    { name: '60~69세', 인구수: 190883 },
    { name: '70~79세', 인구수: 109343 },
    { name: '80~89세', 인구수: 61814 },
    { name: '90~99세', 인구수: 9535 },
    { name: '100세 이상', 인구수: 233 }
  ],
  "인천광역시": [
    { name: '0~9세', 인구수: 98596 },
    { name: '10~19세', 인구수: 132465 },
    { name: '20~29세', 인구수: 175188 },
    { name: '30~39세', 인구수: 197803 },
    { name: '40~49세', 인구수: 233530 },
    { name: '50~59세', 인구수: 259147 },
    { name: '60~69세', 인구수: 223327 },
    { name: '70~79세', 인구수: 105989 },
    { name: '80~89세', 인구수: 60273 },
    { name: '90~99세', 인구수: 11685 },
    { name: '100세 이상', 인구수: 391 }
  ],
  "광주광역시": [
    { name: '0~9세', 인구수: 48751 },
    { name: '10~19세', 인구수: 71337 },
    { name: '20~29세', 인구수: 91181 },
    { name: '30~39세', 인구수: 84228 },
    { name: '40~49세', 인구수: 114024 },
    { name: '50~59세', 인구수: 121607 },
    { name: '60~69세', 인구수: 96389 },
    { name: '70~79세', 인구수: 55216 },
    { name: '80~89세', 인구수: 30166 },
    { name: '90~99세', 인구수: 5252 },
    { name: '100세 이상', 인구수: 190 }
  ],
  "대전광역시": [
    { name: '0~9세', 인구수: 46937 },
    { name: '10~19세', 인구수: 66609 },
    { name: '20~29세', 인구수: 95038 },
    { name: '30~39세', 인구수: 88590 },
    { name: '40~49세', 인구수: 110215 },
    { name: '50~59세', 인구수: 121924 },
    { name: '60~69세', 인구수: 104160 },
    { name: '70~79세', 인구수: 53463 },
    { name: '80~89세', 인구수: 30441 },
    { name: '90~99세', 인구수: 5368 },
    { name: '100세 이상', 인구수: 179 }
  ],
  "울산광역시": [
    { name: '0~9세', 인구수: 38465 },
    { name: '10~19세', 인구수: 52406 },
    { name: '20~29세', 인구수: 52871 },
    { name: '30~39세', 인구수: 62575 },
    { name: '40~49세', 인구수: 86341 },
    { name: '50~59세', 인구수: 101914 },
    { name: '60~69세', 인구수: 83906 },
    { name: '70~79세', 인구수: 37052 },
    { name: '80~89세', 인구수: 17911 },
    { name: '90~99세', 인구수: 2997 },
    { name: '100세 이상', 인구수: 70 }
  ],
  "세종특별자치시": [
    { name: '0~9세', 인구수: 21419 },
    { name: '10~19세', 인구수: 25151 },
    { name: '20~29세', 인구수: 18611 },
    { name: '30~39세', 인구수: 30072 },
    { name: '40~49세', 인구수: 38939 },
    { name: '50~59세', 인구수: 25932 },
    { name: '60~69세', 인구수: 18700 },
    { name: '70~79세', 인구수: 8685 },
    { name: '80~89세', 인구수: 5262 },
    { name: '90~99세', 인구수: 1192 },
    { name: '100세 이상', 인구수: 38 }
  ],
  "경기도": [
    { name: '0~9세', 인구수: 483192 },
    { name: '10~19세', 인구수: 644884 },
    { name: '20~29세', 인구수: 797028 },
    { name: '30~39세', 인구수: 899162 },
    { name: '40~49세', 인구수: 1106136 },
    { name: '50~59세', 인구수: 1158298 },
    { name: '60~69세', 인구수: 917661 },
    { name: '70~79세', 인구수: 455735 },
    { name: '80~89세', 인구수: 263610 },
    { name: '90~99세', 인구수: 47757 },
    { name: '100세 이상', 인구수: 1463 }
  ],
  "강원도": [
    { name: '0~9세', 인구수: 44409 },
    { name: '10~19세', 인구수: 62118 },
    { name: '20~29세', 인구수: 71971 },
    { name: '30~39세', 인구수: 73902 },
    { name: '40~49세', 인구수: 102509 },
    { name: '50~59세', 인구수: 127028 },
    { name: '60~69세', 인구수: 137303 },
    { name: '70~79세', 인구수: 76381 },
    { name: '80~89세', 인구수: 53592 },
    { name: '90~99세', 인구수: 9847 },
    { name: '100세 이상', 인구수: 298 }
  ],
  "충청북도": [
    { name: '0~9세', 인구수: 50412 },
    { name: '10~19세', 인구수: 69726 },
    { name: '20~29세', 인구수: 81060 },
    { name: '30~39세', 인구수: 84987 },
    { name: '40~49세', 인구수: 111096 },
    { name: '50~59세', 인구수: 132365 },
    { name: '60~69세', 인구수: 127502 },
    { name: '70~79세', 인구수: 68282 },
    { name: '80~89세', 인구수: 48598 },
    { name: '90~99세', 인구수: 8777 },
    { name: '100세 이상', 인구수: 216 }
  ],
  "충청남도": [
    { name: '0~9세', 인구수: 70058 },
    { name: '10~19세', 인구수: 97564 },
    { name: '20~29세', 인구수: 100152 },
    { name: '30~39세', 인구수: 114700 },
    { name: '40~49세', 인구수: 151616 },
    { name: '50~59세', 인구수: 164149 },
    { name: '60~69세', 인구수: 159927 },
    { name: '70~79세', 인구수: 94556 },
    { name: '80~89세', 인구수: 71209 },
    { name: '90~99세', 인구수: 14192 },
    { name: '100세 이상', 인구수: 426 }
  ],
  "전라북도": [
    { name: '0~9세', 인구수: 50130 },
    { name: '10~19세', 인구수: 79344 },
    { name: '20~29세', 인구수: 87345 },
    { name: '30~39세', 인구수: 82943 },
    { name: '40~49세', 인구수: 119501 },
    { name: '50~59세', 인구수: 144550 },
    { name: '60~69세', 인구수: 142754 },
    { name: '70~79세', 인구수: 92954 },
    { name: '80~89세', 인구수: 68198 },
    { name: '90~99세', 인구수: 13206 },
    { name: '100세 이상', 인구수: 413 }
  ],
  "전라남도": [
    { name: '0~9세', 인구수: 52719 },
    { name: '10~19세', 인구수: 77126 },
    { name: '20~29세', 인구수: 78394 },
    { name: '30~39세', 인구수: 80031 },
    { name: '40~49세', 인구수: 112989 },
    { name: '50~59세', 인구수: 143112 },
    { name: '60~69세', 인구수: 148617 },
    { name: '70~79세', 인구수: 102544 },
    { name: '80~89세', 인구수: 83267 },
    { name: '90~99세', 인구수: 15347 },
    { name: '100세 이상', 인구수: 523 }
  ],
  "경상북도": [
    { name: '0~9세', 인구수: 73834 },
    { name: '10~19세', 인구수: 103636 },
    { name: '20~29세', 인구수: 106122 },
    { name: '30~39세', 인구수: 118448 },
    { name: '40~49세', 인구수: 171342 },
    { name: '50~59세', 인구수: 214234 },
    { name: '60~69세', 인구수: 222838 },
    { name: '70~79세', 인구수: 135857 },
    { name: '80~89세', 인구수: 99314 },
    { name: '90~99세', 인구수: 17890 },
    { name: '100세 이상', 인구수: 511 }
  ],
  "경상남도": [
    { name: '0~9세', 인구수: 102873 },
    { name: '10~19세', 인구수: 152026 },
    { name: '20~29세', 인구수: 141412 },
    { name: '30~39세', 인구수: 164845 },
    { name: '40~49세', 인구수: 245573 },
    { name: '50~59세', 인구수: 285243 },
    { name: '60~69세', 인구수: 264341 },
    { name: '70~79세', 인구수: 144983 },
    { name: '80~89세', 인구수: 95192 },
    { name: '90~99세', 인구수: 17297 },
    { name: '100세 이상', 인구수: 386 }
  ],
  "제주특별자치도": [
    { name: '0~9세', 인구수: 25017 },
    { name: '10~19세', 인구수: 34001 },
    { name: '20~29세', 인구수: 34589 },
    { name: '30~39세', 인구수: 38554 },
    { name: '40~49세', 인구수: 53389 },
    { name: '50~59세', 인구수: 57195 },
    { name: '60~69세', 인구수: 47029 },
    { name: '70~79세', 인구수: 25888 },
    { name: '80~89세', 인구수: 17268 },
    { name: '90~99세', 인구수: 4068 },
    { name: '100세 이상', 인구수: 278 }
  ]
};
const genderData = {
  "서울특별시": [
    { name: '남성', 인구수: 4555784 },
    { name: '여성', 인구수: 4855476 }
  ],
  "부산광역시": [
    { name: '남성', 인구수: 1611959 },
    { name: '여성', 인구수: 1693093 }
  ],
  "대구광역시": [
    { name: '남성', 인구수: 1169503 },
    { name: '여성', 인구수: 1209583 }
  ],
  "인천광역시": [
    { name: '남성', 인구수: 1491638 },
    { name: '여성', 인구수: 1489915 }
  ],
  "광주광역시": [
    { name: '남성', 인구수: 703548 },
    { name: '여성', 인구수: 720757 }
  ],
  "대전광역시": [
    { name: '남성', 인구수: 720637 },
    { name: '여성', 인구수: 724261 }
  ],
  "울산광역시": [
    { name: '남성', 인구수: 567947 },
    { name: '여성', 인구수: 537379 }
  ],
  "세종특별자치시": [
    { name: '남성', 인구수: 192449 },
    { name: '여성', 인구수: 193743 }
  ],
  "경기도": [
    { name: '남성', 인구수: 6854747 },
    { name: '여성', 인구수: 6768308 }
  ],
  "강원도": [
    { name: '남성', 인구수: 770730 },
    { name: '여성', 인구수: 761320 }
  ],
  "충청북도": [
    { name: '남성', 인구수: 810943 },
    { name: '여성', 인구수: 783297 }
  ],
  "충청남도": [
    { name: '남성', 인구수: 1089245 },
    { name: '여성', 인구수: 1037395 }
  ],
  "전라북도": [
    { name: '남성', 인구수: 876459 },
    { name: '여성', 인구수: 884710 }
  ],
  "전라남도": [
    { name: '남성', 인구수: 912075 },
    { name: '여성', 인구수: 897996 }
  ],
  "경상북도": [
    { name: '남성', 인구수: 1294579 },
    { name: '여성', 인구수: 1269486 }
  ],
  "경상남도": [
    { name: '남성', 인구수: 1642061 },
    { name: '여성', 인구수: 1619300 }
  ],
  "제주특별자치도": [
    { name: '남성', 인구수: 338843 },
    { name: '여성', 인구수: 337967 }
  ]
};
const positions = {
  "서울특별시": [37.5665, 126.9780],
  "부산광역시": [35.1796, 129.0756],
  "대구광역시": [35.8722, 128.6018],
  "인천광역시": [37.4563, 126.7052],
  "광주광역시": [35.1595, 126.8526],
  "대전광역시": [36.3504, 127.3845],
  "울산광역시": [35.5397, 129.3114],
  "세종특별자치시": [36.4875, 127.2817],
  "경기도": [37.2636, 127.0286],
  "강원도": [37.8228, 128.1555],
  "충청북도": [36.6358, 127.4913],
  "충청남도": [36.5184, 126.8000],
  "전라북도": [35.7175, 127.1530],
  "전라남도": [34.8160, 126.4629],
  "경상북도": [36.5758, 128.5056],
  "경상남도": [35.4606, 128.2132],
  "제주특별자치도": [33.4996, 126.5312]
};

export default Services;
