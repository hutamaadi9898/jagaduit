ALTER TABLE users ADD COLUMN onboarding_completed_at INTEGER;

UPDATE users
SET onboarding_completed_at = created_at
WHERE onboarding_completed_at IS NULL;
