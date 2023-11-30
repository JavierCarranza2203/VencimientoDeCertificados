const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2');
var xl = require('excel4node');

const app = new express();

app.use(cors());

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ny-ox9Kq*shopg_X',
    database: 'despacho_contable'
});

app.get('/clientes_por_vencer', (req, res) =>{
    let consulta = "SELECT * FROM clientes_certificados";

    connection.query(consulta, function(err, results, fields){
        res.json(results);
    });
});

app.listen(8082, (req, res)=>{
    console.log("Servidor corriendo en el puerto 8082");
});