CREATE TABLE users (
    userId INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(8) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    password VARCHAR(255) NOT NULL,
    preferredLanguage VARCHAR(20) DEFAULT 'English',
    role VARCHAR(20) 
);

CREATE TABLE events (
	eventId INT IDENTITY(1,1) PRIMARY KEY,
	header VARCHAR(100) NOT NULL,
	intro VARCHAR(1000) NOT NULL,
	location VARCHAR(50) NOT NULL,
	latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    radius_m INT NOT NULL DEFAULT 100, -- allowed radius in meters for clock in/out
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL
)

CREATE TABLE attendance (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL FOREIGN KEY REFERENCES users(userId),
    eventId INT NOT NULL FOREIGN KEY REFERENCES events(eventId),
    check_in_time DATETIME2 NULL,
    check_in_lat FLOAT NULL,
    check_in_lon FLOAT NULL,
    check_out_time DATETIME2 NULL,
    check_out_lat FLOAT NULL,
    check_out_lon FLOAT NULL,
    status NVARCHAR(50) NULL -- On Time/Late/Absent.
);