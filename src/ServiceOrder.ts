import "dotenv/config";
import chalk from "chalk";
import {Connection, PublicKey} from "@solana/web3.js";
import {GmEventService,} from "@staratlas/factory";
import {Collection, InsertOneResult} from "mongodb";

export class ServiceOrder {
    private gmEvent: GmEventService;
    private collection: Collection


    constructor() {
        const connection = new Connection("https://ssc-dao.genesysgo.net/");
        const programId = new PublicKey(
            "traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg"
        );

        this.gmEvent = new GmEventService(connection, programId);
        this.gmEvent.setEventHandler(async (eventType, order, slotContext) => {
            console.log(chalk.green("{ServiceOrder} Event"));
            const inert_result: InsertOneResult = await this.collection.insertOne({
                lastModified: new Date(),
                created: new Date(),
                event: eventType === 0 ? 'add' : eventType === 1 ? 'rem' : eventType === 2 ? 'add' : eventType,
                order: order,
                slotContext: slotContext,
            });
        });
    }

    async init(collection: Collection,) {
        console.log(chalk.bgBlue("{ServiceOrder} Init"));

        this.collection = collection;

        await this.gmEvent.initialize();
    }
}
