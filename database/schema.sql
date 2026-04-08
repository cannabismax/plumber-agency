-- ============================================================
-- PLUMBING AGENCY CRM - MS SQL Database Schema
-- ============================================================

-- Create Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'PlumbingAgency')
BEGIN
    CREATE DATABASE PlumbingAgency;
END
GO

USE PlumbingAgency;
GO

-- ============================================================
-- MAIN LEADS TABLE
-- ============================================================
IF OBJECT_ID('dbo.Leads', 'U') IS NOT NULL
    DROP TABLE dbo.Leads;
GO

CREATE TABLE dbo.Leads (
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
    
    -- Scoring Fields
    HasClickToCall BIT DEFAULT 0,
    HasStickyCTA BIT DEFAULT 0,
    HasWeakHeadline BIT DEFAULT 0,
    HasPoorMobile BIT DEFAULT 0,
    LeadScore INT DEFAULT 0,
    
    -- Status & Pipeline
    Status NVARCHAR(50) DEFAULT 'DISCOVERED',
    PriorityTier NVARCHAR(20),  -- LOW, MED, HIGH
    
    -- Demo Site
    DemoSitePath NVARCHAR(500),
    DemoSiteURL NVARCHAR(500),
    
    -- Pricing
    ProposedTier NVARCHAR(50),
    ProposedPrice DECIMAL(10,2),
    PaymentLink NVARCHAR(500),
    
    -- Timestamps
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    AuditedAt DATETIME,
    ContactedAt DATETIME,
    RespondedAt DATETIME,
    InterestedAt DATETIME,
    AppointmentDate DATETIME,
    ClosedAt DATETIME,
    
    -- Notes
    Notes NVARCHAR(MAX),
    
    -- Website Analysis
    AnalysisData NVARCHAR(MAX)  -- JSON blob for website analysis
);
GO

-- ============================================================
-- ACTIVITIES TABLE (Emails, SMS, Notes)
-- ============================================================
IF OBJECT_ID('dbo.Activities', 'U') IS NOT NULL
    DROP TABLE dbo.Activities;
GO

CREATE TABLE dbo.Activities (
    ActivityID INT IDENTITY(1,1) PRIMARY KEY,
    LeadID INT NOT NULL,
    ActivityType NVARCHAR(50) NOT NULL,  -- EMAIL, SMS, NOTE, DEMO_SENT
    
    -- Content
    Subject NVARCHAR(500),
    Body NVARCHAR(MAX),
    TemplateUsed NVARCHAR(100),
    
    -- Tracking
    SentAt DATETIME,
    DeliveredAt DATETIME,
    OpenedAt DATETIME,
    ClickedAt DATETIME,
    
    -- Status
    Status NVARCHAR(50) DEFAULT 'PENDING',  -- PENDING, SENT, DELIVERED, OPENED, CLICKED, FAILED
    
    -- Error tracking
    ErrorMessage NVARCHAR(500),
    
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (LeadID) REFERENCES Leads(LeadID) ON DELETE CASCADE
);
GO

-- ============================================================
-- CALLS TABLE
-- ============================================================
IF OBJECT_ID('dbo.Calls', 'U') IS NOT NULL
    DROP TABLE dbo.Calls;
GO

CREATE TABLE dbo.Calls (
    CallID INT IDENTITY(1,1) PRIMARY KEY,
    LeadID INT NOT NULL,
    CallType NVARCHAR(50) NOT NULL,  -- OUTBOUND, INBOUND, AI_AGENT, MANUAL
    
    -- Call Details
    PhoneNumber NVARCHAR(50),
    DurationSeconds INT,
    RecordingURL NVARCHAR(500),
    
    -- Outcome
    Outcome NVARCHAR(50),  -- ANSWERED, VOICEMAIL, NO_ANSWER, BUSY, FAILED
    Result NVARCHAR(100),  -- BOOKED, CLOSED, INTERESTED, NOT_INTERESTED, CALL_BACK
    
    -- AI Agent specific
    Transcription NVARCHAR(MAX),
    Summary NVARCHAR(500),
    
    -- Scheduling
    ScheduledAt DATETIME,
    StartedAt DATETIME,
    EndedAt DATETIME,
    
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (LeadID) REFERENCES Leads(LeadID) ON DELETE CASCADE
);
GO

