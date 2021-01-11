const networkController = require("../../../../api/controller/network/network")

describe("Network controller Tests", () => {

    beforeAll(async () => {

    });

    it("Initialize user session", async () => {
        const sessionId = await networkController.initializeUserSession()
        expect(sessionId).not.toBe(null)
    });

    it("Initialize user session session id should not be null", async () => {
        const sessionId = await networkController.initializeUserSession()
        expect(sessionId).not.toBe(null)
    });

    it("authenticate node connection request - return true if valid", async () => {
        const sessionId = await networkController.initializeUserSession()

        const request  = {
            token : sessionId
        }
        const response = await networkController.authenticateNodeConnectionRequest(request)
        expect(response).toEqual(true);
    });

    it("authenticate node connection request - return false if inValid", async () => {
        const request  = {
            token : "f-a-l-s-e-i-d"
        }
        const response = await networkController.authenticateNodeConnectionRequest(request)
        expect(response).toEqual(false);
    });



});
