import { beforeEach, describe, expect, it } from "@jest/globals"
import {
  createMockAgentError,
  createMockAgentResponse,
  MockAgent,
  mockAgentErrors,
  mockAgentFactory,
  mockAgentResponses,
  mockAgentTools,
  mockAuthAgentResponses,
  mockEventAgentResponses,
  resetMockAgentTools,
} from "../../mocks/openai-agents"

describe("OpenAI Agents Mock Factory", () => {
  describe("MockAgent Class", () => {
    let agent: MockAgent

    beforeEach(() => {
      agent = new MockAgent({
        name: "test_agent",
        instructions: "Test instructions",
        model: "gpt-4",
        tools: [],
      })
    })

    it("should create agent with configuration", () => {
      expect(agent.name).toBe("test_agent")
      expect(agent.instructions).toBe("Test instructions")
      expect(agent.model).toBe("gpt-4")
      expect(agent.tools).toEqual([])
    })

    it("should use default model if not specified", () => {
      const defaultAgent = new MockAgent({
        name: "default_agent",
      })

      expect(defaultAgent.model).toBe("gpt-4")
    })

    it("should execute run() method", async () => {
      const result = await agent.run({ input: "test input" })

      expect(result).toBeDefined()
      expect(result.status).toBe("completed")
      expect(result.response).toBeDefined()
    })

    it("should execute invoke() method", async () => {
      const result = await agent.invoke({ input: "test input" })

      expect(result).toBeDefined()
      expect(result.status).toBe("completed")
    })

    it("should support custom mock responses", async () => {
      const customResponse = createMockAgentResponse({
        status: "completed",
        response: "Custom response",
      })

      agent.setMockResponse(customResponse)
      const result = await agent.run({ input: "test" })

      expect(result.response).toBe("Custom response")
    })

    it("should support streaming responses", async () => {
      const stream = agent.stream({ input: "test" })
      const chunks: any[] = []

      for await (const chunk of stream) {
        chunks.push(chunk)
      }

      expect(chunks.length).toBeGreaterThan(0)
      expect(chunks.at(-1).status).toBe("completed")
    })

    it("should include model settings", () => {
      const agentWithSettings = new MockAgent({
        name: "settings_agent",
        modelSettings: {
          toolChoice: "required",
          parallelToolCalls: true,
        },
      })

      expect(agentWithSettings.modelSettings?.toolChoice).toBe("required")
      expect(agentWithSettings.modelSettings?.parallelToolCalls).toBe(true)
    })

    it("should include handoff description", () => {
      const agentWithHandoff = new MockAgent({
        name: "handoff_agent",
        handoffDescription: "Handles user validation",
      })

      expect(agentWithHandoff.handoffDescription).toBe(
        "Handles user validation"
      )
    })
  })

  describe("Mock Response Creation", () => {
    it("should create default mock response", () => {
      const response = createMockAgentResponse()

      expect(response.id).toBeDefined()
      expect(response.status).toBe("completed")
      expect(response.object).toBe("thread.run")
      expect(response.created_at).toBeDefined()
      expect(response.model).toBeDefined()
    })

    it("should create response with overrides", () => {
      const response = createMockAgentResponse({
        status: "failed",
        response: "Error occurred",
      })

      expect(response.status).toBe("failed")
      expect(response.response).toBe("Error occurred")
    })

    it("should include tool calls when specified", () => {
      const response = createMockAgentResponse({
        toolCalls: [
          {
            id: "call_1",
            type: "function",
            function: {
              name: "test_function",
              arguments: JSON.stringify({ param: "value" }),
            },
          },
        ],
      })

      expect(response.toolCalls).toBeDefined()
      expect(response.toolCalls?.length).toBe(1)
      expect(response.toolCalls?.[0].function.name).toBe("test_function")
    })
  })

  describe("Predefined Agent Responses", () => {
    it("should have success response", () => {
      expect(mockAgentResponses.success.status).toBe("completed")
      expect(mockAgentResponses.success.response).toContain("successfully")
    })

    it("should have requires_action response", () => {
      expect(mockAgentResponses.requiresAction.status).toBe("requires_action")
      expect(mockAgentResponses.requiresAction.toolCalls).toBeDefined()
    })

    it("should have failed response", () => {
      expect(mockAgentResponses.failed.status).toBe("failed")
    })

    it("should have in_progress response", () => {
      expect(mockAgentResponses.inProgress.status).toBe("in_progress")
    })
  })

  describe("Event Agent Responses", () => {
    it("should have insert event response", () => {
      const response = mockEventAgentResponses.insertEventSuccess
      const data = JSON.parse(response.response || "{}")

      expect(data.eventId).toBeDefined()
      expect(data.summary).toBeDefined()
      expect(data.start).toBeDefined()
      expect(data.end).toBeDefined()
    })

    it("should have get event response", () => {
      const response = mockEventAgentResponses.getEventSuccess
      const data = JSON.parse(response.response || "{}")

      expect(data.id).toBeDefined()
      expect(data.summary).toBeDefined()
      expect(data.start).toBeDefined()
      expect(data.end).toBeDefined()
    })

    it("should have update event response", () => {
      const response = mockEventAgentResponses.updateEventSuccess
      const data = JSON.parse(response.response || "{}")

      expect(data.id).toBeDefined()
      expect(data.summary).toContain("Updated")
      expect(data.updated).toBeDefined()
    })

    it("should have delete event response", () => {
      const response = mockEventAgentResponses.deleteEventSuccess

      expect(response.response).toContain("deleted successfully")
    })

    it("should have validate event fields response", () => {
      const response = mockEventAgentResponses.validateEventFieldsSuccess
      const data = JSON.parse(response.response || "{}")

      expect(data.isValid).toBe(true)
      expect(data.normalizedEvent).toBeDefined()
    })

    it("should have analyze calendar type response", () => {
      const response = mockEventAgentResponses.analyzeCalendarTypeSuccess
      const data = JSON.parse(response.response || "{}")

      expect(data.calendarType).toBeDefined()
      expect(data.confidence).toBeGreaterThan(0)
      expect(data.reasoning).toBeDefined()
    })
  })

  describe("Auth Agent Responses", () => {
    it("should have validate user success response", () => {
      const response = mockAuthAgentResponses.validateUserSuccess
      const data = JSON.parse(response.response || "{}")

      expect(data.isValid).toBe(true)
      expect(data.user).toBeDefined()
      expect(data.user.email).toBeDefined()
    })

    it("should have validate user failed response", () => {
      const response = mockAuthAgentResponses.validateUserFailed
      const data = JSON.parse(response.response || "{}")

      expect(data.isValid).toBe(false)
      expect(data.error).toBeDefined()
    })

    it("should have register user response", () => {
      const response = mockAuthAgentResponses.registerUserSuccess
      const data = JSON.parse(response.response || "{}")

      expect(data.userId).toBeDefined()
      expect(data.email).toBeDefined()
      expect(data.registered).toBe(true)
    })

    it("should have generate auth URL response", () => {
      const response = mockAuthAgentResponses.generateAuthUrlSuccess
      const data = JSON.parse(response.response || "{}")

      expect(data.authUrl).toContain("https://")
      expect(data.authUrl).toContain("oauth2")
    })
  })

  describe("Agent Factory", () => {
    it("should create success agent", async () => {
      const agent = mockAgentFactory.createSuccessAgent({
        name: "success_test",
      })

      const result = await agent.run({ input: "test" })

      expect(result.status).toBe("completed")
      expect(result.response).toContain("successfully")
    })

    it("should create failure agent", async () => {
      const agent = mockAgentFactory.createFailureAgent({
        name: "failure_test",
      })

      const result = await agent.run({ input: "test" })

      expect(result.status).toBe("failed")
    })

    it("should create requires action agent", async () => {
      const agent = mockAgentFactory.createRequiresActionAgent({
        name: "action_test",
      })

      const result = await agent.run({ input: "test" })

      expect(result.status).toBe("requires_action")
      expect(result.toolCalls).toBeDefined()
    })

    it("should create insert event agent", async () => {
      const agent = mockAgentFactory.createInsertEventAgent({
        name: "insert_event_test",
      })

      const result = await agent.run({ input: "create meeting" })
      const data = JSON.parse(result.response || "{}")

      expect(data.eventId).toBeDefined()
      expect(data.summary).toBeDefined()
    })

    it("should create get event agent", async () => {
      const agent = mockAgentFactory.createGetEventAgent({
        name: "get_event_test",
      })

      const result = await agent.run({ input: "get meeting" })
      const data = JSON.parse(result.response || "{}")

      expect(data.id).toBeDefined()
    })

    it("should create update event agent", async () => {
      const agent = mockAgentFactory.createUpdateEventAgent({
        name: "update_event_test",
      })

      const result = await agent.run({ input: "update meeting" })
      const data = JSON.parse(result.response || "{}")

      expect(data.summary).toContain("Updated")
    })

    it("should create delete event agent", async () => {
      const agent = mockAgentFactory.createDeleteEventAgent({
        name: "delete_event_test",
      })

      const result = await agent.run({ input: "delete meeting" })

      expect(result.response).toContain("deleted")
    })

    it("should create validate user agent (success)", async () => {
      const agent = mockAgentFactory.createValidateUserAgent(
        {
          name: "validate_user_test",
        },
        true
      )

      const result = await agent.run({ input: "validate user" })
      const data = JSON.parse(result.response || "{}")

      expect(data.isValid).toBe(true)
    })

    it("should create validate user agent (failure)", async () => {
      const agent = mockAgentFactory.createValidateUserAgent(
        {
          name: "validate_user_test",
        },
        false
      )

      const result = await agent.run({ input: "validate user" })
      const data = JSON.parse(result.response || "{}")

      expect(data.isValid).toBe(false)
    })

    it("should create register user agent", async () => {
      const agent = mockAgentFactory.createRegisterUserAgent({
        name: "register_user_test",
      })

      const result = await agent.run({ input: "register user" })
      const data = JSON.parse(result.response || "{}")

      expect(data.registered).toBe(true)
    })

    it("should create generate auth URL agent", async () => {
      const agent = mockAgentFactory.createGenerateAuthUrlAgent({
        name: "auth_url_test",
      })

      const result = await agent.run({ input: "generate URL" })
      const data = JSON.parse(result.response || "{}")

      expect(data.authUrl).toBeDefined()
    })

    it("should create analyze calendar type agent", async () => {
      const agent = mockAgentFactory.createAnalyzeCalendarTypeAgent({
        name: "analyze_test",
      })

      const result = await agent.run({ input: "analyze event" })
      const data = JSON.parse(result.response || "{}")

      expect(data.calendarType).toBeDefined()
    })

    it("should create validate event fields agent", async () => {
      const agent = mockAgentFactory.createValidateEventFieldsAgent({
        name: "validate_fields_test",
      })

      const result = await agent.run({ input: "validate event" })
      const data = JSON.parse(result.response || "{}")

      expect(data.isValid).toBe(true)
    })
  })

  describe("Error Scenarios", () => {
    it("should have timeout error", () => {
      const error = mockAgentErrors.timeout

      expect(error).toBeInstanceOf(Error)
      expect(error.message.toLowerCase()).toContain("timed out")
    })

    it("should have rate limit error", () => {
      const error = mockAgentErrors.rateLimitExceeded

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain("Rate limit")
    })

    it("should have invalid input error", () => {
      const error = mockAgentErrors.invalidInput

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain("Invalid input")
    })

    it("should have model unavailable error", () => {
      const error = mockAgentErrors.modelUnavailable

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain("unavailable")
    })

    it("should have authentication failed error", () => {
      const error = mockAgentErrors.authenticationFailed

      expect(error).toBeInstanceOf(Error)
      expect(error.message).toContain("Authentication")
    })

    it("should create specific errors", () => {
      const timeoutError = createMockAgentError("timeout")

      expect(timeoutError.message.toLowerCase()).toContain("timed out")
    })
  })

  describe("Mock Agent Tools", () => {
    beforeEach(() => {
      resetMockAgentTools()
    })

    it("should have all required tools", () => {
      expect(mockAgentTools.validateUser).toBeDefined()
      expect(mockAgentTools.registerUser).toBeDefined()
      expect(mockAgentTools.insertEvent).toBeDefined()
      expect(mockAgentTools.getEvent).toBeDefined()
      expect(mockAgentTools.updateEvent).toBeDefined()
      expect(mockAgentTools.deleteEvent).toBeDefined()
      expect(mockAgentTools.analyzeCalendarType).toBeDefined()
      expect(mockAgentTools.validateEventFields).toBeDefined()
      expect(mockAgentTools.generateAuthUrl).toBeDefined()
      expect(mockAgentTools.getUserTimeZone).toBeDefined()
    })

    it("should allow mocking tool responses", () => {
      mockAgentTools.validateUser.mockReturnValue({
        isValid: true,
        userId: "test-123",
      })

      const result = mockAgentTools.validateUser({ email: "test@example.com" })

      expect(result.isValid).toBe(true)
      expect(result.userId).toBe("test-123")
    })

    it("should track tool calls", () => {
      mockAgentTools.insertEvent({ summary: "Meeting" })

      expect(mockAgentTools.insertEvent).toHaveBeenCalledWith({
        summary: "Meeting",
      })
    })

    it("should reset all tools", () => {
      mockAgentTools.validateUser()
      mockAgentTools.insertEvent()

      expect(mockAgentTools.validateUser).toHaveBeenCalled()

      resetMockAgentTools()

      expect(mockAgentTools.validateUser).not.toHaveBeenCalled()
    })
  })

  describe("Integration Scenarios", () => {
    it("should simulate complete agent workflow", async () => {
      // Create agent
      const agent = mockAgentFactory.createInsertEventAgent({
        name: "workflow_test",
        tools: [mockAgentTools.insertEvent],
      })

      // Execute agent
      const result = await agent.run({
        input: "Create a meeting tomorrow at 2pm",
      })

      // Verify result
      expect(result.status).toBe("completed")
      const data = JSON.parse(result.response || "{}")
      expect(data.eventId).toBeDefined()
    })

    it("should handle agent handoffs", async () => {
      const validateAgent = mockAgentFactory.createValidateUserAgent(
        {
          name: "validate",
          handoffDescription: "Validates user then hands off to event agent",
        },
        true
      )

      const eventAgent = mockAgentFactory.createInsertEventAgent({
        name: "insert_event",
      })

      // Simulate workflow
      const validateResult = await validateAgent.run({
        input: "test@example.com",
      })
      const validateData = JSON.parse(validateResult.response || "{}")

      expect(validateData.isValid).toBe(true)

      const eventResult = await eventAgent.run({ input: "create event" })
      const eventData = JSON.parse(eventResult.response || "{}")

      expect(eventData.eventId).toBeDefined()
    })

    it("should simulate parallel tool calls", async () => {
      const agent = new MockAgent({
        name: "parallel_test",
        modelSettings: {
          parallelToolCalls: true,
        },
      })

      const customResponse = createMockAgentResponse({
        status: "requires_action",
        toolCalls: [
          {
            id: "call_1",
            type: "function",
            function: {
              name: "validateUser",
              arguments: JSON.stringify({ email: "user@example.com" }),
            },
          },
          {
            id: "call_2",
            type: "function",
            function: {
              name: "getEvent",
              arguments: JSON.stringify({ eventId: "event-123" }),
            },
          },
        ],
      })

      agent.setMockResponse(customResponse)
      const result = await agent.run({ input: "test" })

      expect(result.toolCalls?.length).toBe(2)
      expect(agent.modelSettings?.parallelToolCalls).toBe(true)
    })
  })
})
