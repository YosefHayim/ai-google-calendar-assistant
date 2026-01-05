-- =============================================================================
-- AI Google Calendar Assistant - Data Migration Script
-- Version: 1.0.0
-- Description: Migrates data from old schema to new professional schema
-- IMPORTANT: Run this AFTER 001_professional_schema.sql
-- =============================================================================

-- =============================================================================
-- STEP 1: Migrate users from user_calendar_tokens
-- =============================================================================

INSERT INTO users (
    id,
    email,
    email_verified,
    first_name,
    last_name,
    display_name,
    avatar_url,
    timezone,
    status,
    created_at,
    updated_at,
    last_login_at
)
SELECT 
    COALESCE(uct.user_id::uuid, uuid_generate_v4()) AS id,
    LOWER(TRIM(uct.email)) AS email,
    TRUE AS email_verified,
    uct.first_name,
    uct.last_name,
    COALESCE(
        CONCAT(uct.first_name, ' ', uct.last_name),
        uct.first_name,
        uct.email
    ) AS display_name,
    uct.avatar_url,
    COALESCE(uct.timezone, 'UTC') AS timezone,
    CASE WHEN uct.is_active = TRUE THEN 'active'::user_status ELSE 'inactive'::user_status END AS status,
    uct.created_at,
    COALESCE(uct.updated_at, uct.created_at) AS updated_at,
    uct.updated_at AS last_login_at
FROM user_calendar_tokens uct
WHERE uct.email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    avatar_url = EXCLUDED.avatar_url,
    timezone = EXCLUDED.timezone,
    updated_at = NOW();

-- =============================================================================
-- STEP 2: Migrate OAuth tokens from user_calendar_tokens
-- =============================================================================

INSERT INTO oauth_tokens (
    user_id,
    provider,
    provider_user_id,
    access_token,
    refresh_token,
    id_token,
    token_type,
    scope,
    expires_at,
    refresh_token_expires_at,
    is_valid,
    created_at,
    updated_at
)
SELECT 
    u.id AS user_id,
    'google'::oauth_provider AS provider,
    NULL AS provider_user_id,
    uct.access_token,
    uct.refresh_token,
    uct.id_token,
    COALESCE(uct.token_type, 'Bearer') AS token_type,
    uct.scope,
    CASE 
        WHEN uct.expiry_date IS NOT NULL 
        THEN to_timestamp(uct.expiry_date / 1000)
        ELSE NULL 
    END AS expires_at,
    CASE 
        WHEN uct.refresh_token_expires_in IS NOT NULL 
        THEN NOW() + (uct.refresh_token_expires_in || ' seconds')::INTERVAL
        ELSE NULL 
    END AS refresh_token_expires_at,
    COALESCE(uct.is_active, TRUE) AS is_valid,
    uct.created_at,
    COALESCE(uct.updated_at, uct.created_at) AS updated_at
FROM user_calendar_tokens uct
INNER JOIN users u ON LOWER(TRIM(uct.email)) = u.email
WHERE uct.access_token IS NOT NULL
ON CONFLICT (user_id, provider) DO UPDATE SET
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    id_token = EXCLUDED.id_token,
    scope = EXCLUDED.scope,
    expires_at = EXCLUDED.expires_at,
    is_valid = EXCLUDED.is_valid,
    updated_at = NOW();

-- =============================================================================
-- STEP 3: Migrate calendar_categories to user_calendars
-- =============================================================================

