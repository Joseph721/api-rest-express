const express = require('express');
const Joi = require('joi');
const ruta = express.Router();



//Express es una aplicacion con un conjunto de middleware

// Metodos a implementar con su ruta asignada

// app.get(); //Peticiones
// app.post(); //Envio de datos
// app.put(); //Actualizacion
// app.delete(); //Eliminacion

// app.get('//:year/:mes', (req, res) => {
//     // res.send(req.params);
//     res.send(req.query);
// });

const usuarios = [
    { id: 1, nombre: "Joseph" },
    { id: 2, nombre: "Juan" },
    { id: 3, nombre: "Laura" },
];

ruta.get("/", (req, res) => {
    res.send(usuarios);
});

ruta.get("/:id", (req, res) => {
    // let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(req.params.id);
    if (!usuario) res.status(404).send("El usuario no fue encontrado.");
    res.send(usuario);
});

ruta.post("/", (req, res) => {
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

ruta.put("//:id", (req, res) => {
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

ruta.delete("/:id", (req, res) => {
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

module.exports = ruta;