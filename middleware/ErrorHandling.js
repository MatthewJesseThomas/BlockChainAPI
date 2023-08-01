function errorHandling(err, req, res, next) {
    if (err) {
        let status = err.status || 500;
        console.log(err);
        res.status(status).json(
            {
                status: status,
                err: "Error Incurred, Please Try Again Later!"
            }
        )
    }
    next();
}
module.exports = { errorHandling };