/***
 *
 *  SmartContractInterface
 *  This is the core model for the smart contract
 *
 * */

const Blockchain = require("izigma-blockchain");

class SmartContractInterface {
  constructor(creator) {
    const { v4: uuidv4 } = require("uuid");
    this._contractId = uuidv4();
    this._creator = creator;
    this._startTime = Date.now();
  }

  async deploy() {
    this._startTime = Date.now();
    this._chain = new Blockchain();
    this._fileName = await this._chain.getChainFileName();
    console.log("------------------------" + this._fileName);
    return this._chain;
  }

  async readBlock() {
    let blockchain = [];

    blockchain = await this._chain.getChain();
    return blockchain;
  }
}
module.exports = SmartContractInterface;
