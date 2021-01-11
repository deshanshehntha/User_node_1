const ElectionContractDataStore = require("./electionContractDataStore");
const ElectionContract = require("../../SmartContract/model/ElectionContract");

describe("Client data store", () => {
  let electionContractDataStore;
  beforeAll(async () => {
    electionContractDataStore = ElectionContractDataStore;
    electionContract = new ElectionContract(
      "ALL",
      "ME",
      "Election 1",
      ["doctor"],
      candidates,
      "This is an election",
      "2020-10-29T15:00",
      "2020-11-02T15:00"
    );
    electionContractDataStore.add(electionContract);
  });

  it("Get the length", () => {
    expect(electionContractDataStore.getLength()).toEqual(1);
  });

  it("Check the remove method ", () => {
    electionContractDataStore.remove("32");
    expect(electionContractDataStore.getLength()).toEqual(0);
  });
});
