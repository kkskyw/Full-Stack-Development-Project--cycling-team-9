const validateEvent = (req, res, next) => {
    const { header, intro, location, time, requiredCertificationId } = req.body;

    if (!header)
        return res.status(400).json({ error: "Event header is required" });

    if (!intro)
        return res.status(400).json({ error: "Event intro is required" });

    if (!location)
        return res.status(400).json({ error: "Location is required" });

    if (!time)
        return res.status(400).json({ error: "Event time is required" });

    next();
};

module.exports = { validateEvent };
