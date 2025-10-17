import http from "http";
import { Command } from "commander";
import fs from "fs";
import { XMLBuilder } from "fast-xml-parser";
import url from "url";

const program = new Command();

program
  .requiredOption("-i, --input <path>", "Path to input file")
  .requiredOption("-h, --host <host>", "Host address")
  .requiredOption("-p, --port <port>", "Server port");

program.parse(process.argv);

const { input, host, port } = program.opts();

//перевірка наявності файлу
if (!fs.existsSync(input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

//читання даних з JSON
async function readData(filePath) {
  const content = await fs.promises.readFile(filePath, "utf8");
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== "");
  return lines.map(line => JSON.parse(line));
}

//http сервер
const server = http.createServer(async (req, res) => {
  const query = url.parse(req.url, true).query;
  const data = await readData(input);

  let filtered = data;

  //?furnished=true
  if (query.furnished === "true") {
    filtered = filtered.filter(
      (item) => item.furnishingstatus?.toLowerCase() === "furnished"
    );
  }

  //?max_price=X
  if (query.max_price) {
    const maxPrice = parseFloat(query.max_price);
    filtered = filtered.filter(
      (item) => parseFloat(item.price) < maxPrice
    );
  }

  //формування XML
  const builder = new XMLBuilder({ ignoreAttributes: false });
  const xmlObj = {
    houses: {
      house: filtered.map((item) => ({
        price: item.price,
        area: item.area,
        furnishingstatus: item.furnishingstatus,
      })),
    },
  };
  const xmlData = builder.build(xmlObj);

  res.writeHead(200, { "Content-Type": "application/xml" });
  res.end(xmlData);
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
  console.log(`Reading data from: ${input}`);
});
