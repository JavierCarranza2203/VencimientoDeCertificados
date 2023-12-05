const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2');
const ExcelJs = require('exceljs');
const fs = require('fs/promises');
const path = require('path');

const app = new express();

app.use(cors());

const connection = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ny-ox9Kq*shopg_X',
    database: 'despacho_contable'
});

app.get('/clientes_por_vencer/excel', (req, res) => {
    let consulta = "SELECT * FROM clientes_certificados";

    connection.query(consulta, function(err, results, fields){
        let workbook = new ExcelJs.Workbook();
        const sheet = workbook.addWorksheet("Clientes por vencer este año");

        const columnHeaders = fields.map(field => field.name);
        sheet.addRow(columnHeaders);

        results.forEach(row => {
            const rowData = columnHeaders.map(header => row[header]);
            sheet.addRow(rowData);
        });

        workbook.xlsx.writeBuffer().then(excelBuffer => {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');
            res.send(excelBuffer);
        });
    });
});

app.listen(8082, (req, res)=>{
    console.log("Servidor corriendo en el puerto 8082");
});