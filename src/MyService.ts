import "dotenv/config";
import chalk from "chalk";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  GmEventHandler,
  GmChangeEvent,
  GmEventType,
  GmOrderbookService,
  Order,
} from "@staratlas/factory";
import * as os from "os";
import {Collection, InsertOneResult, MongoClient} from "mongodb";

export class MyService implements GmEventHandler {
  private gmOrderbookService: GmOrderbookService;
  private mongoDB: MongoClient;
  private db_name: string;
  private collectionADD: Collection;
  private collectionMOD: Collection;
  private collectionREM: Collection;
  private collectionALL: Collection;
  //private influxDatabase: InfluxDB;

  constructor() {
    console.log(chalk.bgBlue("Starting Service"));

    this.db_name = process.env.MONGO_DB_NAME;
    const connection = new Connection("https://ssc-dao.genesysgo.net/");
    const programId = new PublicKey(
      "traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg"
    );

    this.gmOrderbookService = new GmOrderbookService(connection, programId);
    this.gmOrderbookService.addOnEventHandler(this);
  }

  async initOrderBook() {
    console.log(chalk.bgBlue("Init Orderbook"));
    await this.gmOrderbookService.initialize();
  }

  async connectDB() {
    console.log(chalk.bgBlue("Connecting to DB"));

    const db_address = process.env.MONGO_URL;
    const db_username = process.env.MONGO_USERNAME;
    const db_password = process.env.MONGO_PASSWORD;
    const db_port = process.env.MONGO_PORT;
    const url =
      "mongodb://" +
      db_username +
      ":" +
      db_password +
      "@" +
      db_address +
      ":" +
      db_port;

    console.log(chalk.bgBlue("DB_address:", db_address));

    this.mongoDB = new MongoClient(url);
    await this.mongoDB
      .connect()
      .then((res) => console.log(chalk.bgBlue("DB-Connected!")))
      .catch((err) => console.log(err));
    const db = this.mongoDB.db(this.db_name);

    this.collectionADD = db.collection("orders_add");
    this.collectionMOD = db.collection("orders_mod");
    this.collectionREM = db.collection("orders_rem");
    this.collectionALL = db.collection("orders_all")
  }

  // onEvent will be fired any time a change occurs in the marketplace state
  async onEvent(this: any, event: GmChangeEvent): Promise<void> {
    switch (event.eventType) {
      case GmEventType.orderAdded:
        await this.handleOrderAdded(event);
        break;
      case GmEventType.orderModified:
        await this.handleOrderModified(event);
        break;
      case GmEventType.orderRemoved:
        await this.handleOrderRemoved(event);
        break;
      default:
        break;
    }
  }

  private async handleOrderAdded(
    this: any,
    event: GmChangeEvent
  ): Promise<void> {
    console.log(chalk.green("Event: ADDED"));
    const inert_result: InsertOneResult = await this.collectionADD.insertOne({
        lastModified: new Date(),
        created: new Date(),
        order: event.order
    });

    const inert_result_all: InsertOneResult =  await this.collectionALL.insertOne({
      event: "add",
      lastModified: new Date(),
      created: new Date(),
      order: event.order
    });

  }

  private async handleOrderModified(
    this: any,
    event: GmChangeEvent
  ): Promise<void> {
    console.log(chalk.yellow("Event: MODIFIED"));
    const inert_result = await this.collectionMOD.insertOne({
      created: new Date(),
      lastModified: new Date(),
      order: event.order
    });

    const inert_result_all: InsertOneResult =  await this.collectionALL.insertOne({
      event: "mod",
      lastModified: new Date(),
      created: new Date(),
      order: event.order
    });
  }

  private async handleOrderRemoved(
    this: any,
    event: GmChangeEvent
  ): Promise<void> {
    console.log(chalk.red("Event: REMOVED"));
    const inert_result = await this.collectionREM.insertOne({
      created: new Date(),
      lastModified: new Date(),
      order: event.order
    });

    const inert_result_all: InsertOneResult =  await this.collectionALL.insertOne({
      event: "rem",
      lastModified: new Date(),
      created: new Date(),
      order: event.order
    });
  }

}
