import dataUriParser from "datauri/parser.js";
import path, { extname } from "path";

const bufferGenerator = (file) => {
  const parser = new dataUriParser();
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
};

export default bufferGenerator;
