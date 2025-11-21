CREATE DATABASE BLEAT
USE BLEAT

--=========================Making Tables==========================
CREATE TABLE Users (
    UserId        INT IDENTITY(1,1) PRIMARY KEY,
    UserName      NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash  NVARCHAR(255) NOT NULL,
    Role          NVARCHAR(20) NOT NULL,
    Email         NVARCHAR(150) NULL UNIQUE,
    Phone         NVARCHAR(30) NULL,
    CreatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CHK_Users_Role CHECK (Role IN ('ADMIN','PARENT'))
);

CREATE TABLE Parents (
    ParentId      INT PRIMARY KEY, -- FK to Users.UserId
    CONSTRAINT FK_Parents_Users FOREIGN KEY (ParentId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE
);

CREATE TABLE Children (
    ChildId       INT IDENTITY(1,1) PRIMARY KEY,
    ParentId      INT NOT NULL,
    Name          NVARCHAR(150) NOT NULL,
    Age           INT NOT NULL CHECK (Age >= 0),
    Status        NVARCHAR(50) NOT NULL DEFAULT ('OK'),
    CreatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Children_Parents FOREIGN KEY (ParentId)
        REFERENCES dbo.Parents(ParentId)
        ON DELETE CASCADE
);

CREATE INDEX IX_Children_ParentId ON dbo.Children(ParentId);

CREATE TABLE Devices (
    DeviceId      INT IDENTITY(1,1) PRIMARY KEY,
    DeviceSerial  NVARCHAR(100) NOT NULL UNIQUE,
    ChildId       INT UNIQUE NULL,  -- 1-to-1 relationship
    BatteryLevel  DECIMAL(5,2) NOT NULL DEFAULT (100.00) CHECK (BatteryLevel BETWEEN 0 AND 100),
    Status        NVARCHAR(50) NOT NULL DEFAULT ('OK'),
    Active        BIT NOT NULL DEFAULT (1),
    AssignedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Devices_Children FOREIGN KEY (ChildId)
        REFERENCES dbo.Children(ChildId)
        ON DELETE SET NULL
);
CREATE INDEX IX_Devices_ChildId ON dbo.Devices(ChildId);

CREATE TABLE dbo.Locations (
    LocationId    BIGINT IDENTITY(1,1) PRIMARY KEY,
    DeviceId      INT NOT NULL,
    Latitude      DECIMAL(10,7) NOT NULL CHECK (Latitude BETWEEN -90 AND 90),
    Longitude     DECIMAL(10,7) NOT NULL CHECK (Longitude BETWEEN -180 AND 180),
    Timestamp     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Locations_Devices FOREIGN KEY (DeviceId)
        REFERENCES dbo.Devices(DeviceId)
        ON DELETE CASCADE
);
CREATE INDEX IX_Locations_Device_Timestamp ON dbo.Locations(DeviceId, Timestamp);

CREATE TABLE dbo.EmergencyContacts (
    ContactId     INT IDENTITY(1,1) PRIMARY KEY,
    ChildId       INT NOT NULL,
    Name          NVARCHAR(150) NOT NULL,
    Phone         NVARCHAR(30) NOT NULL,
    Relation      NVARCHAR(80) NULL,
    CONSTRAINT FK_EmergencyContacts_Children FOREIGN KEY (ChildId)
        REFERENCES dbo.Children(ChildId)
        ON DELETE CASCADE
);

CREATE INDEX IX_EmergencyContacts_ChildId ON dbo.EmergencyContacts(ChildId);

CREATE TABLE dbo.Messages (
    MessageId     INT IDENTITY(1,1) PRIMARY KEY,
    ParentId      INT NOT NULL,
    ChildId       INT NOT NULL,
    Content       NVARCHAR(MAX) NOT NULL,
    Timestamp     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Status        NVARCHAR(20) NOT NULL DEFAULT ('pending'),
    CONSTRAINT FK_Messages_Parents FOREIGN KEY (ParentId)
        REFERENCES dbo.Parents(ParentId)
        ON DELETE CASCADE,
    CONSTRAINT FK_Messages_Children FOREIGN KEY (ChildId)
        REFERENCES dbo.Children(ChildId)
        ON DELETE NO ACTION,
    CONSTRAINT CHK_Messages_Status CHECK (Status IN ('pending','delivered','failed'))
);

CREATE INDEX IX_Messages_ParentId ON dbo.Messages(ParentId);
CREATE INDEX IX_Messages_ChildId ON dbo.Messages(ChildId);

CREATE TABLE dbo.Alerts (
    AlertId       INT IDENTITY(1,1) PRIMARY KEY,
    ParentId      INT NOT NULL,
    ChildId       INT NULL,
    DeviceId      INT NULL,
    AlertType     NVARCHAR(100) NOT NULL,
    Description   NVARCHAR(MAX) NULL,
    Timestamp     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsAcknowledged BIT NOT NULL DEFAULT (0),
    CONSTRAINT FK_Alerts_Parents FOREIGN KEY (ParentId)
        REFERENCES dbo.Parents(ParentId)
        ON DELETE CASCADE,
    CONSTRAINT FK_Alerts_Children FOREIGN KEY (ChildId)
        REFERENCES dbo.Children(ChildId)
        ON DELETE NO ACTION,
    CONSTRAINT FK_Alerts_Devices FOREIGN KEY (DeviceId)
        REFERENCES dbo.Devices(DeviceId)
        ON DELETE SET NULL
);

CREATE INDEX IX_Alerts_ParentId ON dbo.Alerts(ParentId);
CREATE INDEX IX_Alerts_Timestamp ON dbo.Alerts(Timestamp);


CREATE TABLE dbo.AuditLogs (
    LogId         INT IDENTITY(1,1) PRIMARY KEY,
    AdminUserId   INT NOT NULL,
    ActionText    NVARCHAR(400) NOT NULL,
    Timestamp     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (AdminUserId)
        REFERENCES dbo.Users(UserId)
        ON DELETE CASCADE
);


CREATE INDEX IX_AuditLogs_AdminUserId ON dbo.AuditLogs(AdminUserId);
CREATE INDEX IX_AuditLogs_Timestamp ON dbo.AuditLogs(Timestamp);


CREATE TABLE dbo.Reports (
    ReportId      INT IDENTITY(1,1) PRIMARY KEY,
    GeneratedBy   INT NOT NULL,
    ReportType    NVARCHAR(150) NULL,
    GeneratedOn   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Reports_Parents FOREIGN KEY (GeneratedBy)
        REFERENCES dbo.Parents(ParentId)
        ON DELETE CASCADE
);


CREATE INDEX IX_Reports_GeneratedBy ON dbo.Reports(GeneratedBy);

CREATE TABLE SafeZones (
    SafeZoneId INT IDENTITY(1,1) PRIMARY KEY,
    ChildId INT NOT NULL,
    Latitude DECIMAL(10,7) NOT NULL CHECK(Latitude BETWEEN -90 AND 90),
    Longitude DECIMAL(10,7) NOT NULL CHECK(Longitude BETWEEN -180 AND 180),
    Radius DECIMAL(10,2) NOT NULL, -- in meters
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_SafeZones_Children FOREIGN KEY (ChildId)
        REFERENCES Children(ChildId)
        ON DELETE CASCADE
);

ALTER TABLE Messages
ADD SenderRole NVARCHAR(20) ; -- 'PARENT' or 'CHILD'

ALTER TABLE Messages 
ALTER COLUMN SenderRole NVARCHAR(20) NOT NULL;


ALTER TABLE Parents ADD IsAuthenticated BIT NOT NULL DEFAULT 0;

CREATE TABLE ParentAuthRequests (
    RequestId INT IDENTITY(1,1) PRIMARY KEY,
    ParentId INT NOT NULL,
    RequestedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    Status NVARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    CONSTRAINT FK_ParentAuthRequests_Parents FOREIGN KEY (ParentId)
        REFERENCES Parents(ParentId)
        ON DELETE CASCADE
);
