const SmartContractRunner = require("../../runner/smartContractRunner");

describe("Smart Contract Runner", () => {
  let smartContractRunner, contractId;
  let creator = "DUMMY_USER"
  beforeAll(async () => {
    smartContractRunner = new SmartContractRunner();
    contractId = await smartContractRunner.startSmartContract(
        "ALL",
        creator,
        "Election 1",
        ["doctor"],
        [{_name: "Yes"}, {_name: "No"}],
        "This is an election",
        "2020-10-29T15:00",
        "2020-11-02T15:00"
    );
  });

  it("Get the correct smart contract", () => {
    expect(
        smartContractRunner.getSmartContract(contractId)._contractId
    ).toEqual(contractId);
  });

  it("Check creator equals to given creator name", () => {
    let smartContract = smartContractRunner.getSmartContract(contractId)
    expect(smartContract._creator).toEqual(creator);
  });

  it("Get all the smart contracts", async () => {
    expect(SmartContractRunner.getAllContracts().length).toEqual(1);
  });
});