INSERT INTO user_calendars (
    user_id,
    calendar_id,
    calendar_name,
    access_role,
    timezone,
    default_reminders,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    u.id AS user_id,
    cc.calendar_id,
    cc.calendar_name,
    CASE cc.access_role
        WHEN 'owner' THEN 'owner'::calendar_access_role
        WHEN 'writer' THEN 'writer'::calendar_access_role
        WHEN 'reader' THEN 'reader'::calendar_access_role
        WHEN 'freeBusyReader' THEN 'freeBusyReader'::calendar_access_role
        ELSE 'reader'::calendar_access_role
    END AS access_role,
    cc.time_zone_of_calendar AS timezone,
    COALESCE(cc.default_reminders, '[]'::jsonb) AS default_reminders,
    (cc.calendar_id = cc.email OR cc.calendar_id = 'primary') AS is_primary,
    cc.created_at,
    COALESCE(cc.updated_at, cc.created_at) AS updated_at
FROM calendar_categories cc
INNER JOIN users u ON LOWER(TRIM(cc.email)) = u.email
WHERE cc.calendar_id IS NOT NULL
ON CONFLICT (user_id, calendar_id) DO UPDATE SET
    calendar_name = EXCLUDED.calendar_name,
    access_role = EXCLUDED.access_role,
    timezone = EXCLUDED.timezone,
    default_reminders = EXCLUDED.default_reminders,
    updated_at = NOW();

-- =============================================================================
-- STEP 4: Migrate user_telegram_links to telegram_users
-- =============================================================================

INSERT INTO telegram_users (
    user_id,
    telegram_user_id,
    telegram_chat_id,
    telegram_username,
    first_name,
    language_code,
    is_bot,
    is_linked,
    created_at,
    updated_at
)
SELECT 
    u.id AS user_id,
    utl.telegram_user_id,
    utl.chat_id AS telegram_chat_id,
    utl.username AS telegram_username,
    utl.first_name,
    utl.language_code,
    COALESCE(utl.is_bot, FALSE) AS is_bot,
    (utl.email IS NOT NULL) AS is_linked,
    utl.created_at,
    COALESCE(utl.updated_at, utl.created_at) AS updated_at
FROM user_telegram_links utl
LEFT JOIN users u ON LOWER(TRIM(utl.email)) = u.email
WHERE utl.telegram_user_id IS NOT NULL
ON CONFLICT (telegram_user_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    telegram_chat_id = EXCLUDED.telegram_chat_id,
    telegram_username = EXCLUDED.telegram_username,
    first_name = EXCLUDED.first_name,
    is_linked = EXCLUDED.is_linked,
    updated_at = NOW();

-- =============================================================================
-- STEP 5: Migrate conversation_state to conversations
-- =============================================================================

INSERT INTO conversations (
    user_id,
    source,
    external_chat_id,
    title,
    summary,
    message_count,
    is_active,
    created_at,
    updated_at,
    last_message_at
)
SELECT 
    COALESCE(u.id, tu.user_id) AS user_id,
    CASE 
        WHEN cs.source = 'web' THEN 'web'::conversation_source
        WHEN cs.source = 'telegram' THEN 'telegram'::conversation_source
        WHEN cs.source = 'whatsapp' THEN 'whatsapp'::conversation_source
        ELSE 'web'::conversation_source
    END AS source,
    cs.chat_id AS external_chat_id,
    (cs.context_window->>'title') AS title,
    (cs.context_window->>'summary') AS summary,
    COALESCE(cs.message_count, 0) AS message_count,
    COALESCE(cs.is_active, TRUE) AS is_active,
    cs.created_at,
    COALESCE(cs.updated_at, cs.update_at, cs.created_at) AS updated_at,
    COALESCE(cs.updated_at, cs.update_at, cs.created_at) AS last_message_at
FROM conversation_state cs
LEFT JOIN users u ON cs.user_id = u.id::text
LEFT JOIN telegram_users tu ON cs.telegram_user_id = tu.telegram_user_id
WHERE COALESCE(u.id, tu.user_id) IS NOT NULL;

-- =============================================================================
-- STEP 6: Migrate gap_candidates (if data exists)
-- =============================================================================

-- Note: The old gap_candidates table uses text user_id, new uses UUID
-- This migration assumes user_id in old table matches users.id

INSERT INTO gap_candidates (
    user_id,
    start_time,
    end_time,
    duration_ms,
    preceding_event_id,
    preceding_event_summary,
    preceding_event_calendar_id,
    following_event_id,
    following_event_summary,
    following_event_calendar_id,
    inferred_context,
    confidence_score,
    resolution_status,
    resolution_data,
    resolved_at,
    detected_at,
    created_at,
    updated_at
)
SELECT 
    gc.user_id::uuid AS user_id,
    gc.start_time::timestamptz AS start_time,
    gc.end_time::timestamptz AS end_time,
    gc.duration_ms,
    gc.preceding_event_id,
    gc.preceding_event_summary,
    gc.preceding_event_calendar_id,
    gc.following_event_id,
    gc.following_event_summary,
    gc.following_event_calendar_id,
    gc.inferred_context,
    COALESCE((gc.inferred_context->>'confidence')::decimal, 0.5) AS confidence_score,
    CASE gc.resolution_status
        WHEN 'pending' THEN 'pending'::gap_resolution_status
        WHEN 'filled' THEN 'filled'::gap_resolution_status
        WHEN 'skipped' THEN 'skipped'::gap_resolution_status
        WHEN 'dismissed' THEN 'dismissed'::gap_resolution_status
        ELSE 'pending'::gap_resolution_status
    END AS resolution_status,
    gc.resolution_data,
    gc.resolved_at::timestamptz,
    gc.detected_at::timestamptz,
    gc.created_at,
    gc.updated_at
FROM gap_candidates gc
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = gc.user_id::uuid)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- STEP 7: Migrate gap_recovery_settings
-- =============================================================================

INSERT INTO gap_recovery_settings (
    user_id,
    settings,
    is_enabled,
    min_gap_minutes,
    max_gap_minutes,
    created_at,
    updated_at
)
SELECT 
    grs.user_id::uuid AS user_id,
    grs.settings,
    COALESCE((grs.settings->>'autoGapAnalysis')::boolean, TRUE) AS is_enabled,
    COALESCE((grs.settings->>'minGapThreshold')::integer, 30) AS min_gap_minutes,
    COALESCE((grs.settings->>'maxGapThreshold')::integer, 480) AS max_gap_minutes,
    grs.created_at,
    grs.updated_at
FROM gap_recovery_settings grs
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = grs.user_id::uuid)
ON CONFLICT (user_id) DO UPDATE SET
    settings = EXCLUDED.settings,
    is_enabled = EXCLUDED.is_enabled,
    updated_at = NOW();

