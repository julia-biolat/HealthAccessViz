import { useRef, useState } from "react";
import "./contact.scss";
import { motion, useInView } from "framer-motion";
import emailjs from "@emailjs/browser";

const variants = {
  initial: {
    y: 500,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const Contact = () => {
  const ref = useRef();
  const formRef = useRef();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const isInView = useInView(ref, { margin: "-100px" });

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_94y20xo",
        "template_v10u2oh",
        formRef.current,
        "pX_2hasGmGcuvjXIW"
      )
      .then(
        (result) => {
          setSuccess(true)
        },
        (error) => {
          setError(true);
        }
      );
  };

  return (
    <motion.div
      ref={ref}
      className="contact"
      variants={variants}
      initial="initial"
      whileInView="animate"
    >
      <motion.div className="textContainer" variants={variants}>
      <motion.h1 className="jua-regular" variants={variants}>
        여러분도 인구 특성을 반영한 의료 접근성 평가로 실질적 의료 서비스 수요를 충족시켜 보세요.
      </motion.h1>
      <motion.p className="description" variants={variants}>
        지역별 인구 특성을 반영한 의료 접근성 평가를 통해, 우리는 각 지역의 실질적인 의료 서비스 수요를 충족시키는 방안을 마련할 수 있습니다. 보다 정확한 데이터를 기반으로 한 평가와 시각화는 공중 보건 정책의 효율성을 높이고, 모든 연령대와 성별에 맞춘 맞춤형 의료 서비스를 제공하는 데 중요한 역할을 할 것입니다. 따라서, 지속적인 연구와 데이터를 통한 정책 개선이 필요합니다. 여러분도 이 프로젝트를 통해 의료 접근성에 대한 이해를 높이고, 직접 시각화하여 확인해 보시기 바랍니다.
      </motion.p>

        <motion.div className="item" variants={variants}>
          <h2>팀</h2>
          <span>Wacky Wombat</span>
        </motion.div>
        <motion.div className="item" variants={variants}>
          <h2>팀 구성원</h2>
          <span>이지윤, 김슬미, 김혁, 김정우</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Contact;
