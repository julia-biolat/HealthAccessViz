import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3Slider from 'd3-simple-slider';

const data = [
  { id: 1, title: "Infants", path: "/data/infants.csv" },
  { id: 2, title: "Adolescents", path: "/data/adolescents.csv" },
  { id: 3, title: "Middle-aged", path: "/data/middle.csv" },
  { id: 4, title: "Young Adults", path: "/data/young.csv" },
  { id: 5, title: "Seniors", path: "/data/seniors.csv" }
];

const SliderComponent = ({ onAgeGroupChange }) => {
  const sliderRef = useRef(null);
  const isSliderInitialized = useRef(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(data[0]);

  useEffect(() => {
    if (!isSliderInitialized.current) {
      const slider = d3Slider.sliderBottom()
        .min(0)
        .max(data.length - 1)
        .step(1)
        .width(400)
        .tickFormat(i => data[i].title)
        .ticks(data.length)
        .default(0)  // 기본값을 "Infants"로 설정
        .on('onchange', val => {
          setSelectedAgeGroup(data[val]);
          onAgeGroupChange(data[val]);
        });

      d3.select(sliderRef.current)
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);

      isSliderInitialized.current = true;
      // 기본값으로 데이터 로드
      onAgeGroupChange(data[0]);
    }
  }, [onAgeGroupChange]);

  return (
    <div>
      <h4>Selected Age Group: {selectedAgeGroup.title}</h4>
      <div ref={sliderRef}></div>
    </div>
  );
};

export default SliderComponent;
