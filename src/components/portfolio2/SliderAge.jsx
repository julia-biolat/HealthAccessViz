import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3Slider from 'd3-simple-slider';

const ageGroups = ["0~9세","10~19세","20~29세","30~39세","40~49세","50~59세","60~69세","70~79세","80~89세","90~99세","100세 이상"];

const SliderAge = ({ onAgeGroupChange }) => {
  const sliderRef = useRef(null);
  const isSliderInitialized = useRef(false);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(ageGroups[0]);

  useEffect(() => {
    if (!isSliderInitialized.current) {
      const slider = d3Slider.sliderBottom()
        .min(0)
        .max(ageGroups.length - 1)
        .step(1)
        .width(400)
        .tickFormat(i => ageGroups[i])
        .ticks(ageGroups.length)
        .default(0)
        .on('onchange', val => {
            setSelectedAgeGroup(ageGroups[val])
            onAgeGroupChange(ageGroups[val]);
        });

      d3.select(sliderRef.current)
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)')
        .call(slider);

      isSliderInitialized.current = true;
      onAgeGroupChange(ageGroups[0]);
    }
  }, [onAgeGroupChange]);

  return (
    <div>
      <h3>선택된 연령층: {selectedAgeGroup}</h3>
      <div ref={sliderRef}></div>
    </div>
  );
};

export default SliderAge;
