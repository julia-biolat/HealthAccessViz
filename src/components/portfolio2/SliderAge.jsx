import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3Slider from 'd3-simple-slider';

const ageGroupsDisplay = ["유아(0-9)", "청소년(10-19)","청년(20-39)","중년(40-59)","노년(60이상)"];
const ageGroups = ["infants","adolescents","young","middle","seniors"];

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
        .tickFormat(i => ageGroupsDisplay[i])
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
      <h4>Selected Age Group: {ageGroupsDisplay[ageGroups.indexOf(selectedAgeGroup)]}</h4>
      <div ref={sliderRef}></div>
    </div>
  );
};

export default SliderAge;
