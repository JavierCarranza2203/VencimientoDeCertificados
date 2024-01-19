const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2/promise');
const ExcelJs = require('exceljs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const excelActions = require('./MetodosExcel.js');
const serverActions = require('./MetodosServer.js');
const clase = require('./Factura.js');

const app = new express();
let LibroDeGastos;

app.use(express.json());

//Variable para el puerto en el que se abre el servidor
const serverPort = 8082;

//Para permitir el acceso desde cualquier server
app.use(cors());

app.use((req, res, next)=>{
    req.workbook = LibroDeGastos;
    next();
});

const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: 'RG_2023*LOCALHOST',
    database: 'db_despacho_contable',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

//Metodo get para obtener los clientes que van a vencer el año actual
app.get('/clientes_por_vencer', async(req, res) => {
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
        const [rows, fields] = await pool.query(consulta);

        const data = serverActions.RegresarRegistrosPorVencer(rows);

        res.json(data);
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).send(error.message);
    }
});

//Metodo get para obtener el archivo con la listo de los clientes
app.get('/clientes_por_vencer/excel', async(req, res) => {
    try {
        //Consulta para mandar como query de SQL
        let consulta = "SELECT * FROM clientes_certificados";

        //Activa la conexión y hace la consulta para después mandar a llamar una función
        const [results, fields] = await pool.query(consulta);

        if(results.length == 0) 
        {
            res.send({mensaje: "No hay datos para enviar"})
        }

        //Obtiene todos los clientes que van a vencer en el año
        let data = serverActions.RegresarRegistrosPorVencer(results);

        //Se instancia el nuevo libro de excel
        let workbook = new ExcelJs.Workbook();

        //Agrega las páginas al libro
        // const sheet = workbook.addWorksheet("Clientes por vencer este año");
        // const sheetClientesA = workbook.addWorksheet("Clientes A");
        // const sheetClientesB = workbook.addWorksheet("Clientes B");
        // const sheetClientesC = workbook.addWorksheet("Clientes C");
        const sheetClientesA_Semana = workbook.addWorksheet("Clientes A en dos semanas");
        const sheetClientesB_Semana = workbook.addWorksheet("Clientes B en dos semanas");
        const sheetClientesC_Semana = workbook.addWorksheet("Clientes C en dos semanas");
        
        //Agrega los encabezados a cada una se las páginas
        excelActions.AgregarEncabezados([/*sheet, sheetClientesA, sheetClientesB, sheetClientesC,*/ sheetClientesA_Semana, sheetClientesB_Semana, sheetClientesC_Semana]);

        //Agrega los renglones a la primer página
        // excelActions.AgregarRenglones(sheet, data);

        //Agrega los renglones a las demás páginas separando el grupo del cliente
        // excelActions.AgregarRenglonesPorGrupoDeClientes(sheetClientesA, data, 'A');
        // excelActions.AgregarRenglonesPorGrupoDeClientes(sheetClientesB, data, 'B');
        // excelActions.AgregarRenglonesPorGrupoDeClientes(sheetClientesC, data, 'C');

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
    }
    catch(error) {
        res.status(500).send("Error en el servidor: " + error);
    }
});

//Metodo get para probar la conexión del server
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

