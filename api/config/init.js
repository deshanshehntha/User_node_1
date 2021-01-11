
/**
 *
 * This file defines and exports configuration methods
 *
 * */

module.exports = {

    /**Set custom cors policy*/
    cors: async (req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    },

    /** Initiate Logging sequence */
    logger : async () => {
        const fs = require('fs');
        const util = require('util');
        const log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});
        const log_stdout = process.stdout;

        console.log = function (d) { //
            log_file.write(util.format(d) + '\n');
            log_stdout.write(util.format(d) + '\n');
        };
    }
}
