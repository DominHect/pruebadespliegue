var express = require("express");

var app = express();

var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

// ==============================================
// Busqueda por colección
// ==============================================

app.get("/coleccion/:tipo/:busqueda", (req, res, next) => {
  var busqueda = req.params.busqueda;
  var tipo = req.params.tipo;
  var regex = new RegExp(busqueda, "i");

  var promesa;

  switch( tipo ){

    case 'hospitales':
      promesa = buscarHospitales(busqueda, regex);
    break;
    case 'medicos':
      promesa = buscarMedicos(busqueda, regex);
    break;
    case 'usuarios':
      promesa = buscarUsuarios(busqueda, regex);
    break;

      default: 
        return  res.status(200).json({
                  ok: false,
                  mensaje: 'Sólo hospitales, medicos o usuarios',
                  message: 'Tipo de tabla o colección no valido'
                });
    }

    promesa.then( data => {
      res.status(200).json({
        ok: true,
        [tipo]: data
      });
    })

  });


// ==============================================
// Busqueda general
// ==============================================

app.get("/todo/:busqueda", (req, res, next) => {
  var busqueda = req.params.busqueda;
  var regex = new RegExp(busqueda, "i");

  Promise.all([
      buscarHospitales(busqueda, regex),
      buscarMedicos(busqueda, regex),
      buscarUsuarios(busqueda, regex)
    ])
    .then(respuestas => {

        res.status(200).json({
          ok: true,
          hospitales: respuestas[0],
          medicos: respuestas[1],
          usuarios: respuestas[2]
        });
      })
  });

function buscarHospitales(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {
              if (err) {
                reject("Error al cargar hospitales", err);
              } else {
                resolve(hospitales);
              }
            });

  });
}
function buscarMedicos(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
          .populate('usuario', 'nombre email img')
          .populate('hospital')
          .exec((err, medicos) => {
            if (err) {
              reject("Error al cargar medicos", err);
            } else {
              resolve(medicos);
            }
          });
  });
}
function buscarUsuarios(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, 'nombre email role img')
          .or([ { 'nombre': regex }, { 'email': regex } ])
          .exec((err, usuarios) => {

            if (err) {
              reject("Error al cargar usuarios", err);
            } else {
              resolve(usuarios);
            }

          })

});
};

module.exports = app;