-- =============================================================================
-- STEP 8: Migrate agent_sessions
-- =============================================================================

INSERT INTO agent_sessions (
    user_id,
    session_id,
    agent_name,
    items,
    is_active,
    created_at,
    updated_at
)
SELECT 
    ags.user_id::uuid AS user_id,
    ags.session_id,
    ags.agent_name,
    ags.items,
    TRUE AS is_active,
    ags.created_at,
    COALESCE(ags.updated_at, ags.created_at) AS updated_at
FROM agent_sessions ags
WHERE EXISTS (SELECT 1 FROM users u WHERE u.id = ags.user_id::uuid)
ON CONFLICT (session_id) DO UPDATE SET
    items = EXCLUDED.items,
    updated_at = NOW();

-- =============================================================================
-- STEP 9: Create migration audit record
-- =============================================================================

INSERT INTO audit_logs (
    action,
    resource_type,
    new_values,
    status
)
VALUES (
    'schema_migration',
    'database',
    jsonb_build_object(
        'migration_version', '1.0.0',
        'migrated_tables', ARRAY[
            'user_calendar_tokens -> users + oauth_tokens',
            'calendar_categories -> user_calendars',
            'user_telegram_links -> telegram_users',
            'conversation_state -> conversations',
            'gap_candidates (updated)',
            'gap_recovery_settings (updated)',
            'agent_sessions (updated)'
        ],
        'migration_timestamp', NOW()
    ),
    'success'
);

-- =============================================================================
-- STEP 10: Verify migration counts
-- =============================================================================

DO $$
DECLARE
    old_users_count INTEGER;
    new_users_count INTEGER;
    old_tokens_count INTEGER;
    new_tokens_count INTEGER;
    old_calendars_count INTEGER;
    new_calendars_count INTEGER;
    old_telegram_count INTEGER;
    new_telegram_count INTEGER;
BEGIN
    -- Count old tables
    SELECT COUNT(*) INTO old_users_count FROM user_calendar_tokens WHERE email IS NOT NULL;
    SELECT COUNT(*) INTO old_tokens_count FROM user_calendar_tokens WHERE access_token IS NOT NULL;
    SELECT COUNT(*) INTO old_calendars_count FROM calendar_categories WHERE calendar_id IS NOT NULL;
    SELECT COUNT(*) INTO old_telegram_count FROM user_telegram_links WHERE telegram_user_id IS NOT NULL;
    
    -- Count new tables
    SELECT COUNT(*) INTO new_users_count FROM users;
    SELECT COUNT(*) INTO new_tokens_count FROM oauth_tokens;
    SELECT COUNT(*) INTO new_calendars_count FROM user_calendars;
    SELECT COUNT(*) INTO new_telegram_count FROM telegram_users;
    
    -- Log results
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '  Users: % -> % (migrated)', old_users_count, new_users_count;
    RAISE NOTICE '  OAuth Tokens: % -> % (migrated)', old_tokens_count, new_tokens_count;
    RAISE NOTICE '  Calendars: % -> % (migrated)', old_calendars_count, new_calendars_count;
    RAISE NOTICE '  Telegram Users: % -> % (migrated)', old_telegram_count, new_telegram_count;
    
    IF new_users_count < old_users_count * 0.9 THEN
        RAISE WARNING 'User migration may be incomplete. Check for data issues.';
    END IF;
END $$;

-- =============================================================================
-- Migration Complete
-- =============================================================================
-- 
-- IMPORTANT: After verifying the migration:
-- 1. Test all application functionality
-- 2. Update application code to use new table names
-- 3. Consider renaming old tables (e.g., user_calendar_tokens -> user_calendar_tokens_old)
-- 4. After a safe period, drop old tables
--
-- To rename old tables (run manually after verification):
-- ALTER TABLE user_calendar_tokens RENAME TO user_calendar_tokens_deprecated;
-- ALTER TABLE calendar_categories RENAME TO calendar_categories_deprecated;
-- ALTER TABLE user_telegram_links RENAME TO user_telegram_links_deprecated;
-- ALTER TABLE conversation_state RENAME TO conversation_state_deprecated;
--
-- =============================================================================
