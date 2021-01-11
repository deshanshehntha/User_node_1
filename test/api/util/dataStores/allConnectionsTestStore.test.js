const AllConnectionsTestStore = require("./allConnectionsTestStore");

describe("All connection test store", () => {
  let connectionStor;
  beforeAll(async () => {
    connectionStor = AllConnectionsTestStore;
    connectionStor.add("32", "432sfd", "http://4003.00", 24346776789);
  });

  it("Get the length", () => {
    expect(connectionStor.getLength()).toEqual(1);
  });

  it("Check the remove method ", () => {
    connectionStor.remove("32");
    expect(connectionStor.getLength()).toEqual(0);
  });
});