app.post("/generar_relacion_de_gastos", multer({ dest: 'uploads/' }).none(), async (req, res) => {
    try {
        const data = req.body

        const workbook = req.workbook;

        const sheetResumen = workbook.addWorksheet("RESUMEN");

        excelActions.LlenarHojaDeRelacionDeGastos(sheetResumen, data[0])

        sheetResumen.protect("SistemasRG");

        const sheetGastos = workbook.addWorksheet("GASTOS");

        excelActions.LlenarHojaDeRelacionDeGastos(sheetGastos, data[1], true);

        const sheetDiot = workbook.addWorksheet("DIOT");

        sheetDiot.getColumn('A').width = 3;
        sheetDiot.getColumn('B').width = 25.14;
        sheetDiot.getColumn('C').width = 0;
        sheetDiot.getColumn('D').width = 0;
        sheetDiot.getColumn('E').width = 0;
        sheetDiot.getColumn('F').width = 0;
        sheetDiot.getColumn('G').width = 20;
        sheetDiot.getColumn('H').width = 0;
        sheetDiot.getColumn('I').width = 0;
        sheetDiot.getColumn('J').width = 0;
        sheetDiot.getColumn('K').width = 0;
        sheetDiot.getColumn('L').width = 20;
        sheetDiot.getColumn('M').width = 0;
        sheetDiot.getColumn('N').width = 0;
        sheetDiot.getColumn('O').width = 0;
        sheetDiot.getColumn('P').width = 0;
        sheetDiot.getColumn('Q').width = 0;
        sheetDiot.getColumn('R').width = 0;
        sheetDiot.getColumn('S').width = 0;
        sheetDiot.getColumn('T').width = 20;
        sheetDiot.getColumn('U').width = 20;
        sheetDiot.getColumn('V').width = 0;
        sheetDiot.getColumn('W').width = 0;
        sheetDiot.getColumn('X').width = 0;
        sheetDiot.getColumn('Y').width = 13;
        sheetDiot.getColumn('Z').width = 13;
        sheetDiot.getColumn('AA').width = 13;
        sheetDiot.getColumn('AB').width = 5;
        sheetDiot.getColumn('AC').width = 5;
        sheetDiot.getColumn('AD').width = 13;

        sheetDiot.mergeCells('B1:AD1');
        sheetDiot.mergeCells('B2:AD2');

        sheetDiot.getCell('B4').value = "RFC EMISOR";
        sheetDiot.getCell('G4').value = "SUBTOTAL 16%";
        sheetDiot.getCell('L4').value = "SUBTOTAL 8%";
        sheetDiot.getCell('T4').value = "SUBTOTAL 0%";
        sheetDiot.getCell('U4').value = "SUBTOTAL GASTOS";
        sheetDiot.getCell('Y4').value = "IVA 8%";
        sheetDiot.getCell('Z4').value = "IVA 16%";
        sheetDiot.getCell('AA4').value = "RET. IVA";
        sheetDiot.getCell('AD4').value = "DIFERENCIAS";

        const columnasDiot = ['B', 'G', 'L', 'T', 'U', 'Y', 'Z', 'AA', 'AD'];

        for(let i = 0; i < columnasDiot.length; i++){
            sheetDiot.getCell(columnasDiot[i] + '4').font = { bold: true };
            sheetDiot.getCell(columnasDiot[i] + '4').alignment = { horizontal: 'center' };
        }

        const arrayColumnas = ['B', 'G', 'L', 'T', 'AD', 'U', 'Y', 'Z', 'AA', 'AB', 'AC'];
        let columnaEncontrada = true, celda;

        for(let i = 5; i <= 78; i++){
            arrayColumnas.forEach(columna => {
                celda = sheetDiot.getCell(columna + i);
                
                columna == 'B'? excelActions.LlenarFormulasDiot(celda, null, true, '') : 
                columna == 'G'? excelActions.LlenarFormulasDiot(celda, { formula: `+ROUND(${ 'Z' + i } / ${ 0.16 }, 0)` }) : 
                columna == 'L'? excelActions.LlenarFormulasDiot(celda, { formula: `+ROUND(${ 'Y' + i } / ${ 0.08 }, 0)` }) : 
                columna == 'T'? excelActions.LlenarFormulasDiot(celda, { formula: `+ROUND(${ 'U' + i } - ${ 'G' + i } - ${ 'L' + i }, 0)` }) : 
                columna == 'AD'? excelActions.LlenarFormulasDiot(celda, { formula: `=+${ 'U' + i }-${ 'G' + i }-${ 'L' + i }-${ 'T' + i }` }) : columnaEncontrada = false;

                if(!columnaEncontrada){
                    excelActions.LlenarFormulasDiot(celda, null, true);
                }

                columnaEncontrada = true;
            });
        }

        for(let i = 1; i <= arrayColumnas.length - 3; i++){
            celda = sheetDiot.getCell(arrayColumnas[i] + 79);
            excelActions.LlenarFormulasDiot(celda, { formula: `SUM(${ arrayColumnas[i] + 5 } : ${ arrayColumnas[i] + 78 })` }, true)

            celda.border = {
                top: { style:'thin', color: { argb:'00000000' } },
                bottom: { style:'double', color: { argb:'00000000' } }
            };
        }

        excelActions.AgregarTotalesDiot(sheetDiot.getCell('G81'), sheetDiot.getCell('L81'), "TOTAL SUBTOTAL", { formula: `SUM(G79:T79)` });
        excelActions.AgregarTotalesDiot(sheetDiot.getCell('T81'), sheetDiot.getCell('U81'), "TOTAL IVA", { formula: `SUM(Y79:Z79)` });
        excelActions.AgregarTotalesDiot(sheetDiot.getCell('Y81'), sheetDiot.getCell('Z81'), "TOTAL RET.", { formula: `=+AA79` });

        workbook.xlsx.writeBuffer().then(excelBuffer => {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');
            res.send(excelBuffer);

            req.workbook = null;
        });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: 'Error al generar el archivo',
            error: error.message,
            });
    }
});

