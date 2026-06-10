#!/usr/bin/env node
import { main } from "../src/cli.js";

main(process.argv.slice(2)).catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
