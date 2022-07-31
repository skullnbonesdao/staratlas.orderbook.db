#!/usr/bin/env node
import chalk from "chalk";
import { MyService } from "./MyService.js";

console.log(chalk.bgBlue("Starting"));

const service = new MyService();

await service.connectDB();
await service.initOrderBook();
