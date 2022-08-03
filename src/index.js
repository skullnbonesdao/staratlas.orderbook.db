#!/usr/bin/env node
import "dotenv/config";
import chalk from "chalk";
import {DatabaseService} from "./Database.js";
import {ServiceOrder} from "./ServiceOrder.js";
import {ServiceOrderbook} from "./ServiceOrderbook.js";


console.log(chalk.bgBlue("-> Starting"));


const db = new DatabaseService();
await db.init();


if (process.env.LOG_ORDERBOOK === '1') {
    const service_orderbook = new ServiceOrderbook();
    await service_orderbook.init(
        db.getCollection("orderbook_add"),
        db.getCollection("orderbook_mod"),
        db.getCollection("orderbook_rem"),
    );
}


if (process.env.LOG_ORDER === '1') {
    const service_order = new ServiceOrder();
    await service_order.init(
        db.getCollection("orders")
    );
}


