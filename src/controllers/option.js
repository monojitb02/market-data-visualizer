const { loadOptions } = require('../biz/collector');
const { extractOptions } = require('../biz/parser');
const optionDAO = require('../dal/option.dao');
class Option {
    async collectLatest(req, res) {
        const optionsHtml = await loadOptions();
        const options = extractOptions(optionsHtml);
        const savedOptions = await optionDAO.saveIfChanged(options);
        res.status(200).json(savedOptions);
    }
    async get(req, res) {
        const options = await optionDAO.getOptions();
        res.status(200).json(options);
    }
    async getLatest(req, res) {
        const options = await optionDAO.getLatestOptions();
        res.status(200).json(options);
    }
}

module.exports = new Option();