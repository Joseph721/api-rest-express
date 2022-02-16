function log(req, res, next) {
    console.log("Logging...");
    //Llama al siguiente paso 
    next();
}

module.exports = log;