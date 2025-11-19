// models/eventModel.js
const sql = require("mssql");
const dbConfig = require("../dbConfig");

let pool;

const getPool = async () => {
    if (pool) {
        return pool;
    }
    try {
        pool = await sql.connect(dbConfig);
        console.log('Database connection pool created successfully');
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err.message);
        throw err;
    }
};

const getAllEvents = async (page = 1, pageSize = 5, filters = {}) => {
    try {
        const pool = await getPool();
        const offset = (page - 1) * pageSize;
        
        let baseQuery = `
            SELECT eventId, header, intro, location, start_time, nearestMRT, longIntro
            FROM events
            WHERE 1=1
        `;
        
        let countQuery = `
            SELECT COUNT(*) as totalCount 
            FROM events 
            WHERE 1=1
        `;
        
        const request = pool.request();
        
        // Add time filter if provided
        if (filters.time) {
            baseQuery += ` AND DATEPART(HOUR, start_time) = @time`;
            countQuery += ` AND DATEPART(HOUR, start_time) = @time`;
            request.input('time', sql.Int, filters.time);
        }
        
        // Add MRT filter if provided
        if (filters.mrt) {
            baseQuery += ` AND nearestMRT = @mrt`;
            countQuery += ` AND nearestMRT = @mrt`;
            request.input('mrt', sql.VarChar, filters.mrt);
        }
        
        // Add MRT letter filter if provided
        if (filters.mrtLetter && filters.mrtLetter !== '') {
            baseQuery += ` AND UPPER(LEFT(nearestMRT, 1)) = @mrtLetter`;
            countQuery += ` AND UPPER(LEFT(nearestMRT, 1)) = @mrtLetter`;
            request.input('mrtLetter', sql.VarChar, filters.mrtLetter);
        }
        
        baseQuery += ` ORDER BY start_time OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`;
        
        request.input('offset', sql.Int, offset);
        request.input('pageSize', sql.Int, pageSize);
        
        console.log('Executing events query:', baseQuery);
        console.log('Executing count query:', countQuery);
        
        // Execute both queries
        const eventsResult = await request.query(baseQuery);
        const countResult = await request.query(countQuery);
        
        const totalCount = countResult.recordset[0].totalCount;
        const totalPages = Math.ceil(totalCount / pageSize);
        
        return {
            events: eventsResult.recordset,
            totalCount: totalCount,
            currentPage: page,
            totalPages: totalPages
        };
    } catch (error) {
        console.error('Error in eventModel.getAllEvents:', error);
        throw error;
    }
};

const getMRTStations = async (letter = '') => {
    try {
        const pool = await getPool();
        let query = `
            SELECT DISTINCT nearestMRT 
            FROM events 
            WHERE nearestMRT IS NOT NULL AND nearestMRT != ''
        `;
        
        const request = pool.request();
        
        if (letter && letter !== '') {
            query += ` AND UPPER(LEFT(nearestMRT, 1)) = @letter`;
            request.input('letter', sql.VarChar, letter);
        }
        
        query += ` ORDER BY nearestMRT`;
        
        console.log('Executing MRT query:', query);
        
        const result = await request.query(query);
        return result.recordset.map(row => row.nearestMRT);
    } catch (error) {
        console.error('Error in eventModel.getMRTStations:', error);
        throw error;
    }
};

const getEventById = async (eventId) => {
    try {
        const pool = await getPool();
        const request = pool.request();
        
        const query = `
            SELECT eventId, header, intro, location, start_time, nearestMRT, longIntro
            FROM events
            WHERE eventId = @eventId
        `;
        
        request.input('eventId', sql.Int, eventId);
        
        const result = await request.query(query);
        console.log('Event query result:', result.recordset);
        
        if (result.recordset.length === 0) {
            return null;
        }
        
        return result.recordset[0];
    } catch (error) {
        console.error('Error in eventModel.getEventById:', error);
        throw error;
    }
};

module.exports = {
    getAllEvents,
    getMRTStations,
    getEventById
};