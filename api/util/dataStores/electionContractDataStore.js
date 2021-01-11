/**
 *
 * This class will store election contracts recievd from the signalling nodes
 *
 * **/
const schedule = require('node-schedule');
const constants = require('../constants')

class ElectionContractDataStore {

    _contracts = [];

    constructor() {
        this._contracts = [];
    }

    add(contract) {

        var existsWithId = this._contracts.find(function (element) {
            return element._contractId === contract._contractId;
        });

        if (existsWithId === null || existsWithId === undefined) {
                console.log("new contract!")
                this._contracts.push(contract);
                this.startJobScheduler();
        }
    }

    getAll() {
        return this._contracts;
    }

    getContractById(id) {
        var found = this._contracts.find(function (element) {
            return element._contractId === id;
        });

        return found;
    }

    removeElectionById(id) {
        this._contracts = this._contracts.filter(function (obj) {
            return obj._contractId !== id;

        });
        console.log("Election Contract Removed : " + id)
    }


    startJobScheduler() {
        const scheduleJob = schedule.scheduleJob('*/5 * * * * *', () => {
            this.changeElectionStatus();
            if (this._contracts.length === 0) {
                scheduleJob.cancel();
            }
        });
    }

    changeElectionStatus() {
        this._contracts.forEach(election => {

            const status = this.validateElectionTimeAndDateWithStatus(
                election._startDate,
                election._endDate);

            if(election._electionStatus !== status) {
                election.setElectionStatus(status);
                if(status === constants.ELECTION_STATUS_FINISHED) {
                    election.setAllowVoting(false);
                }
            }
        })
    }

    validateElectionTimeAndDateWithStatus(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        const utcDateTime = new Date();
        const utc = utcDateTime.getTime() + (utcDateTime.getTimezoneOffset() * 60000);
        const todaysDateInIst = new Date(utc + (3600000 * +5.5));
        if (startDate.getTime() > todaysDateInIst.getTime()) {
            return constants.ELECTION_STATUS_PENDING;
        }

        if (startDate.getTime() < todaysDateInIst.getTime() && endDate.getTime() > todaysDateInIst.getTime()) {
            return constants.ELECTION_STATUS_STARTED;
        }


        if (todaysDateInIst.getTime() > endDate.getTime()) {
            return constants.ELECTION_STATUS_FINISHED;
        }
    }
}

const instance = new ElectionContractDataStore();

module.exports = instance;
