const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2');
const ExcelJs = require('exceljs');
const fs = require('fs/promises');
const path = require('path');

const app = new express();

//Variable para el puerto en el que se abre el servidor
const serverPort = 8082;

//Para permitir el acceso desde cualquier server
app.use(cors());

//Crea la conexión para ingresar a la base de datos
const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'RG_2023*LOCALHOST',
    database: 'db_despacho_contable'
});

//Metodo get
app.get('/clientes_por_vencer/excel', (req, res) => {
    try{
        //Consulta para mandar como query de SQL
        let consulta = "SELECT * FROM clientes_certificados";

        //Activa la conexión y hace la consulta para después mandar a llamar una función
        connection.query(consulta, function(err, results, fields){
            //Se instancia el nuevo libro de excel
            let workbook = new ExcelJs.Workbook();
            //Agrega una página al libro
            const sheet = workbook.addWorksheet("Clientes por vencer este año");

            //Agrega las columnas
            sheet.columns = [
                { header: "RFC", key: "rfc", width: 40 },
                { header: "Nombre completo", key: "nombre", width: 40 },
                { header: "Grupo de clientes", key: "grupo_clientes", width: 17 },
                { header: "Estatus de la firma", key: "status_firma", width: 20 },
                { header: "Fecha de expiración de la firma", key: "fecha_vencimiento_firma", width: 30},
                { header: "Estatus del sello", key: "status_sello", width: 20 },
                { header: "Fecha de expiración del sello", key: "fecha_vencimiento_sello", width: 30}
            ];

            //Agrega los renglones de acuerdo a los datos obtenidos de la consulta
            results.forEach(row => {
                sheet.addRow([row['rfc'], row['nombre'], row['grupo_clientes'], row['status_firma'],
                    row['fecha_vencimiento_firma'], row['status_sello'], row['fecha_vencimiento_sello'],]);
            });

            //Se guarda el excel y se manda el archivo al cliente
            workbook.xlsx.writeBuffer().then(excelBuffer => {
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');
                res.send(excelBuffer);
            });
        });
    }
    catch(error){
        res.status(500).send("Error en el servidor: " + error);
    }
});

app.listen(serverPort, (req, res)=>{
    console.log("Servidor corriendo en el puerto: " + serverPort);
});