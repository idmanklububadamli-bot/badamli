-- schema.sql
-- Create tables for ArenaSmart Sports Tournament Management System

-- Drop tables if they exist
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS athletes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 0. Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'coach',
    club_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1. Events table
CREATE TABLE events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    location TEXT,
    location_url TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    registration_status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    gender TEXT,
    age TEXT,
    weight TEXT,
    type TEXT DEFAULT 'kumite',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.5 Roster Athletes table (persistent roster for coaches)
CREATE TABLE roster_athletes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    birth_date DATE,
    gender TEXT,
    club TEXT NOT NULL,
    country TEXT DEFAULT 'AZE',
    coach_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Athletes table
CREATE TABLE athletes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    club TEXT NOT NULL,
    country TEXT DEFAULT 'AZE',
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    coach_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    roster_athlete_id TEXT REFERENCES roster_athletes(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Matches table
CREATE TABLE matches (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    round_name TEXT,
    round_index INTEGER,
    match_index INTEGER,
    athlete_aka_id TEXT, -- Can be NULL, 'BYE', or athlete.id
    athlete_ao_id TEXT,  -- Can be NULL, 'BYE', or athlete.id
    score_aka NUMERIC DEFAULT 0,
    score_ao NUMERIC DEFAULT 0,
    kata_scores_aka DOUBLE PRECISION[] DEFAULT '{7.5, 7.5, 7.5, 7.5, 7.5}',
    kata_scores_ao DOUBLE PRECISION[] DEFAULT '{7.5, 7.5, 7.5, 7.5, 7.5}',
    warnings_aka TEXT[] DEFAULT '{}',
    warnings_ao TEXT[] DEFAULT '{}',
    senshu TEXT,
    winner_id TEXT,
    status TEXT DEFAULT 'scheduled',
    next_match_id TEXT,
    next_match_position TEXT,
    tatami_number INTEGER DEFAULT 1,
    estimated_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
