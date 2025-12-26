import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import type { Response } from "express";
import sendR from "../../utils/http/send-response";

describe("sendR", () => {
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock as unknown as Response["status"],
    };
  });

  describe("success responses", () => {
    it("should send success response with status < 400", () => {
      sendR(res, mockResponse as Response, 200, "Success");

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: undefined,
      });
    });

    it("should send success response with data", () => {
      const testData = { userId: 123, name: "Test User" };
      sendR(res, mockResponse as Response, 201, "Created", testData);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "success",
        message: "Created",
        data: testData,
      });
    });

    it("should handle status 399 as success", () => {
      sendR(res, mockResponse as Response, 399, "Edge case success");

      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ status: "success" }));
    });
  });

  describe("error responses", () => {
    it("should send error response with status >= 400", () => {
      sendR(res, mockResponse as Response, 400, "Bad Request");

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        message: "Bad Request",
        data: undefined,
      });
    });

    it("should send error response with status 404", () => {
      sendR(res, mockResponse as Response, 404, "Not Found");

      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ status: "error" }));
    });

    it("should send error response with status 500", () => {
      sendR(res, mockResponse as Response, 500, "Internal Server Error");

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        message: "Internal Server Error",
        data: undefined,
      });
    });

    it("should send error response with data", () => {
      const errorData = { field: "email", reason: "invalid format" };
      sendR(res, mockResponse as Response, 422, "Validation Error", errorData);

      expect(jsonMock).toHaveBeenCalledWith({
        status: "error",
        message: "Validation Error",
        data: errorData,
      });
    });
  });

  describe("data handling", () => {
    it("should handle null data", () => {
      sendR(res, mockResponse as Response, 200, "Success", null);

      expect(jsonMock).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: null,
      });
    });

    it("should handle array data", () => {
      const arrayData = [1, 2, 3];
      sendR(res, mockResponse as Response, 200, "Success", arrayData);

      expect(jsonMock).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: arrayData,
      });
    });

    it("should handle complex object data", () => {
      const complexData = {
        user: { id: 1, name: "Test" },
        events: [{ id: 1 }, { id: 2 }],
        metadata: { count: 2 },
      };
      sendR(res, mockResponse as Response, 200, "Success", complexData);

      expect(jsonMock).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: complexData,
      });
    });
  });

  describe("edge cases", () => {
    it("should handle boundary status code 400", () => {
      sendR(res, mockResponse as Response, 400, "Boundary error");

      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ status: "error" }));
    });

    it("should handle empty message", () => {
      sendR(res, mockResponse as Response, 200, "");

      expect(jsonMock).toHaveBeenCalledWith({
        status: "success",
        message: "",
        data: undefined,
      });
    });

    it("should handle very long message", () => {
      const longMessage = "a".repeat(1000);
      sendR(res, mockResponse as Response, 200, longMessage);

      expect(jsonMock).toHaveBeenCalledWith({
        status: "success",
        message: longMessage,
        data: undefined,
      });
    });
  });
});
