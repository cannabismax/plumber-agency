IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PlumbingAgency')
BEGIN
    CREATE DATABASE PlumbingAgency;
END
GO

USE PlumbingAgency;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Leads')
BEGIN
    CREATE TABLE Leads (
        LeadID INT IDENTITY(1,1) PRIMARY KEY,
        BusinessName NVARCHAR(255) NOT NULL,
        Website NVARCHAR(500),
        Phone NVARCHAR(50),
        Email NVARCHAR(255),
        Address NVARCHAR(500),
        City NVARCHAR(100) NOT NULL,
        State NVARCHAR(50),
        ZipCode NVARCHAR(20),
        GoogleRating DECIMAL(3,1),
        Services NVARCHAR(MAX),
        HasClickToCall BIT DEFAULT 0,
        HasStickyCTA BIT DEFAULT 0,
        HasWeakHeadline BIT DEFAULT 0,
        HasPoorMobile BIT DEFAULT 0,
        LeadScore INT DEFAULT 0,
        Status NVARCHAR(50) DEFAULT 'DISCOVERED',
        DemoSitePath NVARCHAR(500),
        DemoSiteURL NVARCHAR(500),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        AuditedAt DATETIME
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Activities')
BEGIN
    CREATE TABLE Activities (
        ActivityID INT IDENTITY(1,1) PRIMARY KEY,
        LeadID INT NOT NULL,
        ActivityType NVARCHAR(50) NOT NULL,
        Subject NVARCHAR(500),
        Body NVARCHAR(MAX),
        Status NVARCHAR(50) DEFAULT 'PENDING',
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Calls')
BEGIN
    CREATE TABLE Calls (
        CallID INT IDENTITY(1,1) PRIMARY KEY,
        LeadID INT NOT NULL,
        CallType NVARCHAR(50) NOT NULL,
        PhoneNumber NVARCHAR(50),
        Outcome NVARCHAR(50),
        Result NVARCHAR(100),
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Appointments')
BEGIN
    CREATE TABLE Appointments (
        AppointmentID INT IDENTITY(1,1) PRIMARY KEY,
        LeadID INT NOT NULL,
        ScheduledDateTime DATETIME,
        Status NVARCHAR(50) DEFAULT 'SCHEDULED',
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Revenue')
BEGIN
    CREATE TABLE Revenue (
        RevenueID INT IDENTITY(1,1) PRIMARY KEY,
        LeadID INT,
        DealValue DECIMAL(10,2),
        Stage NVARCHAR(50) DEFAULT 'PROPOSAL',
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

SELECT 'Database schema created successfully!' AS Result;
GO
