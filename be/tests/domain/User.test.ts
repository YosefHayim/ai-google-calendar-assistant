import { describe, it, expect, beforeEach } from "@jest/globals";
import { User, type UserProfile, type UserPreferences } from "../../domain/entities/User";

describe("User Entity", () => {
  describe("Constructor and Validation", () => {
    it("should create a valid user", () => {
      const profile: UserProfile = {
        firstName: "John",
        lastName: "Doe",
        displayName: "John D.",
        language: "en",
      };

      const preferences: UserPreferences = {
        defaultTimeZone: "America/New_York",
        notificationsEnabled: true,
        emailNotifications: true,
      };

      const user = new User("user-1", "john@example.com", profile, preferences);

      expect(user.id).toBe("user-1");
      expect(user.email).toBe("john@example.com");
      expect(user.profile.firstName).toBe("John");
      expect(user.preferences.defaultTimeZone).toBe("America/New_York");
      expect(user.isActive).toBe(true);
    });

    it("should create user with minimal profile", () => {
      const profile: UserProfile = {};

      const preferences: UserPreferences = {
        defaultTimeZone: "UTC",
        notificationsEnabled: false,
        emailNotifications: false,
      };

      const user = new User("user-1", "test@example.com", profile, preferences);

      expect(user.profile.firstName).toBeUndefined();
      expect(user.profile.lastName).toBeUndefined();
    });

    it("should throw error for empty user ID", () => {
      const profile: UserProfile = {};
      const preferences: UserPreferences = {
        defaultTimeZone: "UTC",
        notificationsEnabled: false,
        emailNotifications: false,
      };

      expect(() => {
        new User("", "test@example.com", profile, preferences);
      }).toThrow("User ID is required");
    });

    it("should throw error for invalid email", () => {
      const profile: UserProfile = {};
      const preferences: UserPreferences = {
        defaultTimeZone: "UTC",
        notificationsEnabled: false,
        emailNotifications: false,
      };

      expect(() => {
        new User("user-1", "invalid-email", profile, preferences);
      }).toThrow("Valid email is required");
    });

    it("should throw error for empty timezone", () => {
      const profile: UserProfile = {};
      const preferences: UserPreferences = {
        defaultTimeZone: "",
        notificationsEnabled: false,
        emailNotifications: false,
      };

      expect(() => {
        new User("user-1", "test@example.com", profile, preferences);
      }).toThrow("Default timezone is required");
    });

    it("should throw error for invalid timezone format", () => {
      const profile: UserProfile = {};
      const preferences: UserPreferences = {
        defaultTimeZone: "Invalid/Timezone!",
        notificationsEnabled: false,
        emailNotifications: false,
      };

      expect(() => {
        new User("user-1", "test@example.com", profile, preferences);
      }).toThrow("Invalid timezone format");
    });

    it("should accept valid timezone formats", () => {
      const validTimezones = ["UTC", "GMT", "GMT+5", "America/New_York", "Europe/London"];

      for (const tz of validTimezones) {
        const preferences: UserPreferences = {
          defaultTimeZone: tz,
          notificationsEnabled: false,
          emailNotifications: false,
        };

        const user = new User(`user-${tz}`, "test@example.com", {}, preferences);
        expect(user.preferences.defaultTimeZone).toBe(tz);
      }
    });

    it("should throw error for invalid language code", () => {
      const profile: UserProfile = {
        language: "invalid",
      };

      const preferences: UserPreferences = {
        defaultTimeZone: "UTC",
        notificationsEnabled: false,
        emailNotifications: false,
      };

      expect(() => {
        new User("user-1", "test@example.com", profile, preferences);
      }).toThrow("Invalid language code");
    });

    it("should accept valid language codes", () => {
      const validLanguages = ["en", "es", "fr", "de", "en-US", "es-MX"];

      for (const lang of validLanguages) {
        const profile: UserProfile = { language: lang };
        const preferences: UserPreferences = {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        };

        const user = new User(`user-${lang}`, "test@example.com", profile, preferences);
        expect(user.profile.language).toBe(lang);
      }
    });

    it("should throw error for negative reminder minutes", () => {
      const profile: UserProfile = {};
      const preferences: UserPreferences = {
        defaultTimeZone: "UTC",
        notificationsEnabled: true,
        emailNotifications: true,
        reminderDefaults: [
          {
            method: "email",
            minutes: -10,
          },
        ],
      };

      expect(() => {
        new User("user-1", "test@example.com", profile, preferences);
      }).toThrow("Reminder minutes cannot be negative");
    });

    it("should accept valid reminder defaults", () => {
      const preferences: UserPreferences = {
        defaultTimeZone: "UTC",
        notificationsEnabled: true,
        emailNotifications: true,
        reminderDefaults: [
          { method: "email", minutes: 30 },
          { method: "popup", minutes: 10 },
        ],
      };

      const user = new User("user-1", "test@example.com", {}, preferences);

      expect(user.preferences.reminderDefaults).toHaveLength(2);
      expect(user.preferences.reminderDefaults?.[0].minutes).toBe(30);
    });
  });

  describe("Email Updates", () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        "user-1",
        "original@example.com",
        {},
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );
    });

    it("should update email address", () => {
      user.updateEmail("new@example.com");

      expect(user.email).toBe("new@example.com");
      expect(user.updatedAt).toBeDefined();
    });

    it("should throw error for invalid email", () => {
      expect(() => {
        user.updateEmail("invalid-email");
      }).toThrow("Invalid email address");
    });
  });

  describe("Profile Updates", () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        "user-1",
        "test@example.com",
        { firstName: "John" },
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );
    });

    it("should update profile information", () => {
      user.updateProfile({
        lastName: "Doe",
        displayName: "John Doe",
      });

      expect(user.profile.firstName).toBe("John");
      expect(user.profile.lastName).toBe("Doe");
      expect(user.profile.displayName).toBe("John Doe");
      expect(user.updatedAt).toBeDefined();
    });

    it("should update language code", () => {
      user.updateProfile({ language: "es" });

      expect(user.profile.language).toBe("es");
    });

    it("should throw error for invalid language code", () => {
      expect(() => {
        user.updateProfile({ language: "invalid" });
      }).toThrow("Invalid language code");
    });

    it("should merge profile updates", () => {
      user.updateProfile({ lastName: "Smith" });

      expect(user.profile.firstName).toBe("John");
      expect(user.profile.lastName).toBe("Smith");
    });
  });

  describe("Preferences Updates", () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        "user-1",
        "test@example.com",
        {},
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );
    });

    it("should update preferences", () => {
      user.updatePreferences({
        notificationsEnabled: true,
        defaultCalendarId: "cal-123",
      });

      expect(user.preferences.notificationsEnabled).toBe(true);
      expect(user.preferences.defaultCalendarId).toBe("cal-123");
      expect(user.updatedAt).toBeDefined();
    });

    it("should update timezone", () => {
      user.updatePreferences({ defaultTimeZone: "America/New_York" });

      expect(user.preferences.defaultTimeZone).toBe("America/New_York");
    });

    it("should throw error for invalid timezone", () => {
      expect(() => {
        user.updatePreferences({ defaultTimeZone: "Invalid/Zone!" });
      }).toThrow("Invalid timezone format");
    });

    it("should update reminder defaults", () => {
      user.updatePreferences({
        reminderDefaults: [{ method: "email", minutes: 15 }],
      });

      expect(user.preferences.reminderDefaults).toHaveLength(1);
      expect(user.preferences.reminderDefaults?.[0].minutes).toBe(15);
    });

    it("should throw error for negative reminder minutes", () => {
      expect(() => {
        user.updatePreferences({
          reminderDefaults: [{ method: "popup", minutes: -5 }],
        });
      }).toThrow("Reminder minutes cannot be negative");
    });
  });

  describe("Account Management", () => {
    let user: User;

    beforeEach(() => {
      user = new User(
        "user-1",
        "test@example.com",
        {},
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );
    });

    it("should record login", () => {
      user.recordLogin();

      expect(user.lastLoginAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it("should deactivate user", () => {
      user.deactivate();

      expect(user.isActive).toBe(false);
      expect(user.updatedAt).toBeDefined();
    });

    it("should reactivate user", () => {
      user.deactivate();
      user.reactivate();

      expect(user.isActive).toBe(true);
    });
  });

  describe("Display Name Logic", () => {
    it("should return displayName if set", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        { displayName: "Johnny" },
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      expect(user.getDisplayName()).toBe("Johnny");
    });

    it("should return full name if displayName not set", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        { firstName: "John", lastName: "Doe" },
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      expect(user.getDisplayName()).toBe("John Doe");
    });

    it("should return firstName if no lastName or displayName", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        { firstName: "John" },
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      expect(user.getDisplayName()).toBe("John");
    });

    it("should return email if no name fields set", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        {},
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      expect(user.getDisplayName()).toBe("test@example.com");
    });
  });

  describe("Full Name Logic", () => {
    it("should return full name when both names set", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        { firstName: "John", lastName: "Doe" },
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      expect(user.getFullName()).toBe("John Doe");
    });

    it("should return firstName if no lastName", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        { firstName: "John" },
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      expect(user.getFullName()).toBe("John");
    });

    it("should return undefined if no names set", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        {},
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      expect(user.getFullName()).toBeUndefined();
    });
  });

  describe("Profile Completion", () => {
    it("should return true for complete profile", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        {
          firstName: "John",
          lastName: "Doe",
          displayName: "John D.",
        },
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      expect(user.hasCompleteProfile()).toBe(true);
    });

    it("should return false for incomplete profile", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        { firstName: "John" },
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      expect(user.hasCompleteProfile()).toBe(false);
    });
  });

  describe("Recent Activity", () => {
    it("should return true for recent login", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        {},
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      user.recordLogin();

      expect(user.isRecentlyActive()).toBe(true);
    });

    it("should return false for old login", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        {},
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
        true,
        undefined,
        undefined,
        new Date("2020-01-01"),
      );

      expect(user.isRecentlyActive()).toBe(false);
    });

    it("should return false if never logged in", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        {},
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      expect(user.isRecentlyActive()).toBe(false);
    });
  });

  describe("Account Age", () => {
    it("should calculate account age in days", () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const user = new User(
        "user-1",
        "test@example.com",
        {},
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
        true,
        thirtyDaysAgo,
      );

      const age = user.getAccountAgeDays();
      expect(age).toBeGreaterThanOrEqual(29);
      expect(age).toBeLessThanOrEqual(31);
    });

    it("should return undefined if no creation date", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        {},
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      expect(user.getAccountAgeDays()).toBeUndefined();
    });
  });

  describe("Cloning", () => {
    it("should clone user with new ID and email", () => {
      const original = new User(
        "user-1",
        "original@example.com",
        {
          firstName: "John",
          lastName: "Doe",
        },
        {
          defaultTimeZone: "America/New_York",
          notificationsEnabled: true,
          emailNotifications: true,
        },
        true,
        new Date("2024-01-01"),
      );

      const cloned = original.clone("user-2", "cloned@example.com");

      expect(cloned.id).toBe("user-2");
      expect(cloned.email).toBe("cloned@example.com");
      expect(cloned.profile.firstName).toBe("John");
      expect(cloned.preferences.defaultTimeZone).toBe("America/New_York");
      expect(cloned.isActive).toBe(true);
      expect(cloned.lastLoginAt).toBeUndefined();
    });

    it("should deep copy profile and preferences", () => {
      const original = new User(
        "user-1",
        "test@example.com",
        { firstName: "John" },
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
      );

      const cloned = original.clone("user-2", "cloned@example.com");

      cloned.updateProfile({ firstName: "Jane" });

      expect(original.profile.firstName).toBe("John");
      expect(cloned.profile.firstName).toBe("Jane");
    });
  });

  describe("Serialization", () => {
    it("should convert to plain object", () => {
      const user = new User(
        "user-1",
        "test@example.com",
        { firstName: "John" },
        {
          defaultTimeZone: "UTC",
          notificationsEnabled: true,
          emailNotifications: false,
        },
        true,
        new Date("2024-01-01"),
      );

      const obj = user.toObject();

      expect(obj.id).toBe("user-1");
      expect(obj.email).toBe("test@example.com");
      expect(obj.profile.firstName).toBe("John");
      expect(obj.preferences.notificationsEnabled).toBe(true);
    });

    it("should create from plain object", () => {
      const obj = {
        id: "user-1",
        email: "test@example.com",
        profile: { firstName: "John" },
        preferences: {
          defaultTimeZone: "UTC",
          notificationsEnabled: false,
          emailNotifications: false,
        },
        isActive: true,
      };

      const user = User.fromObject(obj);

      expect(user.id).toBe("user-1");
      expect(user.email).toBe("test@example.com");
      expect(user.profile.firstName).toBe("John");
    });

    it("should round-trip through serialization", () => {
      const original = new User(
        "user-1",
        "test@example.com",
        {
          firstName: "John",
          lastName: "Doe",
        },
        {
          defaultTimeZone: "America/New_York",
          notificationsEnabled: true,
          emailNotifications: true,
        },
        true,
        new Date("2024-01-01"),
      );

      const obj = original.toObject();
      const restored = User.fromObject(obj);

      expect(restored.id).toBe(original.id);
      expect(restored.email).toBe(original.email);
      expect(restored.profile).toEqual(original.profile);
      expect(restored.preferences).toEqual(original.preferences);
    });
  });
});
