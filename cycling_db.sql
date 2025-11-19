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

CREATE TABLE certificationtypes (
    certificationId INT IDENTITY(1,1) PRIMARY KEY,
    certificationName VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO certificationtypes (certificationName)
VALUES ('Trishaw Pilot Certification'),
       ('Cyclist Certification'),

CREATE TABLE usercertifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL FOREIGN KEY REFERENCES users(userId),
    certificationId INT NOT NULL FOREIGN KEY REFERENCES certificationtypes(certificationId),
    certifiedDate DATETIME DEFAULT GETDATE()
);

CREATE TABLE events (
eventId INT IDENTITY(1,1) PRIMARY KEY,
header VARCHAR(100) NOT NULL,
intro VARCHAR(1000) NOT NULL,
location VARCHAR(50) NOT NULL,
nearestMRT VARCHAR(200) NOT NULL,
latitude FLOAT NOT NULL,
longitude FLOAT NOT NULL,
radius_m INT NOT NULL DEFAULT 100, -- allowed radius in meters for clock in/out
start_time DATETIME NOT NULL,
end_time DATETIME NOT NULL,
longIntro VARCHAR(MAX) NOT NULL
)

INSERT INTO events 
(header, intro, longIntro, location, nearestMRT, latitude, longitude, radius_m, start_time, end_time, requiredCertificationId)
VALUES
('Sentosa Boardwalk Trishaw Ride','Enjoy a relaxing seaside trishaw ride along Sentosa Boardwalk.','A scenic ride offering ocean views and gentle breezes as seniors enjoy a calm coastal route.','Sentosa Boardwalk','HarbourFront MRT',1.2524,103.8208,100,'2025-11-15 09:30','2025-11-15 12:00',1),
('Kampong Glam Heritage Trishaw Trail','A cultural trishaw ride through Kampong Glam''s historic streets.','An immersive cultural trail featuring mosques, textile shops and heritage architecture.','Kampong Glam','Bugis MRT',1.3025,103.8587,100,'2025-11-16 09:00','2025-11-16 12:00',1),
('Singapore River Evening Trishaw Ride','A calm evening trishaw experience along the Singapore River.','A soothing ride showcasing the city lights and reflections along Boat Quay and Clarke Quay.','Singapore River','Clarke Quay MRT',1.2897,103.8501,100,'2025-11-17 18:30','2025-11-17 20:00',1),
('Toa Payoh Park Trishaw Tour','A nostalgic trishaw ride through Toa Payoh Park.','A gentle ride surrounded by greenery and familiar heartland scenery.','Toa Payoh Park','Toa Payoh MRT',1.3343,103.8563,100,'2025-11-18 08:00','2025-11-18 10:00',1),
('Botanic Gardens Morning Trishaw Ride','A peaceful ride through Botanic Gardens.','Lush greenery, wildlife and heritage routes blend together for a serene morning outing.','Botanic Gardens','Botanic Gardens MRT',1.3150,103.8162,100,'2025-11-19 09:00','2025-11-19 11:00',1),
('Jurong Lake Gardens Trishaw Tour','Relax along lakeside views with volunteers.','A scenic trishaw route through the tranquil waterfront areas of Jurong Lake Gardens.','Jurong Lake Gardens','Lakeside MRT',1.3356,103.7334,100,'2025-11-20 08:30','2025-11-20 11:00',1),
('Little India Trishaw Experience','A vibrant ride through colourful streets.','A lively route filled with cultural sights, flower shops and temples.','Little India','Little India MRT',1.3064,103.8518,100,'2025-11-21 09:00','2025-11-21 12:00',1),
('Our Tampines Hub Trishaw Loop','Community ride for seniors and families.','Short loops around Tampines Hub designed for fun and interaction.','Our Tampines Hub','Tampines MRT',1.3534,103.9450,100,'2025-11-22 09:30','2025-11-22 12:00',1),
('Civic District Heritage Trishaw Ride','Enjoy historic buildings and museums on trishaw.','A heritage-focused trishaw journey through Singapore''s civic landmarks.','Civic District','City Hall MRT',1.2904,103.8515,100,'2025-11-23 09:00','2025-11-23 12:00',1),
('Marina Barrage Sunset Trishaw Ride','Catch a peaceful sunset by the waterfront.','A relaxing trishaw ride during golden hour overlooking the skyline.','Marina Barrage','Bayfront MRT',1.2807,103.8710,100,'2025-11-24 17:30','2025-11-24 19:00',1),
('Pasir Ris Park Trishaw Ride','Ride through mangroves and coastal paths.','A refreshing ride through Pasir Ris Park''s calm nature trails.','Pasir Ris Park','Pasir Ris MRT',1.3817,103.9475,100,'2025-11-25 08:30','2025-11-25 11:00',1),
('Punggol Waterway Trishaw Ride','A relaxing ride along scenic waterways.','A peaceful route featuring bridges, calm canals and lush surroundings.','Punggol Waterway Park','Punggol MRT',1.4050,103.9025,100,'2025-11-26 08:00','2025-11-26 11:00',1),
('Fort Canning Park Trishaw Route','Ride through historic greenery.','A gentle forested trishaw trip past historical landmarks.','Fort Canning Park','Fort Canning MRT',1.2924,103.8464,100,'2025-11-28 09:00','2025-11-28 12:00',1),
('Tiong Bahru Heritage Trishaw Ride','Nostalgic tour through Tiong Bahru.','A quiet heritage trail featuring conserved flats and cafes.','Tiong Bahru','Tiong Bahru MRT',1.2857,103.8265,100,'2025-11-30 09:00','2025-11-30 12:00',1),
('Queenstown Heritage Trishaw Ride','Explore Singapore’s first satellite town.','A heartland heritage trip through iconic Queenstown landmarks.','Queenstown','Queenstown MRT',1.2944,103.8058,100,'2025-12-16 09:30','2025-12-16 12:00',1),

