import "dotenv/config";
import {MongoClient} from "mongodb";
import chalk from "chalk";

export class DatabaseService {
    private readonly databaseName;
    private readonly mongoURL;
    private mongoClient;
    private mongoDatabase;

    constructor() {
        const db_address = process.env.MONGO_URL;
        const db_username = process.env.MONGO_USERNAME;
        const db_password = process.env.MONGO_PASSWORD;
        const db_port = process.env.MONGO_PORT;
        this.databaseName = process.env.MONGO_DB_NAME;

        this.mongoURL =
            "mongodb://" +
            db_username +
            ":" +
            db_password +
            "@" +
            db_address +
            ":" +
            db_port;

        this.mongoClient = new MongoClient(this.mongoURL)
    }

    async init() {
        console.log(chalk.bgBlue("{DB} Connecting..."));

        await this.mongoClient
            .connect()
            .then((res) => console.log(chalk.bgGreen("{DB} Connected!")))
            .catch((err) => console.log(err));
        this.mongoDatabase = this.mongoClient.db(this.databaseName);
    }

    getCollection(collection_name: string) {
        return this.mongoDatabase.collection(collection_name)
    }
}