const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2');
const ExcelJs = require('exceljs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const excelActions = require('./MetodosExcel.js');
const serverActions = require('./MetodosServer.js');
const clase = require('./Factura.js');

const app = new express();

app.use(express.json());

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

            if(results.length == 0) 
            {
                res.send({mensaje: "No hay datos para enviar"})
            }

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

app.post("/generar_relacion_de_gastos", multer({ dest: 'uploads/' }).none(), async (req, res) => {
    const data = req.body

    const workbook = new ExcelJs.Workbook();
    const Relacion = new clase.Relacion(data);

    const sheetResumen = workbook.addWorksheet("RESUMEN");

    excelActions.AsignarAnchoACeldas(sheetResumen);
    let fechaActual = new Date().getFullYear();

    sheetResumen.mergeCells('A1:N1');
    sheetResumen.mergeCells('A2:N2');
    sheetResumen.getCell('A2').value = "GASTOS MES DE " + fechaActual;
    sheetResumen.getCell('A2').font = { bold:true };
    sheetResumen.addRow();

    sheetResumen.addRow(['', '', 'Fecha', 'Serie', 'Folio', 'RFC Emisor', 'Nombre Emisor', 'Sub Total', 'Ret. ISR', 'Ret. IVA', 'IEPS', 'IVA 8%', 'IVA 16%', 'Total']);

    sheetResumen.getRow(4).eachCell(cell => {
        cell.font = { bold: true };
    });

    Relacion.Datos.forEach(row => {
        sheetResumen.addRow(['', '', row.Fecha, row.Serie, row.Folio, row.RfcEmisor, row.NombreEmisor, excelActions.FormatearCadena(row.SubTotal), row.RetIsr == 0? "-" : row.RetIsr, row.RetIva == 0? "-" : row.RetIva,
            row.Ieps == 0? "-" : row.RetIeps, row.Iva8 == 0? "-" : row.Iva8, row.Iva16 == 0? "-" : row.Iva16, excelActions.FormatearCadena(row.Total)]);
    });

    const sheetGastos = workbook.addWorksheet("GASTOS");

    excelActions.AsignarAnchoACeldas(sheetGastos);

    sheetGastos.mergeCells('A1:N1');
    sheetGastos.mergeCells('A2:N2');
    sheetGastos.getCell('A2').value = "GASTOS MES DE " + fechaActual;
    sheetGastos.getCell('A2').font = { bold:true };
    sheetGastos.addRow();

    sheetGastos.addRow(['', '', 'Fecha', 'Serie', 'Folio', 'RFC Emisor', 'Nombre Emisor', 'Sub Total', 'Ret. ISR', 'Ret. IVA', 'IEPS', 'IVA 8%', 'IVA 16%', 'Total']);

    sheetGastos.getRow(4).eachCell(cell => {
        cell.font = { bold: true };
    });

    Relacion.Datos.forEach(row => {
        sheetGastos.addRow(['', '', row.Fecha, row.Serie, row.Folio, row.RfcEmisor, row.NombreEmisor, excelActions.FormatearCadena(row.SubTotal), row.RetIsr == 0? "-" : row.RetIsr, row.RetIva == 0? "-" : row.RetIva,
            row.Ieps == 0? "-" : row.RetIeps, row.Iva8 == 0? "-" : row.Iva8, row.Iva16 == 0? "-" : row.Iva16, excelActions.FormatearCadena(row.Total)]);
    });

    sheetGastos.addRow(['', '', '', '', '', '', 'Total de gastos:', Relacion.CalcularSubTotal(), 
        Relacion.CalcularSumaRetencionIsr(), Relacion.CalcularSumaRetIva(), Relacion.CalcularSumaIeps(),
        Relacion.CalcularSumaIva8(), Relacion.CalcularSumaIva16(), Relacion.CalcularSumaTotal()]);


    workbook.xlsx.writeBuffer().then(excelBuffer => {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');
        res.send(excelBuffer);
    });
});

app.post('/leer_archivo_gastos', upload.single("ReporteDeGastos"), async (req, res) => {
    const filePath = req.file.path;

    try {
        const workbook = new ExcelJs.Workbook();
        await workbook.xlsx.readFile(filePath);

        const sheet = workbook.worksheets[0];

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

app.listen(serverPort, (req, res)=> {
    console.log("Servidor corriendo en el puerto: " + serverPort);
});

process.on('unhandledRejection', (error, promise) => {
    console.log(' Oh Lord! We forgot to handle a promise rejection here: ', promise);
    console.log(' The error was: ', error );
})