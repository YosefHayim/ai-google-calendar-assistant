#!/usr/bin/env node

/**
 * Sync tasks from markdown files to tasks.json
 * Parses task-breakdown-routine-router.md and task-breakdown-schedule-statistics.md
 * and ensures all tasks are properly added/updated in tasks.json
 */

import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TASKS_JSON_PATH = path.join(__dirname, "../tasks/tasks.json");
const ROUTINE_ROUTER_MD = path.join(__dirname, "../docs/task-breakdown-routine-router.md");
const SCHEDULE_STATS_MD = path.join(__dirname, "../docs/task-breakdown-schedule-statistics.md");

// Parse markdown task from routine-router format
function parseTaskFromMarkdown(content, taskId) {
  // Try different patterns
  const patterns = [
    new RegExp(`\\*\\*Task ${taskId}:([^\\*]+)\\*\\*\\s*\\n\\s*\\n([\\s\\S]*?)(?=\\*\\*Task|###|$)`, "i"),
    new RegExp(`\\*\\*Task ${taskId}:\\s*([^\\n]+)\\n([\\s\\S]*?)(?=\\*\\*Task|###|$)`, "i"),
    new RegExp(`Task ${taskId}:\\s*([^\\n]+)\\n([\\s\\S]*?)(?=Task \\d+|###|$)`, "i"),
  ];

  let match = null;
  for (const pattern of patterns) {
    match = content.match(pattern);
    if (match) break;
  }

  if (!match) return null;

  const title = match[1].trim();
  const details = match[2] || "";

  // Extract priority
  const priorityMatch = details.match(/-\\s*Priority:\\s*(high|medium|low)/i);
  const priority = priorityMatch ? priorityMatch[1].toLowerCase() : "medium";

  // Extract dependencies
  const depMatch = details.match(/-\\s*Dependencies:\\s*\\[(.*?)\\]/);
  const dependencies = depMatch
    ? depMatch[1]
        .split(",")
        .map((d) => parseInt(d.trim()))
        .filter((d) => !isNaN(d))
    : [];

  // Extract details (multiline, until next - or end)
  const detailsMatch = details.match(/-\\s*Details:\\s*([^\\n]+(?:\\n(?!-\\s*(?:Priority|Dependencies|Test|$))[^\\n]+)*)/);
  const taskDetails = detailsMatch ? detailsMatch[1].trim().replace(/\n\s*\n/g, "\n") : "";

  // Extract test strategy
  const testMatch = details.match(/-\\s*Test[^:]*:\\s*([^\\n]+(?:\\n(?!-\\s*)[^\\n]+)*)/);
  const testStrategy = testMatch ? testMatch[1].trim().replace(/\n\s*\n/g, "\n") : "";

  return {
    id: taskId,
    title: title,
    description: title,
    status: "pending",
    priority: priority,
    dependencies: dependencies,
    details: taskDetails,
    testStrategy: testStrategy,
    subtasks: [],
  };
}

// Parse schedule statistics markdown
function parseScheduleStatsTask(content, taskId) {
  const taskRegex = new RegExp(`#### Task ${taskId}:([^\\n]+)\\n\\s*\\n([\\s\\S]*?)(?=#### Task|### Phase|$)`, "i");
  const match = content.match(taskRegex);

  if (!match) return null;

  const title = match[1].trim();
  const details = match[2];

  // Extract status
  const statusMatch = details.match(/-\\s*\\*\\*Status\\*\\*:\\s*(pending|done|in-progress)/i);
  const status = statusMatch ? statusMatch[1].toLowerCase() : "pending";

  // Extract priority
  const priorityMatch = details.match(/-\\s*\\*\\*Priority\\*\\*:\\s*(high|medium|low)/i);
  const priority = priorityMatch ? priorityMatch[1].toLowerCase() : "medium";

  // Extract dependencies
  const depMatch = details.match(/-\\s*\\*\\*Dependencies\\*\\*:\\s*\\[(.*?)\\]/);
  const dependencies = depMatch
    ? depMatch[1]
        .split(",")
        .map((d) => parseInt(d.trim()))
        .filter((d) => !isNaN(d))
    : [];

  // Extract details (multiline)
  const detailsMatch = details.match(/-\\s*\\*\\*Details\\*\\*:\\s*([^\\n]+(?:\\n(?!-\\s*\\*\\*)[^\\n]+)*)/);
  const taskDetails = detailsMatch ? detailsMatch[1].trim() : "";

  // Extract test strategy
  const testMatch = details.match(/-\\s*\\*\\*Test Strategy\\*\\*:\\s*([^\\n]+(?:\\n(?!-\\s*\\*\\*)[^\\n]+)*)/);
  const testStrategy = testMatch ? testMatch[1].trim() : "";

  return {
    id: taskId,
    title: title,
    description: title,
    status: status,
    priority: priority,
    dependencies: dependencies,
    details: taskDetails,
    testStrategy: testStrategy,
    subtasks: [],
  };
}

