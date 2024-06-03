export const dataFiles = [
    { id: 1, title: "Infants", path: "/data/infants.csv" },
    { id: 2, title: "Adolescents", path: "/data/adolescents.csv" },
    { id: 3, title: "Middle-aged", path: "/data/middle.csv" },
    { id: 4, title: "Young Adults", path: "/data/young.csv" },
    { id: 5, title: "Seniors", path: "/data/seniors.csv" }
  ];
  
  export const parseCSV = (csv, ageGroup) => {
    const lines = csv.trim().split("\n");
    const result = [];
    const headers = lines[0].split(",");
  
    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i].split(",");
      const obj = { ageGroup: ageGroup };
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
  
    return result;
  };
  
  export const fetchData = async (dataFiles) => {
    const combinedData = {};
  
    for (const file of dataFiles) {
      const response = await fetch(file.path);
      const csv = await response.text();
      combinedData[file.title.toLowerCase()] = parseCSV(csv, file.title.toLowerCase());
    }
  
    return combinedData;
  };