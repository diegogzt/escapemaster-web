import { vi, describe, it, expect, beforeEach } from "vitest";
import { auth, bookings, rooms, stats, api } from "../api";

describe("API Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("auth", () => {
    it("should call login with correct parameters", async () => {
      vi.spyOn(api, "post").mockResolvedValue({
        data: { access_token: "token" },
      });

      await auth.login("test@example.com", "password");

      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password",
      });
    });

    it("should call me and return user data", async () => {
      const userData = { id: "1", email: "test@example.com" };
      vi.spyOn(api, "get").mockResolvedValue({ data: userData });

      const result = await auth.me();

      expect(api.get).toHaveBeenCalledWith("/auth/me");
      expect(result).toEqual(userData);
    });
  });

  describe("bookings", () => {
    it("should list bookings", async () => {
      const mockBookings = [{ id: "1", room_name: "Room 1" }];
      vi.spyOn(api, "get").mockResolvedValue({ data: mockBookings });

      const result = await bookings.list();

      expect(api.get).toHaveBeenCalledWith("/bookings", { params: undefined });
      expect(result).toEqual(mockBookings);
    });
  });

  describe("rooms", () => {
    it("should list rooms", async () => {
      const mockRooms = [{ id: "1", name: "Room 1" }];
      vi.spyOn(api, "get").mockResolvedValue({ data: mockRooms });

      const result = await rooms.list();

      expect(api.get).toHaveBeenCalledWith("/rooms", { params: undefined });
      expect(result).toEqual(mockRooms);
    });
  });

  describe("stats", () => {
    it("should get summary", async () => {
      const mockSummary = { total_bookings: 10 };
      vi.spyOn(api, "get").mockResolvedValue({ data: mockSummary });

      const result = await stats.getSummary();

      expect(api.get).toHaveBeenCalledWith("/dashboard/summary");
      expect(result).toEqual(mockSummary);
    });

    it("should get bookings chart with period", async () => {
      const mockChart = { labels: [], data: [] };
      vi.spyOn(api, "get").mockResolvedValue({ data: mockChart });

      const result = await stats.getBookingsChart("week");

      expect(api.get).toHaveBeenCalledWith("/dashboard/bookings-chart", {
        params: { period: "week" },
      });
      expect(result).toEqual(mockChart);
    });
  });
});
