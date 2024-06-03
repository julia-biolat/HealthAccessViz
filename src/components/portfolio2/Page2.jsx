import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Page2 = () => {
  const ref = useRef();
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [-300, 300]);

  const item = {
    id: 2,
    title: "인구 특성 + 질병 별 지역 간 의료 접근성 비율 비교",
  };

  return (
    <section>
      <div className="container">
        <div className="wrapper">
          <motion.div className="textContainer" style={{ y }}>
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
            <button>알아서 없애든 말든 선택</button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Page2;
