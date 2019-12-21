const { loadOptions } = require('../biz/collector');
const { extractOptions } = require('../biz/parser');
class Option {
    async collectNow(req, res) {
        const optionsHtml = await loadOptions();
        const options = extractOptions(optionsHtml);
        res.status(200).json(options);
    }
}

module.exports = new Option();