-- ============================================================
-- APPOINTMENTS TABLE
-- ============================================================
IF OBJECT_ID('dbo.Appointments', 'U') IS NOT NULL
    DROP TABLE dbo.Appointments;
GO

CREATE TABLE dbo.Appointments (
    AppointmentID INT IDENTITY(1,1) PRIMARY KEY,
    LeadID INT NOT NULL,
    CallID INT,
    
    -- Scheduling
    ScheduledDateTime DATETIME NOT NULL,
    DurationMinutes INT DEFAULT 15,
    BookingLink NVARCHAR(500),
    
    -- Status
    Status NVARCHAR(50) DEFAULT 'SCHEDULED',  -- SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    
    -- Details
    MeetingType NVARCHAR(50) DEFAULT 'VIDEO',  -- VIDEO, PHONE, IN_PERSON
    MeetingLink NVARCHAR(500),
    
    -- Outcome
    Notes NVARCHAR(MAX),
    FollowUpRequired BIT DEFAULT 0,
    
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (LeadID) REFERENCES Leads(LeadID) ON DELETE CASCADE,
    FOREIGN KEY (CallID) REFERENCES Calls(CallID) ON DELETE SET NULL
);
GO

-- ============================================================
-- REVENUE TRACKING TABLE
-- ============================================================
IF OBJECT_ID('dbo.Revenue', 'U') IS NOT NULL
    DROP TABLE dbo.Revenue;
GO

CREATE TABLE dbo.Revenue (
    RevenueID INT IDENTITY(1,1) PRIMARY KEY,
    LeadID INT,
    
    -- Deal Info
    DealValue DECIMAL(10,2),
    ProposedValue DECIMAL(10,2),
    
    -- Status
    Stage NVARCHAR(50) DEFAULT 'PROPOSAL',  -- PROPOSAL, NEGOTIATION, CONTRACT, CLOSED_WON, CLOSED_LOST
    PaymentStatus NVARCHAR(50),  -- PENDING, PAID, REFUNDED
    
    -- Payment Details
    StripePaymentIntentID NVARCHAR(255),
    InvoiceNumber NVARCHAR(50),
    PaidAt DATETIME,
    
    -- Timestamps
    CreatedAt DATETIME DEFAULT GETDATE(),
    ClosedAt DATETIME,
    
    FOREIGN KEY (LeadID) REFERENCES Leads(LeadID) ON DELETE SET NULL
);
GO

-- ============================================================
-- DASHBOARD AGGREGATES VIEW
-- ============================================================
CREATE OR ALTER VIEW vw_DashboardMetrics AS
SELECT 
    City,
    COUNT(*) as TotalLeads,
    SUM(CASE WHEN Status = 'PRIORITY' THEN 1 ELSE 0 END) as PriorityLeads,
    SUM(CASE WHEN Status = 'CONTACTED' THEN 1 ELSE 0 END) as ContactedLeads,
    SUM(CASE WHEN Status = 'RESPONDED' THEN 1 ELSE 0 END) as RespondedLeads,
    SUM(CASE WHEN Status = 'INTERESTED' THEN 1 ELSE 0 END) as InterestedLeads,
    SUM(CASE WHEN Status = 'CLOSED' THEN 1 ELSE 0 END) as ClosedLeads,
    SUM(CASE WHEN Status = 'CLOSED' THEN DealValue ELSE 0 END) as ClosedRevenue,
    SUM(CASE WHEN Status IN ('PRIORITY', 'CONTACTED', 'RESPONDED', 'INTERESTED') THEN DealValue ELSE 0 END) as ProjectedRevenue,
    AVG(LeadScore) as AvgLeadScore,
    MAX(LeadScore) as MaxLeadScore
FROM Leads l
LEFT JOIN Revenue r ON l.LeadID = r.LeadID
GROUP BY City;
GO

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE NONCLUSTERED INDEX IX_Leads_City ON Leads(City);
CREATE NONCLUSTERED INDEX IX_Leads_Status ON Leads(Status);
CREATE NONCLUSTERED INDEX IX_Leads_LeadScore ON Leads(LeadScore DESC);
CREATE NONCLUSTERED INDEX IX_Activities_LeadID ON Activities(LeadID);
CREATE NONCLUSTERED INDEX IX_Calls_LeadID ON Calls(LeadID);
CREATE NONCLUSTERED INDEX IX_Appointments_LeadID ON Appointments(LeadID);
GO

PRINT 'Database schema created successfully!';