app.post('/leer_archivo_gastos', upload.single("ReporteDeGastos"), async (req, res) => {
    const filePath = req.file.path;

    try {
        const workbook = new ExcelJs.Workbook();
        await workbook.xlsx.readFile(filePath);

        LibroDeGastos = workbook;

        const sheet = workbook.worksheets[0];
        sheet.name = "DATOS"

        const rowCount = sheet.rowCount;

        let data = [];

        for (let i = 2; i <= rowCount; i++) {
            const row = sheet.getRow(i);
            let rowData = {};

            rowData.Numero = i - 2;
            rowData.Tipo = row.getCell('D').value;
            rowData.Fecha = row.getCell('E').value;
            rowData.Fecha = row.getCell('E').value;
            rowData.Serie = row.getCell('I').value;
            rowData.Folio = row.getCell('J').value;
            rowData.RfcEmisor = row.getCell('M').value;
            rowData.NombreEmisor = row.getCell('N').value;
            rowData.Descuento = row.getCell('V').value;
            rowData.SubTotal = excelActions.CalcularSubTotal(rowData.Tipo, row.getCell('U').value, rowData.Descuento);
            rowData.RetIsr = excelActions.CalcularValorParaMostrar(rowData.Tipo, row.getCell('Z').value);
            rowData.RetIva = excelActions.CalcularValorParaMostrar(rowData.Tipo, row.getCell('Y').value);
            rowData.Ieps = excelActions.CalcularValorParaMostrar(rowData.Tipo, row.getCell('W').value);
            rowData.Iva8 = excelActions.CalcularValorParaMostrar(rowData.Tipo, row.getCell('BE').value);
            rowData.Iva16 = excelActions.CalcularValorParaMostrar(rowData.Tipo, row.getCell('X').value);
            rowData.Total = excelActions.CalcularValorParaMostrar(rowData.Tipo, row.getCell('AB').value);
            rowData.Concepto = row.getCell('AO').value;

            if(rowData.NombreEmisor != null)
            {
                data.push(rowData);
            }
        }

        data.sort(function(a, b) {
            if (a.NombreEmisor < b.NombreEmisor) {
                return -1;
            }
            if (a.NombreEmisor > b.NombreEmisor) {
                return 1;
            }
            return 0;
        });


        res.json(data);

    } catch (error) {
        res.status(500).json({
        success: false,
        message: 'Error al leer el archivo de Excel',
        error: error.message,
        });
    }
});

app.post("/generar_relacion_de_ingresos", multer({ dest: 'uploads/' }).none(), async (req, res) =>{
    
}); 

app.listen(serverPort, (req, res)=> {
    console.log("Servidor corriendo en el puerto: " + serverPort);
});

process.on('unhandledRejection', (error, promise) => {
    console.log(' Oh Lord! We forgot to handle a promise rejection here: ', promise);
    console.log(' The error was: ', error );
})