-- Work Leveling: Initial Seed Data para el Perfil (Steve Smith)
-- Ejecutar en Supabase SQL Editor

-- 1. Create Organization
INSERT INTO "Organization" (id, "clerkOrgId", name, slug, plan, seats, "createdAt", "updatedAt") 
VALUES ('org_tech_corp', 'org_sample_123', 'Tech Corp', 'tech-corp', 'FREE', 5, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- 2. Create User
INSERT INTO "User" (id, "clerkUserId", email, name, title, level, xp, "xpToNextLevel", trophies, kredits, "organizationId", "createdAt", "updatedAt") 
VALUES ('user_steve_smith', 'user_sample_123', 'steve.smith@example.com', 'Steve Smith', 'Senior QA Engineer', 42, 0, 1000, 0, 2500, 'org_tech_corp', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- 3. Create Attributes
INSERT INTO "Attribute" (id, key, label, color, side) VALUES 
('attr_logic', 'logic', 'Lógica', '#FF3B30', 'LEFT'),
('attr_memory', 'memory', 'Memoria', '#FF9500', 'LEFT'),
('attr_focus', 'focus', 'Enfoque', '#4CD964', 'LEFT'),
('attr_creativity', 'creativity', 'Creatividad', '#5AC8FA', 'LEFT'),
('attr_leadership', 'leadership', 'Liderazgo', '#007AFF', 'RIGHT'),
('attr_teamwork', 'teamwork', 'Trabajo en Eq.', '#5856D6', 'RIGHT'),
('attr_communication', 'communication', 'Comunicación', '#FF2D55', 'RIGHT'),
('attr_problem_solving', 'problem_solving', 'Resolución', '#E5E5EA', 'RIGHT')
ON CONFLICT ("key") DO NOTHING;

-- 4. Assign Attributes to User
INSERT INTO "UserAttribute" (id, value, "userId", "attributeId", "updatedAt") VALUES 
('ua_1', 85, 'user_steve_smith', 'attr_logic', NOW()),
('ua_2', 60, 'user_steve_smith', 'attr_memory', NOW()),
('ua_3', 40, 'user_steve_smith', 'attr_focus', NOW()),
('ua_4', 30, 'user_steve_smith', 'attr_creativity', NOW()),
('ua_5', 50, 'user_steve_smith', 'attr_leadership', NOW()),
('ua_6', 75, 'user_steve_smith', 'attr_teamwork', NOW()),
('ua_7', 65, 'user_steve_smith', 'attr_communication', NOW()),
('ua_8', 90, 'user_steve_smith', 'attr_problem_solving', NOW())
ON CONFLICT ("userId", "attributeId") DO NOTHING;
