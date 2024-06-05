import Test from "./Test";
import "./app.scss";
import Contact from "./components/contact/Contact";
import Cursor from "./components/cursor/Cursor";
import Hero from "./components/hero/Hero";
import Navbar from "./components/navbar/Navbar";
import Parallax from "./components/parallax/Parallax";
import Portfolio1 from "./components/portfolio1/Portfolio1";
import Portfolio2 from "./components/portfolio2/Portfolio2";
import Portfolio3 from "./components/portfolio3/Portfolio3";
import Services from "./components/services/Services";


const App = () => {
  return (
    <div>
      <Cursor />
      <section id="Homepage">
        <Navbar />
        <Hero />
      </section>

      <section id="Services">
        <Parallax type="services" />
      </section>
      <section>
        <Services />
      </section>
      
      <section id="Portfolio1">
        <Parallax type="portfolio1" />
      </section>
        <Portfolio1 />
        <Portfolio3 />
      
        <section id="Portfolio2">
        <Parallax type="portfolio2" />
      </section>
        <Portfolio2 />

      <section id="Contact">
        <Contact />
      </section>
<Test/>
      {/* Framer Motion Crash Course */}
      {/* <Test/>
    <Test/> */}
    </div>
  );
};

export default App;
