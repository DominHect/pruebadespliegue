var express = require("express");

const fileUpload = require("express-fileupload");
var fs = require("fs");

var app = express();


// Modelos
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");
var Usuario = require("../models/usuario");

// default options
app.use(fileUpload());

app.put("/:tipo/:id", (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  var tiposValidos = ["hospitales", "medicos", "usuarios"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo no valido",
      errors: { menssage: `Debe seleccionar ${tiposValidos.join(", ")}` }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No seleccionó ninguna imagen",
      errors: { menssage: "Debe seleccionar alguna imagen" }
    });
  }

  // Obtener el nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split(".");
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // Extensiones aceptadas
  var extensionesAceptadas = ["png", "jpg", "gif", "jpeg"];

  if (extensionesAceptadas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extensión no admintida",
      errors: {
        menssage: `Las extensiones válidas son ${extensionesAceptadas.join(", ")}`
      }
    });
  }

  // Nombre de archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  // Mover archivo del temporal a un path
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {
    if(err){
        return res.status(500).json({
            ok: false,
            mensaje: "Error al mover archivo",
            errors: err
        });    
    }

  });

  subirPorTipo(tipo, id, nombreArchivo, res);

//   res.status(200).json({
//     ok: true,
//     mensaje: "Archivo movido",
//     extensionArchivo: nombreArchivo
//   });

});


function subirPorTipo(tipo, id, nombreArchivo, res){

    if( tipo === 'hospitales' ){
        Hospital.findById(id, (err, hospital) => {
            if(!hospital){
                return res.status(400).json({
                    ok: false,
                    mensaje: "El hospital no existe",
                    errors: {menssage: "El hospital no existe"}
                });    
            }
            var pathViejo = "./uploads/hospitales/" + hospital.img;

            // Si existe elimina la imagen anterior
            if( fs.existsSync( pathViejo )){
                fs.unlink( pathViejo );
            }

            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de hospital actualizada",
                    hospital: hospitalActualizado
                });  
            })
        });
    }
    if( tipo === 'medicos' ){
        Medico.findById(id, (err, medico) => {
            if(!medico){
                return res.status(400).json({
                    ok: false,
                    mensaje: "El medico no existe",
                    errors: {menssage: "El medico no existe"}
                });    
            }
            var pathViejo = "./uploads/medicos/" + medico.img;

            // Si existe elimina la imagen anterior
            if( fs.existsSync( pathViejo )){
                fs.unlink( pathViejo );
            }

            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de médico actualizada",
                    medico: medicoActualizado
                });  
            })
        });
    }
    if( tipo === 'usuarios' ){
        Usuario.findById(id, (err, usuario) => {
            if(!usuario){
                return res.status(400).json({
                    ok: false,
                    mensaje: "El usuario no existe",
                    errors: {menssage: "El usuario no existe"}
                });    
            }
            var pathViejo = "./uploads/usuarios/" + usuario.img;

            // Si existe elimina la imagen anterior
            if( fs.existsSync( pathViejo )){
                fs.unlink( pathViejo );
            }

            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de usuario actualizada",
                    usuario: usuarioActualizado
                });  
            })
        });
    }

}


module.exports = app;
