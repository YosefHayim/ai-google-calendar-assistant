#!/bin/bash

# Test environment variables for Docker build and run
export SUPABASE_SERVICE_ROLE_KEY="test_supabase_service_role_key_for_build"
export OPEN_API_KEY="test_openai_api_key_for_build"
export GOOGLE_CLIENT_SECRET="test_google_client_secret_for_build"
export NODE_ENV="production"
export PORT="8080"