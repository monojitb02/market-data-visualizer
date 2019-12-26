const _ = require('lodash');
const optionDAO = require('../dal/option.dao');

class Grafana {
    async getHealth(req, res) {
        res.status(200).json({ status: 'OK' });
    }
    async search(req, res) {
        const { type, target } = req.body;
        const filter = {};
        if (type) {
            filter.type = type;
        }
        if (target) {
            filter.target = target;
        }
        const strikePrices = await optionDAO.getStrikePrices();
        res.status(200).json(strikePrices);
    }
    async query(req, res) {
        const {
            // range: {
            //     from,
            //     to,
            // },
            // intervalMs,
            targets: [target],
            // maxDataPoints,
            // adhocFilters,
            scopedVars: {
                strikePrice: {
                    value: strikePrices
                },
                field: {
                    value: fieldValue = 'oi'
                }
            }
        } = req.body;
        const { data: { type } } = target;
        // const startDate = new Date(from);
        // const endDate = new Date(to);
        const filter = {};
        if (strikePrices) {
            filter.strikePrice = _.isArray(strikePrices) ?
                { $in: strikePrices.map(a => Number(a)) } : strikePrices
        }
        const result = await optionDAO.getOptionsColumn(`${type}.${fieldValue}`, filter);
        res.status(200).json(result);
    }

}
module.exports = new Grafana();