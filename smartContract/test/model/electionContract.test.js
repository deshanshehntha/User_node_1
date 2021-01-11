const ElectionContract = require("../../model/electionContract");

describe("Election Contract", () => {
  let electionContract, chain, candidates;

  beforeAll(async () => {
    candidates = [{_name: "Yes"}, {_name: "No"}];
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
  });

  it("Check contract id is not null", () => {
    expect(electionContract.getContractId()).not.toEqual(null);
  });

  it("Check the adding candidate", async () => {
    candidates.push({_name: "Other"});
    electionContract.addCandidate("Other");
    expect(electionContract._candidates.length).toEqual(candidates.length);
  });
});
