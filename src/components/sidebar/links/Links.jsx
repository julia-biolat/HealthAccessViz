import { motion } from "framer-motion";

const variants = {
  open: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  closed: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
  },
  closed: {
    y: 50,
    opacity: 0,
  },
};

const Links = () => {
  const items = ["Homepage", "Services", "Portfolio", "Contact", "About"];
  const items1 = ["1. 문제제기", "2. 인구특성", "3. 의료접근성", "4. 결론", " "];

  return (
    <motion.div className="links" variants={variants}>
      {items.map((item, index) => (
        <motion.a className="jua-regular"
          href={`#${item}`}
          key={item}
          variants={itemVariants}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {items1[index]}
        </motion.a>
      ))}
    </motion.div>
  );
};

export default Links;
