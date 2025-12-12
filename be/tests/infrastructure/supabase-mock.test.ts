import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  createMockSupabaseClient,
  createMockSupabaseError,
  createMockSupabaseErrors,
  resetMockDataStore,
  mockUser,
  mockUserCalendarToken,
  mockCalendarCategory,
  mockTelegramLink,
  mockTokenData,
} from "../../__mocks__/supabase";

describe("Supabase Mock Factory", () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
  });

  describe("Authentication", () => {
    it("should get user successfully", async () => {
      const { data, error } = await mockClient.auth.getUser();

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe("test@example.com");
    });

    it("should sign in with OAuth", async () => {
      const { data, error } = await mockClient.auth.signInWithOAuth({
        provider: "google",
      });

      expect(error).toBeNull();
      expect(data.url).toContain("mock-oauth-url");
    });

    it("should sign out", async () => {
      const { error } = await mockClient.auth.signOut();

      expect(error).toBeNull();
    });

    it("should get session", async () => {
      const { data, error } = await mockClient.auth.getSession();

      expect(error).toBeNull();
      expect(data.session?.user).toBeDefined();
    });

    it("should refresh session", async () => {
      const { data, error } = await mockClient.auth.refreshSession();

      expect(error).toBeNull();
      expect(data.session?.access_token).toBe("new-token");
    });
  });

  describe("Query Builder - Select Operations", () => {
    it("should select all rows from a table", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*");

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it("should select with specific columns", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("email,access_token");

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should filter with eq()", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").eq("email", "test@example.com");

      expect(error).toBeNull();
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].email).toBe("test@example.com");
    });

    it("should filter with neq()", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").neq("email", "other@example.com");

      expect(error).toBeNull();
      expect(data.every((row: any) => row.email !== "other@example.com")).toBe(true);
    });

    it("should filter with gt()", async () => {
      const futureDate = Date.now() + 10000;
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").gt("expiry_date", futureDate);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should filter with gte()", async () => {
      const futureDate = Date.now();
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").gte("expiry_date", futureDate);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should filter with lt()", async () => {
      const futureDate = Date.now() + 10000000;
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").lt("expiry_date", futureDate);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should filter with lte()", async () => {
      const futureDate = Date.now() + 10000000;
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").lte("expiry_date", futureDate);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should filter with like()", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").like("email", "%test%");

      expect(error).toBeNull();
      expect(data.length).toBeGreaterThan(0);
    });

    it("should filter with ilike() (case insensitive)", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").ilike("email", "%TEST%");

      expect(error).toBeNull();
      expect(data.length).toBeGreaterThan(0);
    });

    it("should filter with in()", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").in("email", ["test@example.com", "other@example.com"]);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should filter with is()", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").is("is_active", true);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should limit results", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").limit(1);

      expect(error).toBeNull();
      expect(data.length).toBeLessThanOrEqual(1);
    });

    it("should return single row with single()", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").eq("email", "test@example.com").single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.email).toBe("test@example.com");
    });

    it("should return error when single() finds no rows", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").eq("email", "nonexistent@example.com").single();

      expect(error).toBeDefined();
      expect(error?.code).toBe("PGRST116");
      expect(data).toBeNull();
    });

    it("should return null with maybeSingle() when no rows found", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").eq("email", "nonexistent@example.com").maybeSingle();

      expect(error).toBeNull();
      expect(data).toBeNull();
    });

    it("should chain multiple filters", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").eq("email", "test@example.com").eq("is_active", true);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("Query Builder - Insert Operations", () => {
    it("should insert a new row", async () => {
      const newToken = {
        user_id: "new-user-id",
        email: "newuser@example.com",
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
      };

      const { data, error } = await mockClient.from("user_calendar_tokens").insert(newToken);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.email).toBe("newuser@example.com");
      expect(data.id).toBeDefined();
      expect(data.created_at).toBeDefined();
      expect(data.updated_at).toBeDefined();
    });

    it("should auto-generate id for new rows", async () => {
      const newCategory = {
        calendar_id: "calendar-2",
        calendar_name: "Work Calendar",
        email: "test@example.com",
      };

      const { data, error } = await mockClient.from("calendar_categories").insert(newCategory);

      expect(error).toBeNull();
      expect(data.id).toBeDefined();
      expect(typeof data.id).toBe("number");
    });

    it("should preserve custom id if provided", async () => {
      const newCategory = {
        id: 999,
        calendar_id: "calendar-3",
        calendar_name: "Personal Calendar",
        email: "test@example.com",
      };

      const { data, error } = await mockClient.from("calendar_categories").insert(newCategory);

      expect(error).toBeNull();
      expect(data.id).toBe(999);
    });
  });

  describe("Query Builder - Update Operations", () => {
    it("should update matching rows", async () => {
      const updates = {
        access_token: "updated-access-token",
        is_active: false,
      };

      const { data, error } = await mockClient.from("user_calendar_tokens").update(updates).eq("email", "test@example.com");

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].access_token).toBe("updated-access-token");
      expect(data[0].is_active).toBe(false);
      expect(data[0].updated_at).toBeDefined();
    });

    it("should update multiple rows", async () => {
      // Insert another row first
      await mockClient.from("user_calendar_tokens").insert({
        user_id: "user-2",
        email: "user2@example.com",
        access_token: "token-2",
      });

      const { data, error } = await mockClient.from("user_calendar_tokens").update({ is_active: false }).neq("id", 0);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it("should return empty array when no rows match", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").update({ is_active: false }).eq("email", "nonexistent@example.com");

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it("should update with multiple filters", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").update({ is_active: true }).eq("email", "test@example.com").eq("is_active", false);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe("Query Builder - Delete Operations", () => {
    it("should delete matching rows", async () => {
      // Insert a row to delete
      await mockClient.from("user_calendar_tokens").insert({
        user_id: "delete-test-user",
        email: "delete@example.com",
        access_token: "token",
      });

      const { data, error } = await mockClient.from("user_calendar_tokens").delete().eq("email", "delete@example.com");

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Verify deletion
      const { data: checkData } = await mockClient.from("user_calendar_tokens").select("*").eq("email", "delete@example.com");
      expect(checkData?.length).toBe(0);
    });

    it("should delete multiple rows", async () => {
      // Insert multiple rows
      await mockClient.from("calendar_categories").insert({
        calendar_id: "calendar-delete-1",
        calendar_name: "Delete 1",
        email: "test@example.com",
      });

      await mockClient.from("calendar_categories").insert({
        calendar_id: "calendar-delete-2",
        calendar_name: "Delete 2",
        email: "test@example.com",
      });

      const { data, error } = await mockClient.from("calendar_categories").delete().eq("email", "test@example.com");

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it("should return empty array when no rows match delete", async () => {
      const { data, error } = await mockClient.from("user_calendar_tokens").delete().eq("email", "nonexistent@example.com");

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });
  });

  describe("Mock Data", () => {
    it("should have valid user data", () => {
      expect(mockUser.id).toBeDefined();
      expect(mockUser.email).toBeDefined();
      expect(mockUser.created_at).toBeDefined();
    });

    it("should have valid token data", () => {
      expect(mockTokenData.access_token).toBeDefined();
      expect(mockTokenData.refresh_token).toBeDefined();
      expect(mockTokenData.token_type).toBe("Bearer");
      expect(mockTokenData.expiry_date).toBeGreaterThan(Date.now());
    });

    it("should have valid calendar token data", () => {
      expect(mockUserCalendarToken.user_id).toBeDefined();
      expect(mockUserCalendarToken.email).toBeDefined();
      expect(mockUserCalendarToken.access_token).toBeDefined();
      expect(mockUserCalendarToken.is_active).toBe(true);
    });

    it("should have valid calendar category data", () => {
      expect(mockCalendarCategory.calendar_id).toBeDefined();
      expect(mockCalendarCategory.calendar_name).toBeDefined();
      expect(mockCalendarCategory.access_role).toBeDefined();
    });

    it("should have valid telegram link data", () => {
      expect(mockTelegramLink.email).toBeDefined();
      expect(mockTelegramLink.chat_id).toBeDefined();
      expect(mockTelegramLink.username).toBeDefined();
    });
  });

  describe("Error Scenarios", () => {
    it("should have all standard error types", () => {
      const errors = createMockSupabaseErrors();

      expect(errors.notFound.code).toBe("PGRST116");
      expect(errors.uniqueViolation.code).toBe("23505");
      expect(errors.foreignKeyViolation.code).toBe("23503");
      expect(errors.checkViolation.code).toBe("23514");
      expect(errors.connectionError.code).toBe("CONNECTION_ERROR");
      expect(errors.permissionDenied.code).toBe("42501");
      expect(errors.invalidInput.code).toBe("22P02");
    });

    it("should create specific error objects", () => {
      const notFoundError = createMockSupabaseError("notFound");

      expect(notFoundError.message).toBe("No rows found");
      expect(notFoundError.code).toBe("PGRST116");
      expect(notFoundError.details).toBeDefined();
    });

    it("should handle unique violation errors", () => {
      const uniqueError = createMockSupabaseError("uniqueViolation");

      expect(uniqueError.code).toBe("23505");
      expect(uniqueError.message).toContain("unique constraint");
    });

    it("should handle foreign key violation errors", () => {
      const fkError = createMockSupabaseError("foreignKeyViolation");

      expect(fkError.code).toBe("23503");
      expect(fkError.message).toContain("foreign key constraint");
    });

    it("should handle connection errors", () => {
      const connError = createMockSupabaseError("connectionError");

      expect(connError.code).toBe("CONNECTION_ERROR");
      expect(connError.message).toContain("Failed to connect");
    });

    it("should handle permission denied errors", () => {
      const permError = createMockSupabaseError("permissionDenied");

      expect(permError.code).toBe("42501");
      expect(permError.message).toContain("permission denied");
    });
  });

  describe("Data Store Management", () => {
    it("should persist data across queries", async () => {
      const newUser = {
        user_id: "persist-test",
        email: "persist@example.com",
        access_token: "persist-token",
      };

      await mockClient.from("user_calendar_tokens").insert(newUser);

      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").eq("email", "persist@example.com");

      expect(error).toBeNull();
      expect(data.length).toBe(1);
      expect(data[0].email).toBe("persist@example.com");
    });

    it("should reset data store", async () => {
      // Add some data
      await mockClient.from("user_calendar_tokens").insert({
        user_id: "reset-test",
        email: "reset@example.com",
        access_token: "reset-token",
      });

      // Reset
      resetMockDataStore(mockClient);

      // Verify reset
      const { data, error } = await mockClient.from("user_calendar_tokens").select("*").eq("email", "reset@example.com");

      expect(error).toBeNull();
      expect(data?.length).toBe(0);

      // Verify default data is restored
      const { data: defaultData } = await mockClient.from("user_calendar_tokens").select("*").eq("email", "test@example.com");

      expect(defaultData?.length).toBe(1);
    });

    it("should support multiple tables independently", async () => {
      const tokenCount = (await mockClient.from("user_calendar_tokens").select("*")).data?.length;
      const categoryCount = (await mockClient.from("calendar_categories").select("*")).data?.length;

      expect(tokenCount).toBeGreaterThan(0);
      expect(categoryCount).toBeGreaterThan(0);

      // Add to one table
      await mockClient.from("user_calendar_tokens").insert({
        user_id: "multi-table-test",
        email: "multi@example.com",
        access_token: "token",
      });

      // Other table should not be affected
      const newCategoryCount = (await mockClient.from("calendar_categories").select("*")).data?.length;
      expect(newCategoryCount).toBe(categoryCount);
    });
  });

  describe("Storage API", () => {
    it("should have storage.from() method", () => {
      expect(mockClient.storage.from).toBeDefined();
      expect(typeof mockClient.storage.from).toBe("function");
    });

    it("should provide upload method", () => {
      const bucket = mockClient.storage.from("avatars");
      expect(bucket.upload).toBeDefined();
    });

    it("should provide download method", () => {
      const bucket = mockClient.storage.from("avatars");
      expect(bucket.download).toBeDefined();
    });

    it("should provide remove method", () => {
      const bucket = mockClient.storage.from("avatars");
      expect(bucket.remove).toBeDefined();
    });

    it("should provide list method", () => {
      const bucket = mockClient.storage.from("avatars");
      expect(bucket.list).toBeDefined();
    });

    it("should provide getPublicUrl method", () => {
      const bucket = mockClient.storage.from("avatars");
      expect(bucket.getPublicUrl).toBeDefined();
    });
  });

  describe("RPC Methods", () => {
    it("should have rpc method", () => {
      expect(mockClient.rpc).toBeDefined();
      expect(typeof mockClient.rpc).toBe("function");
    });
  });
});
