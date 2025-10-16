import http from "http";
import { Command } from "commander";

const program = new Command();

program
  .requiredOption("-i, --input <path>", "Path to input file")
  .requiredOption("-h, --host <host>", "Host address")
  .requiredOption("-p, --port <port>", "Server port");

program.parse(process.argv);

const { input, host, port } = program.opts();

//перевірка наявності файлу
import fs from "fs";
if (!fs.existsSync(input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

//створення http-сервера
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("HTTP server is running correctly");
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
  console.log(`Reading data from: ${input}`);
});
