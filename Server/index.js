const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2');

const app = new express();

app.use(cors());

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ny-ox9Kq*shopg_X',
    database: 'despacho_contable'
});



app.get('/clientes_admin', (req, res) => {
    let consulta = "SELECT * FROM clientes_certificados";

    connection.query(consulta, function(err, results, fields){
        res.json(results);
    });
});

app.get('/clientes_por_grupo', (req, res) => {
    let grupo = req.query.grupo;

    if(typeof(grupo) == "undefined"){
        throw new Error("El grupo no es válido");
    }
    let consulta = `SELECT * FROM clientes_certificados WHERE grupo_clientes=${grupo}`;
    console.log(consulta);

    connection.query(consulta, function(err, results, fields){
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json(results);
    });
});

app.get('/clientes_por_vencer', (req, res) => {
    let consulta = "SELECT * FROM clientes_certificados";

    connection.query(consulta, function(err, results, fields){
        res.json(results);
    });
});

app.listen(8082, (req, res)=>{
    console.log("Servidor corriendo en el puerto 8082");
});