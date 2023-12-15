const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2');
const ExcelJs = require('exceljs');
const excelActions = require('./MetodosExcel.js');
const serverActions = require('./MetodosServer.js');

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

//Metodo get para obtener los clientes que van a vencer el año actual
app.get('/clientes_por_vencer', (req, res) => {
    try {
        let consulta = "";
        
        if(typeof(req.query.grupo) == 'undefined') 
        {
            //Consulta para mandar como query de SQL cuando accede un admin o un developer
            consulta = "SELECT * FROM clientes_certificados";
        }
        else 
        {
            //Consulta para mandar como query cuando accede un empleado
            consulta = `SELECT * FROM clientes_certificados WHERE grupo_clientes = '${req.query.grupo}'`;
        }

        //Activa la conexión y hace la consulta para después mandar a llamar una función
        connection.query(consulta, function(err, results, fields) {

            const data = serverActions.RegresarRegistrosPorVencer(results);

            res.json(data);
        });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).send(error.message);
    }
});

//Metodo get para obtener el archivo
app.get('/clientes_por_vencer/excel', (req, res) => {
    try {
        //Consulta para mandar como query de SQL
        let consulta = "SELECT * FROM clientes_certificados";

        //Activa la conexión y hace la consulta para después mandar a llamar una función
        connection.query(consulta, function(err, results, fields) {

            //Obtiene todos los clientes que van a vencer en el año
            let data = serverActions.RegresarRegistrosPorVencer(results);

            //Se instancia el nuevo libro de excel
            let workbook = new ExcelJs.Workbook();

            //Agrega las páginas al libro
            const sheet = workbook.addWorksheet("Clientes por vencer este año");
            const sheetClientesA = workbook.addWorksheet("Clientes A");
            const sheetClientesB = workbook.addWorksheet("Clientes B");
            const sheetClientesC = workbook.addWorksheet("Clientes C");
            const sheetClientesA_Semana = workbook.addWorksheet("Clientes A esta semana");
            const sheetClientesB_Semana = workbook.addWorksheet("Clientes B esta semana");
            const sheetClientesC_Semana = workbook.addWorksheet("Clientes C esta semana");
            
            //Agrega los encabezados a cada una se las páginas
            excelActions.AgregarEncabezados([sheet, sheetClientesA, sheetClientesB, sheetClientesC, sheetClientesA_Semana, sheetClientesB_Semana, sheetClientesC_Semana]);

            //Agrega los renglones a la primer página
            excelActions.AgregarRenglones(sheet, data);

            //Agrega los renglones a las demás páginas separando el grupo del cliente
            excelActions.AgregarRenglonesPorGrupoDeClientes(sheetClientesA, data, 'A');
            excelActions.AgregarRenglonesPorGrupoDeClientes(sheetClientesB, data, 'B');
            excelActions.AgregarRenglonesPorGrupoDeClientes(sheetClientesC, data, 'C');

            //Filtra los clientes por semana
            data = serverActions.FiltarRegistroPorVencerEnLaSemana(data);

            //Agrega los renglones a las paginas de los clientes que se vencen en la semana
            excelActions.AgregarRenglonesPorGrupoDeClientes(sheetClientesA_Semana, data, 'A');
            excelActions.AgregarRenglonesPorGrupoDeClientes(sheetClientesB_Semana, data, 'B');
            excelActions.AgregarRenglonesPorGrupoDeClientes(sheetClientesC_Semana, data, 'C');

            //Se guarda el excel y se manda el archivo al cliente
            workbook.xlsx.writeBuffer().then(excelBuffer => {
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');
                res.send(excelBuffer);
            });
        });
    }
    catch(error) {
        res.status(500).send("Error en el servidor: " + error);
    }
});

//Metodo get para probar la petición
app.get("/test", (req, res)=>{
    try {
        let mensaje = {
            port: "8082",
            server: "localhost",
            url: "http://localhost:8082/test",
            message: "El test se hizo correctamente",
            method: "GET"
        }

        res.send(mensaje);
    }
    catch(error) {
        res.status(500).send("Error en el servidor: " + error);
    }
});

app.listen(serverPort, (req, res)=> {
    console.log("Servidor corriendo en el puerto: " + serverPort);
});