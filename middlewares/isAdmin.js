// use it in books routes <<CRUD>> after authmiddleware
const isAdmin = async (req, res, next) => {
    if (req.user && req.user.role == "admin") {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied' });
    }
}

module.exports = isAdmin;