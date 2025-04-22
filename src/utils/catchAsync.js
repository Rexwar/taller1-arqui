const catchAsync = (fn) => (req, res, next) => 
    fn(req, res, next).catch(next);

module.exports = catchAsync;
// This function is a higher-order function that takes an asynchronous function (fn) as an argument and returns a new function.