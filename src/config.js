const dotEnv = require('dotenv');
class Config {
    constructor() {
        this.env = process.env.NODE_ENV
        if (this.env) {
            dotEnv.config({ path: `${__dirname}/../${this.env}.env` });
        }
    }
    get dalConfig() {
        const url = process.env.DB_URL || 'localhost';
        const isSrv = !url.includes('localhost');
        return {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            url,
            isSrv
        }
    }
    get mapApiKey() {
        return process.env.MAP_API_KEY;
    }
}
module.exports = new Config();