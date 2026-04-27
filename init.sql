CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firstname TEXT,
    lastname TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    job_id Integer,
    title TEXT,
    company TEXT,
    description TEXT,
    location TEXT,
    salary_range Integer,
    source_url TEXT,
    source_platform TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(job_id, source_platform)
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS user_skills (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS job_skills (
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- Initial skills
INSERT INTO skills (name) VALUES 
('Go'), ('Python'), ('JavaScript'), ('TypeScript'), ('React'), ('Vue'), ('Node.js'), 
('PostgreSQL'), ('Docker'), ('Kubernetes'), ('AWS'), ('Azure'), ('GCP'),
('HTML'), ('CSS'), ('Sass'), ('Less'), ('SQL'), ('NoSQL'), ('MongoDB'), ('Redis'),
('Java'), ('C#'), ('C++'), ('PHP'), ('Ruby'), ('Rust'), ('Swift'), ('Kotlin')
ON CONFLICT (name) DO NOTHING;
