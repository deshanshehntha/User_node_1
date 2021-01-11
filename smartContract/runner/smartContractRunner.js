/***
 *
 *  Smart contract runner
 *  This can contains multiple live election smart contracts
 *
 * */

const ElectionContract = require("../model/electionContract");

class SmartContractRunner {
    static _contracts = []

    constructor() {
        SmartContractRunner._contracts = [];
    }

    startSmartContract(electionCategory,
                       creator,
                       electionName,
                       voters,
                       candidates,
                       description,
                       startDate,
                       endDate) {

        const contract = new ElectionContract(electionCategory,
            creator,
            electionName,
            voters,
            candidates,
            description,
            startDate,
            endDate)

        contract.deploy();
        SmartContractRunner._contracts.push(contract);
        return contract.getContractId();
    }

    getSmartContract(contract_id) {
        const contract = SmartContractRunner._contracts.find(contract => contract._contractId === contract_id);
        console.log(SmartContractRunner._contracts);
        return contract;
    }

    getAllContracts() {
        return SmartContractRunner._contracts;
    }

}

const instance = new SmartContractRunner();

module.exports = instance;

