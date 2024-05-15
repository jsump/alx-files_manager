const { MongoClient } = require("mongodb");

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';

        this.client = new MongoClient(`mongodb://${host}:${port}`, { useUnifiedTopology: true });
        this.dbName = database;

        // Connect to the database when the DBClient instance is created
        this.connect();
    }

    isAlive() {
        return this.client.isConnected();
    }

    async nbUsers() {
        try {
            const db = this.client.db(this.dbName);
            const usersCount = await db.collection('users').countDocuments();
            return usersCount;
        } catch (error) {
            console.error("Error fetching user count:", error);
            return 0;
        }
    }

    async nbFiles() {
        try {
            const db = this.client.db(this.dbName);
            const filesCount = await db.collection('files').countDocuments();
            return filesCount;
        } catch (error) {
            console.error("Error fetching file count:", error);
            return 0;
        }
    }
}

const dbClient = new DBClient();

module.exports = dbClient;
