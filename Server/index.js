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

//Metodo get para obtener el archivo
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
                sheet.addRow([row['rfc'], row['nombre'], row['grupo_clientes'], row['status_firma'] == 1? "Vigente" : "Vencido",
                    row['fecha_vencimiento_firma'], row['status_sello'] == 1? "Vigente" : "Vencido", row['fecha_vencimiento_sello'],]);
            });

            // Estilos para los encabezados
            sheet.getCell('A1').font = { name: 'Arial', size: 13, bold: true };
            sheet.getCell('B1').font = { name: 'Arial', size: 13, bold: true };
            sheet.getCell('C1').font = { name: 'Arial', size: 13, bold: true };
            sheet.getCell('D1').font = { name: 'Arial', size: 13, bold: true };
            sheet.getCell('E1').font = { name: 'Arial', size: 13, bold: true };
            sheet.getCell('F1').font = { name: 'Arial', size: 13, bold: true };
            sheet.getCell('G1').font = { name: 'Arial', size: 13, bold: true };

            // Estilos para los encabezados de las columnas
            sheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '385592' } };
            sheet.getCell('A1').font = { color: { argb: 'FFFFFF'} };
            sheet.getCell('B1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '385592' } };
            sheet.getCell('B1').font = { color: { argb: 'FFFFFF'} };
            sheet.getCell('C1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '385592' } };
            sheet.getCell('C1').font = { color: { argb: 'FFFFFF'} };
            sheet.getCell('D1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '385592' } };
            sheet.getCell('D1').font = { color: { argb: 'FFFFFF'} };
            sheet.getCell('E1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '385592' } };
            sheet.getCell('E1').font = { color: { argb: 'FFFFFF'} };
            sheet.getCell('F1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '385592' } };
            sheet.getCell('F1').font = { color: { argb: 'FFFFFF'} };
            sheet.getCell('G1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '385592' } };
            sheet.getCell('G1').font = { color: { argb: 'FFFFFF'} };

            // Estilos para el resto de las filas
            for(let i = 2; i <= results.length + 1; i++) {                
                // Asignar colores alternados a las filas pares e impares
                if(i % 2 === 0) {
                    sheet.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }; // color claro
                } else {
                    sheet.getRow(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E0E0E0' } }; // color oscuro
                }
            }

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

//Metodo get para probar la petición
app.get("/test", (req, res)=>{
    try{
        let mensaje = {
            port: "8082",
            server: "localhost",
            url: "http://localhost:8082/test",
            message: "El test se hizo correctamente",
            method: "GET"
        }

        res.send(mensaje);
    }
    catch(error){
        res.status(500).send("Error en el servidor: " + error);
    }
});

app.listen(serverPort, (req, res)=>{
    console.log("Servidor corriendo en el puerto: " + serverPort);
});