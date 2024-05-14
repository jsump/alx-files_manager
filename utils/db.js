const MongoClient = require('mongodb');

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';

        const uri = `mongodb://${host}:${port}/${database}`;
        this.client = new MongoClient(uri, { useUnifiedTopology: true });
        this.dbName = database;
    }

    async isAlive() {
        try {
            await this.client.connect();
            return true;
        } catch (error) {
            return false;
        }
    }

    async nbUsers() {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const usersCount = await db.collection('users').countDocuments();
            return usersCount;
        } catch (error) {
            return 0;
        }
    }

    async nbFiles() {
        try {
            await this.client.connect();
            const db = this.client.db(this.dbName);
            const filesCount = await db.collection('files').countDocuments();
            return filesCount;
        } catch (error) {
            return 0;
        }
    }
}

const dbClient = new DBClient();

module.exports = dbClient;
