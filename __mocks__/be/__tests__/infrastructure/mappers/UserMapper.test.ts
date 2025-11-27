import { describe, it, expect } from "@jest/globals";
import { UserMapper } from "@/infrastructure/repositories/mappers/UserMapper";
import { User } from "@/domain/entities/User";
import type { Database } from "@/database.types.new";

type UserRow = Database["public"]["Tables"]["users"]["Row"];

describe("UserMapper", () => {
  describe("toDomain", () => {
    it("should map Supabase user row to domain User entity", () => {
      const row: UserRow = {
        user_id: "user-123",
        email: "test@example.com",
        is_active: true,
        metadata: {
          profile: {
            firstName: "John",
            lastName: "Doe",
          },
          preferences: {
            defaultTimeZone: "America/New_York",
            notificationsEnabled: true,
          },
          lastLoginAt: "2024-01-15T10:00:00Z",
        },
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      };

      const user = UserMapper.toDomain(row);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe("user-123");
      expect(user.email).toBe("test@example.com");
      expect(user.isActive).toBe(true);
      expect(user.profile.firstName).toBe("John");
      expect(user.profile.lastName).toBe("Doe");
      expect(user.preferences.defaultTimeZone).toBe("America/New_York");
      expect(user.preferences.notificationsEnabled).toBe(true);
    });

    it("should handle row with null metadata", () => {
      const row: UserRow = {
        user_id: "user-123",
        email: "test@example.com",
        is_active: true,
        metadata: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: null,
      };

      const user = UserMapper.toDomain(row);

      expect(user).toBeInstanceOf(User);
      expect(user.profile.firstName).toBeUndefined();
      expect(user.preferences.defaultTimeZone).toBe("UTC");
      expect(user.preferences.notificationsEnabled).toBe(true);
    });

    it("should handle row with empty metadata", () => {
      const row: UserRow = {
        user_id: "user-123",
        email: "test@example.com",
        is_active: false,
        metadata: {},
        created_at: "2024-01-01T00:00:00Z",
        updated_at: null,
      };

      const user = UserMapper.toDomain(row);

      expect(user.isActive).toBe(false);
      expect(user.preferences.emailNotifications).toBe(true);
    });
  });

  describe("toInsert", () => {
    it("should map domain User to Supabase insert format", () => {
      const user = new User(
        "user-123",
        "test@example.com",
        { firstName: "John", lastName: "Doe" },
        { defaultTimeZone: "America/New_York", notificationsEnabled: true },
        true,
        new Date("2024-01-01T00:00:00Z"),
        new Date("2024-01-15T10:00:00Z"),
        new Date("2024-01-15T10:00:00Z"),
      );

      const insert = UserMapper.toInsert(user);

      expect(insert.user_id).toBe("user-123");
      expect(insert.email).toBe("test@example.com");
      expect(insert.is_active).toBe(true);
      expect(typeof insert.created_at).toBe("string");
      expect(typeof insert.updated_at).toBe("string");
    });

    it("should handle user without dates", () => {
      const user = new User(
        "user-123",
        "test@example.com",
        {},
        { defaultTimeZone: "UTC" },
        true,
      );

      const insert = UserMapper.toInsert(user);

      expect(insert.user_id).toBe("user-123");
      expect(typeof insert.created_at).toBe("string");
      expect(typeof insert.updated_at).toBe("string");
    });
  });

  describe("toUpdate", () => {
    it("should map domain User to Supabase update format", () => {
      const user = new User(
        "user-123",
        "updated@example.com",
        { firstName: "Jane" },
        { defaultTimeZone: "Europe/London" },
        false,
      );

      const update = UserMapper.toUpdate(user);

      expect(update.email).toBe("updated@example.com");
      expect(update.is_active).toBe(false);
      expect(typeof update.updated_at).toBe("string");
    });
  });

  describe("toPartialUpdate", () => {
    it("should map partial User updates", () => {
      const updates: Partial<User> = {
        email: "new@example.com",
        isActive: false,
      };

      const partialUpdate = UserMapper.toPartialUpdate(updates);

      expect(partialUpdate.email).toBe("new@example.com");
      expect(partialUpdate.is_active).toBe(false);
      expect(typeof partialUpdate.updated_at).toBe("string");
    });

    it("should handle profile updates", () => {
      const updates = {
        profile: { firstName: "Updated" },
      };

      const partialUpdate = UserMapper.toPartialUpdate(updates);

      expect(typeof partialUpdate.updated_at).toBe("string");
    });

    it("should handle preferences updates", () => {
      const updates = {
        preferences: { defaultTimeZone: "Asia/Tokyo" },
      };

      const partialUpdate = UserMapper.toPartialUpdate(updates);

      expect(typeof partialUpdate.updated_at).toBe("string");
    });

    it("should handle lastLoginAt updates", () => {
      const updates = {
        lastLoginAt: new Date("2024-01-20T10:00:00Z"),
      };

      const partialUpdate = UserMapper.toPartialUpdate(updates);

      expect(typeof partialUpdate.updated_at).toBe("string");
    });

    it("should merge with current metadata", () => {
      const updates = {
        profile: { firstName: "New" },
      };

      const currentMetadata = {
        profile: { firstName: "Old", lastName: "Smith" },
      };

      const partialUpdate = UserMapper.toPartialUpdate(updates, currentMetadata);

      expect(typeof partialUpdate.updated_at).toBe("string");
    });
  });

  describe("toDomainArray", () => {
    it("should map array of rows to domain entities", () => {
      const rows: UserRow[] = [
        {
          user_id: "user-1",
          email: "user1@example.com",
          is_active: true,
          metadata: null,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: null,
        },
        {
          user_id: "user-2",
          email: "user2@example.com",
          is_active: true,
          metadata: null,
          created_at: "2024-01-02T00:00:00Z",
          updated_at: null,
        },
      ];

      const users = UserMapper.toDomainArray(rows);

      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[1]).toBeInstanceOf(User);
      expect(users[0].id).toBe("user-1");
      expect(users[1].id).toBe("user-2");
    });

    it("should return empty array for empty input", () => {
      const users = UserMapper.toDomainArray([]);
      expect(users).toHaveLength(0);
    });
  });
});
