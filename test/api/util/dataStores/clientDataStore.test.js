const ClientDataStore = require("./clientDataStore");

describe("Client data store", () => {
  let clientDataStore;
  beforeAll(async () => {
    clientDataStore = ClientDataStore;
    clientDataStore.add(
      "32",
      "432sfd",
      "http://4003.00",
      24346776789,
      "doctore"
    );
  });

  it("Get the length", () => {
    expect(clientDataStore.getLength()).toEqual(1);
  });

  it("Check the remove method ", () => {
    clientDataStore.remove("32");
    expect(clientDataStore.getLength()).toEqual(0);
  });
});
