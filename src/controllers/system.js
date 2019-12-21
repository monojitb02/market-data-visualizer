class System {
    getHealth(req, res) {
        res.status(200).json({ status: 'OK' });
    }
    getVersion(req, res) {
        const { version } = require('../../package.json');
        res.status(200).json({ version });
    }
}

module.exports = new System();
