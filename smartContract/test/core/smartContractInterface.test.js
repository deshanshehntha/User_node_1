const SmartContractInterface = require("../../core/smartContractInterface");

describe("Smart Contract Interface", () => {
  let smartContract, creator, chain;

  beforeAll(async () => {
    creator = "ME";
    smartContract = new SmartContractInterface(creator);
    chain = await smartContract.deploy();
  });

  it("Check contract id is not null", () => {
    expect(smartContract._contractId).not.toEqual(null);
  });

  it("Check creator equals to given creator name", () => {
    expect(smartContract._creator).toEqual(creator);
  });

  it("Check the blockchain created validly with the genesis block", async () => {
    chain = await smartContract.readBlock();
    expect(chain[0].lastHash).toEqual("0");
  });
});
