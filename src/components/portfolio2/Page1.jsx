import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Page1 = () => {
  const ref = useRef();
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [-300, 400]);

  const item = {
    id: 1,
    title: "의료 접근성 수치화 과정 설명",
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

export default Page1;
