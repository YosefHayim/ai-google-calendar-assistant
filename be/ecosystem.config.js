"use strict"
const path = require("node:path")
require("dotenv").config({ path: path.join(__dirname, ".env") })

module.exports = {
  apps: [
    {
      name: "ally-backend",
      script: "./dist/app.js",
      cwd: __dirname,
      instances: "max",
      exec_mode: "cluster",
      max_memory_restart: "900M",
      node_args: "-r dotenv/config",
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 8080,
        DOTENV_CONFIG_PATH: path.join(__dirname, ".env"),
        PM2_PUBLIC_KEY: process.env.PM2_PUBLIC_KEY || "08rkf7p7yup4tfa",
        PM2_SECRET_KEY: process.env.PM2_SECRET_KEY || "2dd13wf6081ccaa",
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
        DOTENV_CONFIG_PATH: path.join(__dirname, ".env"),
        PM2_PUBLIC_KEY: process.env.PM2_PUBLIC_KEY || "08rkf7p7yup4tfa",
        PM2_SECRET_KEY: process.env.PM2_SECRET_KEY || "2dd13wf6081ccaa",
      },
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10_000,
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      autorestart: true,
      max_restarts: 10,
      restart_delay: 1000,
      watch: false,
      ignore_watch: ["node_modules", "logs", ".git"],
    },
  ],
}
