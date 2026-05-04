import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  createTestApp,
  createAuthenticatedRequest,
  resetMocks,
} from "../utils/test-app";
import {
  TestDataFactory,
  createMockThemeCSS,
  createMockLogoData,
  TestUser,
} from "../utils/test-helpers";
import { Hono } from "hono";

describe("DEX Routes", () => {
  let app: Hono;
  let testDataFactory: TestDataFactory;
  let testUser: TestUser;

  beforeEach(async () => {
    app = await createTestApp();
    testDataFactory = new TestDataFactory();
    resetMocks();

    testUser = await testDataFactory.createTestUser();
  });

  afterEach(async () => {
    await testDataFactory.cleanup();
  });

  describe("GET /api/dex", () => {
    it("should return 200 with exists: false when user has no DEX", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const response = await request.get("/api/dex");
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty("exists", false);
    });

    it("should return user DEX when it exists", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const dex = await testDataFactory.createTestDex(testUser.id, {
        brokerId: "test-broker-123",
        brokerName: "Test DEX",
        chainIds: [1, 137],
        primaryLogo: createMockLogoData(),
        themeCSS: createMockThemeCSS(),
      });

      const response = await request.get("/api/dex");
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty("id", dex.id);
      expect(body).toHaveProperty("brokerId", "test-broker-123");
      expect(body).toHaveProperty("brokerName", "Test DEX");
      expect(body).toHaveProperty("chainIds", [1, 137]);
      expect(body).toHaveProperty("primaryLogo", createMockLogoData());
      expect(body).toHaveProperty("themeCSS", createMockThemeCSS());
    });
  });

  describe("POST /api/dex", () => {
    it("should create a new DEX with minimal data", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const formData = new FormData();
      formData.append("brokerName", "My Test DEX");
      formData.append("chainIds", JSON.stringify([1, 137]));
      formData.append("availableLanguages", JSON.stringify(["en"]));

      const response = await request.post("/api/dex", formData);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("brokerName", "My Test DEX");
      expect(body).toHaveProperty("chainIds", [1, 137]);
      expect(body).toHaveProperty("availableLanguages", ["en"]);
      expect(body).toHaveProperty("userId", testUser.id);
    });

    it("should create a new DEX with additional data", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const formData = new FormData();
      formData.append("brokerName", "Extended Test DEX");
      formData.append("chainIds", JSON.stringify([1, 137, 42161]));
      formData.append("defaultChain", "1");
      formData.append("telegramLink", "https://t.me/testdex");
      formData.append("discordLink", "https://discord.gg/testdex");
      formData.append("xLink", "https://x.com/testdex");
      formData.append("availableLanguages", JSON.stringify(["en", "es"]));
      formData.append("enableCampaigns", "true");
      formData.append("enableAbstractWallet", "true");

      const response = await request.post("/api/dex", formData);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("brokerName", "Extended Test DEX");
      expect(body).toHaveProperty("chainIds", [1, 137, 42161]);
      expect(body).toHaveProperty("defaultChain", 1);
      expect(body).toHaveProperty("telegramLink", "https://t.me/testdex");
      expect(body).toHaveProperty("discordLink", "https://discord.gg/testdex");
      expect(body).toHaveProperty("xLink", "https://x.com/testdex");
      expect(body).toHaveProperty("availableLanguages", ["en", "es"]);
      expect(body).toHaveProperty("enableCampaigns", true);
      expect(body).toHaveProperty("enableAbstractWallet", true);
    });

    it("should return 400 for invalid data", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const formData = new FormData();
      formData.append("brokerName", "");
      formData.append("chainIds", JSON.stringify([]));
      formData.append("availableLanguages", JSON.stringify([]));

      const response = await request.post("/api/dex", formData);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty("error");
    });

    it("should return 409 if user already has a DEX", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      await testDataFactory.createTestDex(testUser.id);

      const formData = new FormData();
      formData.append("brokerName", "Another DEX");
      formData.append("chainIds", JSON.stringify([1, 137]));
      formData.append("availableLanguages", JSON.stringify(["en"]));

      const response = await request.post("/api/dex", formData);
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body).toHaveProperty("error");
      expect(body.error).toContain("User already has a DEX");
    });
  });

  describe("PUT /api/dex/:id", () => {
    it("should update an existing DEX", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const dex = await testDataFactory.createTestDex(testUser.id, {
        brokerName: "Original DEX",
        chainIds: [1, 137],
      });

      const formData = new FormData();
      formData.append("brokerName", "Updated DEX");
      formData.append("chainIds", JSON.stringify([1, 137, 42161]));
      formData.append("telegramLink", "https://t.me/updateddex");
      formData.append("themeCSS", createMockThemeCSS());

      const response = await request.put(`/api/dex/${dex.id}`, formData);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty("id", dex.id);
      expect(body).toHaveProperty("brokerName", "Updated DEX");
      expect(body).toHaveProperty("chainIds", [1, 137, 42161]);
      expect(body).toHaveProperty("telegramLink", "https://t.me/updateddex");
      expect(body).toHaveProperty("themeCSS");
      expect(body.themeCSS).toContain(":root");
    });

    it("should return 404 if DEX not found", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const formData = new FormData();
      formData.append("brokerName", "Updated DEX");

      const response = await request.put("/api/dex/non-existent-id", formData);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toHaveProperty("message");
    });
  });

  describe("DELETE /api/dex/:id", () => {
    it("should delete an existing DEX", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const dex = await testDataFactory.createTestDex(testUser.id);

      const response = await request.delete(`/api/dex/${dex.id}`);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty("message", "DEX deleted successfully");
      expect(body).toHaveProperty("dex");
    });

    it("should return 404 if DEX not found", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const response = await request.delete("/api/dex/non-existent-id");
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toHaveProperty("message");
    });
  });

  describe("POST /api/dex/:id/custom-domain", () => {
    let dex: { id: string };

    beforeEach(async () => {
      dex = await testDataFactory.createTestDex(testUser.id, {
        repoUrl: "https://github.com/testuser/testrepo",
      });
    });

    describe("invalid domains", () => {
      const invalidDomains = [
        "",
        "   ",
        "example",
        "192.168.1.1",
        "example..com",
        ".example.com",
        "example.com.",
        "-example.com",
        "example-.com",
        "example.c",
        "example.c0m",
        "a".repeat(64) + ".com",
        "a".repeat(250) + ".com",
        "example_domain.com",
      ];

      invalidDomains.forEach(domain => {
        it(`should reject "${domain}"`, async () => {
          const request = createAuthenticatedRequest(app, testUser.id);

          const response = await request.post(
            `/api/dex/${dex.id}/custom-domain`,
            {
              json: { domain },
            }
          );

          expect(response.status).toBe(400);
        });
      });
    });

    describe("authorization and prerequisites", () => {
      it("should return 400 if DEX not found", async () => {
        const request = createAuthenticatedRequest(app, testUser.id);

        const response = await request.post(
          "/api/dex/non-existent-id/custom-domain",
          {
            json: { domain: "example.com" },
          }
        );

        expect(response.status).toBe(400);
      });

      it("should return 400 if user doesn't own the DEX", async () => {
        const otherUser = await testDataFactory.createTestUser();
        const otherDex = await testDataFactory.createTestDex(otherUser.id, {
          repoUrl: "https://github.com/otheruser/otherrepo",
        });

        const request = createAuthenticatedRequest(app, testUser.id);

        const response = await request.post(
          `/api/dex/${otherDex.id}/custom-domain`,
          {
            json: { domain: "example.com" },
          }
        );

        expect(response.status).toBe(400);
      });
    });
  });

  describe("PUT /api/dex/:id/swap-fee", () => {
    let dex: { id: string };

    beforeEach(async () => {
      dex = await testDataFactory.createTestDex(testUser.id);
    });

    it("should update swap fee successfully", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const response = await request.put(`/api/dex/${dex.id}/swap-fee`, {
        swapFeeBps: 30,
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("message", "Swap fee updated successfully");
      expect(body).toHaveProperty("dex");
      expect(body.dex).toHaveProperty("swapFeeBps", 30);
    });

    it("should set swap fee to null", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      await request.put(`/api/dex/${dex.id}/swap-fee`, {
        swapFeeBps: 50,
      });

      const response = await request.put(`/api/dex/${dex.id}/swap-fee`, {
        swapFeeBps: null,
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.dex).toHaveProperty("swapFeeBps", null);
    });

    it("should allow zero swap fee", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const response = await request.put(`/api/dex/${dex.id}/swap-fee`, {
        swapFeeBps: 0,
      });

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.dex).toHaveProperty("swapFeeBps", 0);
    });

    it("should return 400 for swap fee above 100", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const response = await request.put(`/api/dex/${dex.id}/swap-fee`, {
        swapFeeBps: 101,
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 for negative swap fee", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const response = await request.put(`/api/dex/${dex.id}/swap-fee`, {
        swapFeeBps: -1,
      });

      expect(response.status).toBe(400);
    });

    it("should return 400 for non-integer swap fee", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const response = await request.put(`/api/dex/${dex.id}/swap-fee`, {
        swapFeeBps: 1.5,
      });

      expect(response.status).toBe(400);
    });

    it("should return 404 if DEX not found", async () => {
      const request = createAuthenticatedRequest(app, testUser.id);

      const response = await request.put("/api/dex/non-existent-id/swap-fee", {
        swapFeeBps: 30,
      });

      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toHaveProperty("message");
    });

    it("should return 403 if user doesn't own the DEX", async () => {
      const otherUser = await testDataFactory.createTestUser();
      const otherDex = await testDataFactory.createTestDex(otherUser.id);

      const request = createAuthenticatedRequest(app, testUser.id);

      const response = await request.put(`/api/dex/${otherDex.id}/swap-fee`, {
        swapFeeBps: 30,
      });

      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body).toHaveProperty("message");
    });
  });
});
