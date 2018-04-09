const env = 'test';
const config = {
    'test': {
        mongoDbUrl: 'mongodb://127.0.0.1:27017/dailyReport'
    },
    'product': {
        mongoDbUrl: 'mongodb://127.0.0.1:27017/dailyReport'
    }
};
module.exports = config[env];