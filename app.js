const debug = require('debug')('app:inicio');
// const dbDebug = require('debug')('app:db');
const express = require('express');
const config = require('config');
const logger = require('./logger');
const morgan = require('morgan');
const Joi = require('joi');
const app = express();

//Funcion middleware para traer el contexto de body en formato JSON.
//de ahi se envia a una funcion de tipo ruta app.get,post,put,delete. (protolo HTTP)
app.use(express.json()); //body
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

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

//Express es una aplicacion con un conjunto de middleware

// Metodos a implementar con su ruta asignada

// app.get(); //Peticiones
// app.post(); //Envio de datos
// app.put(); //Actualizacion
// app.delete(); //Eliminacion

app.get("/", (req, res) => {
    res.send("Hola Mundo desde Express ;)");
}); //Peticion

app.get("/api/users", (req, res) => {
    res.send(usuarios);
});

// app.get('/api/users/:year/:mes', (req, res) => {
//     // res.send(req.params);
//     res.send(req.query);
// });

const usuarios = [
    { id: 1, nombre: "Joseph" },
    { id: 2, nombre: "Juan" },
    { id: 3, nombre: "Laura" },
];

app.get("/api/users/:id", (req, res) => {
    // let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(req.params.id);
    if (!usuario) res.status(404).send("El usuario no fue encontrado.");
    res.send(usuario);
});

app.post("/api/users", (req, res) => {
    // let body = req.body;
    // console.log(body.nombre);
    // res.json({
    //     body,
    // });

    //Validacion con libreria Joi
    const schema = Joi.object({
        nombre: Joi.string().min(3).required(),
    });

    const { error, value } = validacionUsuario(req.body.nombre);
    if (!error) {
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    } else {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }

    // if (!req.body.nombre || req.body.nombre.length <= 2) { //Si no existe...
    //     //400 Bad Request
    //     res.status(400).send('Debe ingresar un nombre, que tenga minimo 3 letras.');
    //     return; //Termina el metodo cuando detecta un valor vacio.
    // }
    // const usuario = {
    //     id: usuarios.length + 1,
    //     nombre: req.body.nombre
    // };
    // usuarios.push(usuario);
    // res.send(usuario);
});

app.put("/api/users/:id", (req, res) => {
    //Encontrar si existe el objeto usuario que se va a modificar.
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send("El usuario no fue encontrado.");
        return;
    }

    const { error, value } = validacionUsuario(req.body.nombre);
    if (error) {
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);
});

app.delete("/api/users/:id", (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).send("El usuario no fue encontrado.");
        return;
    }

    //Devuelve el indice de usuarios
    const index = usuarios.indexOf(usuario);
    //Se indica cuantos elementos se quieren eliminar, ya que si solo se manda el index, se eliminarán todos los elementos del array.
    usuarios.splice(index, 1);

    //Enviar el arreglo actualizado sin el elemento eliminado.
    res.send(usuarios);

    //Enviar el usuario eliminado
    // res.send(usuario);
});

const port = process.env.PORT || 3000; // Variable de entorno
app.listen(port, () => {
    console.log(`Escuchando en el puerto: ${port}...`);
});

function existeUsuario(id) {
    return usuarios.find((u) => u.id === parseInt(id));
}

function validacionUsuario(nom) {
    //Validacion con libreria Joi
    const schema = Joi.object({
        nombre: Joi.string().min(3).required(),
    });

    return schema.validate({ nombre: nom });
}
