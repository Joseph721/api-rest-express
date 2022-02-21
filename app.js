const debug = require('debug')('app:inicio');
// const dbDebug = require('debug')('app:db');
const usuarios = require('./routes/usuarios');
const express = require('express');
const config = require('config');
const logger = require('./logger');
const morgan = require('morgan');
const app = express();


//Funcion middleware para traer el contexto de body en formato JSON.
//de ahi se envia a una funcion de tipo ruta app.get,post,put,delete. (protolo HTTP)
app.use(express.json()); //body
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/api/users', usuarios);

//Configuración de entornos.
console.log('Aplicación: ' + config.get('nombre'));
console.log('BD server: ' + config.get('configDB.host'));


//Uso de un middleware de terceros - Morgan
//Este middleware de terceros sirve para mostrar
//las peticiones http asi como el tiempo de respuesta en milisegundos. (Logs)

if (app.get('env') === 'development') {
    //En caso de que el entorno esté en desarrollo,
    //Morgan estará habilitado para conocer los logs.
    //Si el entorno pasa a production, entonces, morgan ya no se habilita.
    app.use(morgan('tiny'));
    // console.log("Morgan habilitado...");
    debug('Morgan está habilitado...');
}

//Trabajos con la base de datos.
debug('Conectando con la base de datos...');


//Funcion MiddleWare personalizada (por nosotros mismos)
//next: para que pueda seguir la ejecución
app.use(logger);
app.use(function (req, res, next) {
    console.log("Autenticando...");
    next();
});

app.use(function (req, res, next) {
    console.log("Time:", Date.now());
    next();
});

app.get("/", (req, res) => {
    res.send("Hola Mundo desde Express ;)");
}); //Peticion


const port = process.env.PORT || 3000; // Variable de entorno
app.listen(port, () => {
    console.log(`Escuchando en el puerto: ${port}...`);
});