// Main function
function main() {
  console.log("Reading tasks.json...");
  const tasksData = JSON.parse(fs.readFileSync(TASKS_JSON_PATH, "utf8"));
  const masterTasks = tasksData.tags.master.tasks;

  console.log("Reading markdown files...");
  const routineRouterContent = fs.readFileSync(ROUTINE_ROUTER_MD, "utf8");
  const scheduleStatsContent = fs.readFileSync(SCHEDULE_STATS_MD, "utf8");

  // Create a map of existing tasks by ID
  const existingTasksMap = new Map();
  masterTasks.forEach((task) => {
    existingTasksMap.set(task.id, task);
  });

  let updated = 0;
  let added = 0;

  // Parse tasks 8-45 from routine-router markdown
  console.log("Parsing tasks 8-45 from routine-router markdown...");
  for (let taskId = 8; taskId <= 45; taskId++) {
    const parsedTask = parseTaskFromMarkdown(routineRouterContent, taskId);
    if (parsedTask) {
      if (existingTasksMap.has(taskId)) {
        // Update existing task - always update from markdown as source of truth
        const existing = existingTasksMap.get(taskId);
        let taskUpdated = false;
        
        // Update details if markdown has content
        if (parsedTask.details && parsedTask.details.trim()) {
          existing.details = parsedTask.details;
          taskUpdated = true;
        }
        
        // Update test strategy if markdown has content
        if (parsedTask.testStrategy && parsedTask.testStrategy.trim()) {
          existing.testStrategy = parsedTask.testStrategy;
          taskUpdated = true;
        }
        
        // Always update priority from markdown
        if (parsedTask.priority && parsedTask.priority !== existing.priority) {
          existing.priority = parsedTask.priority;
          taskUpdated = true;
        }
        
        // Always update dependencies from markdown
        const existingDeps = (existing.dependencies || []).sort();
        const newDeps = parsedTask.dependencies.sort();
        if (JSON.stringify(existingDeps) !== JSON.stringify(newDeps)) {
          existing.dependencies = parsedTask.dependencies;
          taskUpdated = true;
        }
        
        // Update title if different (case-insensitive)
        if (parsedTask.title && parsedTask.title.toLowerCase() !== existing.title.toLowerCase()) {
          existing.title = parsedTask.title;
          taskUpdated = true;
        }
        
        if (taskUpdated) updated++;
      } else {
        // Add new task
        masterTasks.push(parsedTask);
        existingTasksMap.set(taskId, parsedTask);
        added++;
      }
    }
  }

  // Parse tasks 46-60 from schedule-statistics markdown
  console.log("Parsing tasks 46-60 from schedule-statistics markdown...");
  for (let taskId = 46; taskId <= 60; taskId++) {
    const parsedTask = parseScheduleStatsTask(scheduleStatsContent, taskId);
    if (parsedTask) {
      if (existingTasksMap.has(taskId)) {
        // Update existing task - always update from markdown as source of truth
        const existing = existingTasksMap.get(taskId);
        let taskUpdated = false;
        
        // Update details if markdown has content
        if (parsedTask.details && parsedTask.details.trim()) {
          existing.details = parsedTask.details;
          taskUpdated = true;
        }
        
        // Update test strategy if markdown has content
        if (parsedTask.testStrategy && parsedTask.testStrategy.trim()) {
          existing.testStrategy = parsedTask.testStrategy;
          taskUpdated = true;
        }
        
        // Always update priority from markdown
        if (parsedTask.priority && parsedTask.priority !== existing.priority) {
          existing.priority = parsedTask.priority;
          taskUpdated = true;
        }
        
        // Always update dependencies from markdown
        const existingDeps = (existing.dependencies || []).sort();
        const newDeps = parsedTask.dependencies.sort();
        if (JSON.stringify(existingDeps) !== JSON.stringify(newDeps)) {
          existing.dependencies = parsedTask.dependencies;
          taskUpdated = true;
        }
        
        // Update title if different (case-insensitive)
        if (parsedTask.title && parsedTask.title.toLowerCase() !== existing.title.toLowerCase()) {
          existing.title = parsedTask.title;
          taskUpdated = true;
        }
        
        if (taskUpdated) updated++;
      } else {
        // Add new task
        masterTasks.push(parsedTask);
        existingTasksMap.set(taskId, parsedTask);
        added++;
      }
    }
  }

  // Sort tasks by ID
  masterTasks.sort((a, b) => a.id - b.id);

  // Write back to file
  console.log(`\nSummary: ${added} tasks added, ${updated} tasks updated`);
  fs.writeFileSync(TASKS_JSON_PATH, JSON.stringify(tasksData, null, 2) + "\n", "utf8");
  console.log("Tasks synced successfully!");
}

main();
