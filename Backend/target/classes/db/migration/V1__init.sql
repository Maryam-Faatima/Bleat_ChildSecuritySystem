-- Flyway baseline migration for PostgreSQL
-- Creates the tables used by the application. This file is Postgres-compatible.

CREATE TABLE IF NOT EXISTS "Users" (
    "UserId" SERIAL PRIMARY KEY,
    "UserName" VARCHAR(255),
    "PasswordHash" VARCHAR(255),
    "Role" VARCHAR(50),
    "Email" VARCHAR(255),
    "Phone" VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS "Parents" (
    "ParentId" INT PRIMARY KEY,
    "IsAuthenticated" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "ParentAuthRequests" (
    "Id" SERIAL PRIMARY KEY,
    "ParentId" INT
);

CREATE TABLE IF NOT EXISTS "Children" (
    "ChildId" SERIAL PRIMARY KEY,
    "ParentId" INT,
    "Name" VARCHAR(255),
    "Age" INT,
    "Username" VARCHAR(255),
    "PasswordHash" VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "Devices" (
    "DeviceId" SERIAL PRIMARY KEY,
    "DeviceSerial" VARCHAR(255) UNIQUE,
    "ChildId" INT,
    "Active" BOOLEAN DEFAULT TRUE,
    "BatteryLevel" DOUBLE PRECISION,
    "Status" VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS "Alerts" (
    "AlertId" SERIAL PRIMARY KEY,
    "ChildId" INT,
    "ParentId" INT,
    "Type" VARCHAR(50),
    "Message" VARCHAR(1000),
    "Latitude" DOUBLE PRECISION,
    "Longitude" DOUBLE PRECISION,
    "Timestamp" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "Status" VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS "Locations" (
    "LocationId" SERIAL PRIMARY KEY,
    "DeviceId" INT,
    "Latitude" DOUBLE PRECISION,
    "Longitude" DOUBLE PRECISION,
    "Timestamp" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Messages" (
    "MessageId" SERIAL PRIMARY KEY,
    "ParentId" INT,
    "ChildId" INT,
    "Content" VARCHAR(2000),
    "Status" VARCHAR(50),
    "SenderRole" VARCHAR(20),
    "Timestamp" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "SafeZones" (
    "SafeZoneId" SERIAL PRIMARY KEY,
    "ChildId" INT,
    "Latitude" DOUBLE PRECISION,
    "Longitude" DOUBLE PRECISION,
    "Radius" DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS "Reports" (
    "ReportId" SERIAL PRIMARY KEY,
    "ParentId" INT,
    "Type" VARCHAR(100),
    "GeneratedOn" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    "Content" TEXT
);

-- Indexes that can help queries
CREATE INDEX IF NOT EXISTS idx_messages_childid ON "Messages"("ChildId");
CREATE INDEX IF NOT EXISTS idx_messages_parentid ON "Messages"("ParentId");
CREATE INDEX IF NOT EXISTS idx_locations_deviceid ON "Locations"("DeviceId");
CREATE INDEX IF NOT EXISTS idx_alerts_parentid ON "Alerts"("ParentId");
