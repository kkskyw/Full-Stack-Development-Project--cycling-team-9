CREATE TABLE users (
userId INT IDENTITY(1,1) PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
phone VARCHAR(8) UNIQUE NOT NULL,
dob DATE NOT NULL,
password VARCHAR(255) NOT NULL,
preferredLanguage VARCHAR(20) DEFAULT 'English',
role VARCHAR(20) );

CREATE TABLE certificationtypes (
    certificationId INT IDENTITY(1,1) PRIMARY KEY,
    certificationName VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE events (
    eventId INT IDENTITY(1,1) PRIMARY KEY,
    header VARCHAR(100) NOT NULL,
    intro VARCHAR(1000) NOT NULL,
    location VARCHAR(50) NOT NULL,
    time DATETIME NOT NULL,
    slots INT DEFAULT 20,
    createdDate DATETIME DEFAULT GETDATE(),
    requiredCertificationId INT NULL
        FOREIGN KEY REFERENCES certificationtypes(certificationId)
);


CREATE TABLE usercertifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL FOREIGN KEY REFERENCES users(userId),
    certificationId INT NOT NULL FOREIGN KEY REFERENCES certificationtypes(certificationId),
    certifiedDate DATETIME DEFAULT GETDATE()
);

CREATE TABLE eventsignup (
    signupId INT IDENTITY(1,1) PRIMARY KEY,
    eventId INT NOT NULL FOREIGN KEY REFERENCES events(eventId),
    userId INT NOT NULL FOREIGN KEY REFERENCES users(userId),
    signupDate DATETIME DEFAULT GETDATE()
);

