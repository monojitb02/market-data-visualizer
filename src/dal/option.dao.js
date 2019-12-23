const _ = require('lodash');
const mongoose = require('mongoose');
const optionSchema = require('./option.schema');
class OptionDAO {
    constructor() {
        this.model = mongoose.model('option', optionSchema);
    }

    async getOptions(filters = {}) {
        return await this.model.find(filters);
    }
    async getLatestOptions(filter = {}, fields = {
        strikePrice: 1,
        calls: 1,
        puts: 1,
        createdAt: 1
    }) {
        return await this.model.aggregate().match(filter).sort({
            strikePrice: 1, createdAt: -1,
        }).group({
            _id: '$strikePrice',
            ..._.mapValues(fields, (v, field) => {
                return { $first: `$${field}` }
            })
        }).project({
            _id: 0,
            ...fields
        });
    }
    async saveIfChanged(options) {
        const strikePrices = _.map(options, 'strikePrice');
        const lastCycleOptions = await this.getLatestOptions({
            strikePrice: { $in: strikePrices },
        }, {
            strikePrice: 1,
            calls: 1,
            puts: 1
        });
        const lastCycleOptionsMap = _.keyBy(lastCycleOptions, 'strikePrice');
        const savedOptions = [];
        const newOptions = [];
        options.forEach(option => {
            const strikePrice = option.strikePrice;
            const lastCycleOption = lastCycleOptionsMap[strikePrice];
            if (lastCycleOption && _.isEqual(lastCycleOption, option)) {
                savedOptions.push(option);
            } else {
                newOptions.push(option);
            }
        });
        if (newOptions.length) {
            const createdOptions = await this.model.insertMany(newOptions);
            savedOptions.concat(createdOptions)
        }
        return savedOptions;
    }
}
module.exports = new OptionDAO();