('Marina Bay Cyclist Duty Loop','Support senior convoy through Marina Bay.','A cyclist-assisted event ensuring smooth navigation for seniors.','Marina Bay','Bayfront MRT',1.2834,103.8606,100,'2025-11-13 14:00','2025-11-13 16:00',2),
('Park Connector Network Cyclist Escort','Assist seniors along PCN routes.','A guided senior ride using safe park connectors.','Kallang PCN','Stadium MRT',1.3025,103.8763,100,'2025-11-14 08:00','2025-11-14 11:00',2),
('East Coast Cyclist Senior Support Ride','Accompany seniors on long coastal routes.','A scenic ride along East Coast cycling paths.','East Coast Park','Bedok MRT',1.3050,103.9263,100,'2025-11-15 08:30','2025-11-15 11:30',2),
('Jurong Park Connector Cyclist Duty','Cyclist-guided community ride.','A west-side PCN ride suitable for seniors needing assistance.','Jurong PCN','Chinese Garden MRT',1.3380,103.7320,100,'2025-11-16 09:00','2025-11-16 12:00',2),
('Punggol Coastal Cyclist Loop','Ride along Punggol''s waterfront.','A beautiful and safe route for cyclist volunteers.','Punggol Promenade','Punggol MRT',1.4102,103.9024,100,'2025-11-17 08:30','2025-11-17 11:00',2),
('Southern Ridges Cyclist Support Route','Assist seniors along elevated walking paths.','Scenic bridges and canopy walks supported by cyclists.','Henderson Waves','HarbourFront MRT',1.2750,103.8197,100,'2025-11-18 09:00','2025-11-18 12:00',2),
('Bedok Reservoir Cyclist Ride','Guide seniors around Bedok Reservoir.','Calm waterside views and wide cycling paths.','Bedok Reservoir','Bedok Reservoir MRT',1.3362,103.9125,100,'2025-11-19 08:00','2025-11-19 11:00',2),
('Bukit Timah Rail Corridor Cyclist Duty','Ride along heritage rail paths.','A nature-lined cycling route perfect for senior support.','Rail Corridor','King Albert Park MRT',1.3325,103.7775,100,'2025-11-20 09:00','2025-11-20 12:00',2),
('Sengkang Riverside Cyclist Patrol','Assist seniors along riverside walkways.','A gentle north-east loop along peaceful water routes.','Sengkang Riverside Park','Sengkang MRT',1.3917,103.8936,100,'2025-11-21 08:30','2025-11-21 11:00',2),
('Yishun Pond Cyclist Support Ride','Assist seniors around Yishun''s scenic pond.','A calm waterside ride ideal for senior engagement.','Yishun Pond','Yishun MRT',1.4293,103.8350,100,'2025-11-22 08:30','2025-11-22 11:00',2),
('Clementi Woods Cyclist Route','Ride through shaded park connectors.','A gentle loop with cooling forested paths.','Clementi Woods Park','Haw Par Villa MRT',1.3075,103.7642,100,'2025-11-23 09:00','2025-11-23 12:00',2),
('Marine Parade Coastal Cyclist Ride','Support seaside routes for seniors.','A refreshing coastal ride with open sea views.','Marine Parade','Marine Terrace MRT',1.3025,103.9075,100,'2025-11-24 09:00','2025-11-24 11:00',2),
('Holland Village Cyclist Loop','A gentle cyclist-guided heartland ride.','A nostalgic route through café lanes and heritage blocks.','Holland Village','Holland Village MRT',1.3117,103.7964,100,'2025-11-25 10:00','2025-11-25 12:00',2),
('Mount Faber Cyclist Assist Ride','Assist seniors along scenic hill routes.','A slower-paced ride around Mount Faber and nearby connectors.','Mount Faber','HarbourFront MRT',1.2750,103.8197,100,'2025-11-26 08:30','2025-11-26 11:00',2),
('Jurong Central Park Cyclist Event','Guide seniors in a safe community cycling loop.','Light and friendly ride for seniors of all mobility levels.','Jurong Central Park','Boon Lay MRT',1.3333,103.7425,100,'2025-11-27 09:00','2025-11-27 12:00',2);

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
    status NVARCHAR(50) NULL -- On Time/Late
);

CREATE TABLE bookedevents (
    bookingId INT IDENTITY(1,1) PRIMARY KEY,
    userId INT NOT NULL,
    eventId INT NOT NULL,
    bookingDate DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (userId) REFERENCES users(userId),
    FOREIGN KEY (eventId) REFERENCES events(eventId)
);
