import { useEffect, useState } from "react";
import Sankey from "./Sankey";
import { dataFiles, fetchData } from "./data";

const processData = (data) => {
  let nodes = [];
  let links = [];
  const nodeMap = new Map();

  Object.keys(data).forEach((ageGroup) => {
    data[ageGroup].forEach((item) => {
      const disease = item.항목;
      if (!nodeMap.has(disease)) {
        nodeMap.set(disease, nodes.length);
        nodes.push({ name: disease, category: "Disease" });
      }
      if (!nodeMap.has(`${ageGroup} - ${disease}`)) {
        nodeMap.set(`${ageGroup} - ${disease}`, nodes.length);
        nodes.push({ name: `${ageGroup} - ${disease}`, category: ageGroup });
      }
      links.push({
        source: nodeMap.get(`${ageGroup} - ${disease}`),
        target: nodeMap.get(disease),
        value: parseInt(item.총),
      });
    });
  });

  // Verify that all sources and targets in links exist in nodes
  links.forEach(link => {
    if (!nodes[link.source] || !nodes[link.target]) {
      console.error("Missing node for link", link);
    }
  });

  return { nodes, links };
};

const SankeyDiagram = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const fetchedData = await fetchData(dataFiles);
      setData(fetchedData);
    };

    loadData();
  }, []);

  if (!data) return <div>Loading...</div>;

  const sankeyData = processData(data);
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Sankey data={sankeyData} />
    </div>
  );
};

export default SankeyDiagram;