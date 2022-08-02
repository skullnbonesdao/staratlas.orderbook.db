import "dotenv/config";
import chalk from "chalk";
import {Connection, PublicKey} from "@solana/web3.js";
import {GmChangeEvent, GmEventHandler, GmEventType, GmOrderbookService,} from "@staratlas/factory";
import {Collection, InsertOneResult} from "mongodb";

export class ServiceOrderbook implements GmEventHandler {
    private gmOrderbookService: GmOrderbookService;
    private collectionADD: Collection;
    private collectionMOD: Collection;
    private collectionREM: Collection;

    constructor() {
        const connection = new Connection("https://ssc-dao.genesysgo.net/");
        const programId = new PublicKey(
            "traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg"
        );

        this.gmOrderbookService = new GmOrderbookService(connection, programId);
        this.gmOrderbookService.addOnEventHandler(this);
    }

    async init(collection_add: Collection, collection_mod: Collection, collection_rem: Collection) {
        console.log(chalk.bgBlue("{ServiceOrderbook} Init"));

        this.collectionADD = collection_add;
        this.collectionMOD = collection_mod;
        this.collectionREM = collection_rem;
        await this.gmOrderbookService.initialize();
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
        console.log(chalk.green("{ServiceOrderbook} Event: ADDED"));
        const inert_result: InsertOneResult = await this.collectionADD.insertOne({
            lastModified: new Date(),
            created: new Date(),
            order: event.order
        });
    }

    private async handleOrderModified(
        this: any,
        event: GmChangeEvent
    ): Promise<void> {
        console.log(chalk.yellow("{ServiceOrderbook} Event: MODIFIED"));
        const inert_result = await this.collectionMOD.insertOne({
            created: new Date(),
            lastModified: new Date(),
            order: event.order
        });
    }

    private async handleOrderRemoved(
        this: any,
        event: GmChangeEvent
    ): Promise<void> {
        console.log(chalk.red("{ServiceOrderbook} Event: REMOVED"));
        const inert_result = await this.collectionREM.insertOne({
            created: new Date(),
            lastModified: new Date(),
            order: event.order
        });
    }
}
