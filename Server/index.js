import express from 'express';
import cors from 'cors';
import { createPool } from 'mysql2/promise';
import ExcelJS from 'exceljs';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
const upload = multer({ dest: 'uploads/' });
import { AgregarEncabezados, AgregarRenglonesPorGrupoDeClientes, LlenarHojaDeRelacionDeGastos, LlenarFormulasDiot, AgregarTotalesDiot, CalcularSubTotal, CalcularValorParaMostrar, AsignarAnchoAColumnas } from './MetodosExcel.js';
import { RegresarRegistrosPorVencer, FiltarRegistroPorVencerEnLaSemana } from './MetodosServer.js';
import { Relacion } from './Relacion.js';
import { Factura } from './Factura.js';
import xml2js from 'xml2js';

const app = new express();
let LibroDeGastos;
let DatosOriginales;

app.use(express.json({ limit: "2mb", extended: true }));
app.use(express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }))

//Variable para el puerto en el que se abre el servidor
const serverPort = 8082;

//Para permitir el acceso desde cualquier server
app.use(cors());

//Crea una variable para almacenar un archivo en caché
app.use((req, res, next)=>{
    req.workbook = LibroDeGastos;
    req.datosOriginales = DatosOriginales;
    next();
});

//Conexión a la base de datos
const pool = createPool({
    host: 'localhost',
    user: 'root',
    password: 'RG_2023*LOCALHOST',
    database: 'db_despacho_contable',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 2,
});

//Metodo get para obtener los clientes que van a vencer el año actual
app.get('/clientes_por_vencer', async(req, res) => {
    try {
        let consulta = "";
        
        if(typeof(req.query.grupo) == 'undefined') {
            //Consulta para mandar como query de SQL cuando accede un admin o un developer
            consulta = "SELECT * FROM clientes_certificados";
        }
        else {
            //Consulta para mandar como query cuando accede un empleado
            consulta = `SELECT * FROM clientes_certificados WHERE grupo_clientes = '${req.query.grupo}'`;
        }

        //Activa la conexión y hace la consulta para después mandar a llamar una función
        const [rows, fields] = await pool.query(consulta);

        let data = RegresarRegistrosPorVencer(rows);
        data = FiltarRegistroPorVencerEnLaSemana(data);

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

        //Obtiene todos los clientes que van a vencer en el año
        let data = RegresarRegistrosPorVencer(results);

        //Se instancia el nuevo libro de excel
        let workbook = new ExcelJS.Workbook();

        const sheetClientesA_Semana = workbook.addWorksheet("Clientes A en dos semanas");
        const sheetClientesB_Semana = workbook.addWorksheet("Clientes B en dos semanas");
        const sheetClientesC_Semana = workbook.addWorksheet("Clientes C en dos semanas");

        //Agrega los encabezados a cada una se las páginas
        AgregarEncabezados([sheetClientesA_Semana, sheetClientesB_Semana, sheetClientesC_Semana]);

        //Filtra los clientes por semana
        data = FiltarRegistroPorVencerEnLaSemana(data);

        //Agrega los renglones a las paginas de los clientes que se vencen en la semana
        AgregarRenglonesPorGrupoDeClientes(sheetClientesA_Semana, data, 'A');
        AgregarRenglonesPorGrupoDeClientes(sheetClientesB_Semana, data, 'B');
        AgregarRenglonesPorGrupoDeClientes(sheetClientesC_Semana, data, 'C');

        if(data.length === 0) {
            res.status(403).send({ mensaje : "No hay clientes por vencer esta semana" })
        }
        else {
            //Se guarda el excel y se manda el archivo al cliente
            workbook.xlsx.writeBuffer().then(excelBuffer => {
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');
                res.send(excelBuffer);
            });
        }
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
        };
        
        res.send(mensaje);
    }
    catch(error) {
        res.status(500).send("Error en el servidor: " + error);
    }
});

//Método para generar el archivo de excel con la relación de gastos
app.post("/generar_relacion_de_gastos", multer({ dest: 'uploads/' }).none(), async (req, res) => {
    try {
        //Obtiene los datos del body
        const data = req.body;

        //Accede al libro de excel previamente almacenado en caché
        const workbook = req.workbook;

        if(req.query.orderBy === 'name') {
            data[0].sort(function(a, b) {
                if (a.NombreEmisor < b.NombreEmisor) {
                    return -1;
                }
                if (a.NombreEmisor > b.NombreEmisor) {
                    return 1;
                }
                return 0;
            });

            data[1].sort(function(a, b) {
                if (a.NombreEmisor < b.NombreEmisor) {
                    return -1;
                }
                if (a.NombreEmisor > b.NombreEmisor) {
                    return 1;
                }
                return 0;
            });
        }
        else {
            res.status(403).json({
                success: false,
                message: 'El parámetro enviado en la petición es incorrecto',
                error: error.message,
                });
        }

        //Agrega la hoja con el nombre "RESUMEN"
        const sheetResumen = workbook.addWorksheet("RESUMEN");

        //Manda a llamar al método para llenar la hoja y manda el array con la información intacta
        LlenarHojaDeRelacionDeGastos(sheetResumen, data[0], "RELACION DE GASTOS");

        //Protege la hoja "RESUMEN" para que la información no pueda ser modificada, asignando la contraseña por parametro
        sheetResumen.protect("SistemasRG");

        //Agrega la hoja "GASTOS"
        const sheetGastos = workbook.addWorksheet("GASTOS");

        LlenarHojaDeRelacionDeGastos(sheetGastos, data[1], "RELACION DE GASTOS", true);

        //Agrega la hoja "DIOT"
        const sheetDiot = workbook.addWorksheet("DIOT");

        //Asigna el tamaño de las columnas
        sheetDiot.getColumn('A').width = 3;
        sheetDiot.getColumn('B').width = 25.14;

        AsignarAnchoAColumnas(sheetDiot, ['C', 'D', 'E', 'F', 'H', 'I', 'J', 'K', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'V', 'W', 'X'], 0);
        AsignarAnchoAColumnas(sheetDiot, ['AB', 'AC'], 5);
        AsignarAnchoAColumnas(sheetDiot, ['Y', 'Z', 'AA', 'AD'], 13);
        AsignarAnchoAColumnas(sheetDiot, ['G', 'L', 'T', 'U'], 20);

        //Combina las celdas
        sheetDiot.mergeCells('B1:AD1');
        sheetDiot.mergeCells('B2:AD2');

        //Asigna el texto a las celdas para que sirvan como encabezados
        sheetDiot.getCell('B4').value = "RFC EMISOR";
        sheetDiot.getCell('G4').value = "SUBTOTAL 16%";
        sheetDiot.getCell('L4').value = "SUBTOTAL 8%";
        sheetDiot.getCell('T4').value = "SUBTOTAL 0%";
        sheetDiot.getCell('U4').value = "SUBTOTAL GASTOS";
        sheetDiot.getCell('Y4').value = "IVA 8%";
        sheetDiot.getCell('Z4').value = "IVA 16%";
        sheetDiot.getCell('AA4').value = "RET. IVA";
        sheetDiot.getCell('AD4').value = "DIFERENCIAS";

        //Array con la letras de las columnas de los headers
        const columnasDiot = ['B', 'G', 'L', 'T', 'U', 'Y', 'Z', 'AA', 'AD'];

        for(let i = 0; i < columnasDiot.length; i++) {
            sheetDiot.getCell(columnasDiot[i] + '4').font = { bold: true };
            sheetDiot.getCell(columnasDiot[i] + '4').alignment = { horizontal: 'center' };
        }

        //Array con las columnas que llevan información
        const arrayColumnas = ['B', 'G', 'L', 'T', 'AD', 'U', 'Y', 'Z', 'AA', 'AB', 'AC'];
        let columnaEncontrada = true, celda;

        //Ciclo para recorrer las 78 filas que manejan los contadores
        for(let i = 5; i <= 78; i++) {
            arrayColumnas.forEach(columna => {
                celda = sheetDiot.getCell(columna + i);
                
                columna == 'B'? LlenarFormulasDiot(celda, null, true, '') : 
                columna == 'G'? LlenarFormulasDiot(celda, { formula: `+ROUND(${ 'Z' + i } / ${ 0.16 }, 0)` }) : 
                columna == 'L'? LlenarFormulasDiot(celda, { formula: `+ROUND(${ 'Y' + i } / ${ 0.08 }, 0)` }) : 
                columna == 'T'? LlenarFormulasDiot(celda, { formula: `+ROUND(${ 'U' + i } - ${ 'G' + i } - ${ 'L' + i }, 0)` }) : 
                columna == 'AD'? LlenarFormulasDiot(celda, { formula: `=+${ 'U' + i }-${ 'G' + i }-${ 'L' + i }-${ 'T' + i }` }) : columnaEncontrada = false;

                if(!columnaEncontrada){
                    LlenarFormulasDiot(celda, null, true);
                }

                columnaEncontrada = true;
            });
        }

        for(let i = 1; i <= arrayColumnas.length - 3; i++){
            celda = sheetDiot.getCell(arrayColumnas[i] + 79);
            LlenarFormulasDiot(celda, { formula: `SUM(${ arrayColumnas[i] + 5 } : ${ arrayColumnas[i] + 78 })` }, true)

            celda.border = {
                top: { style:'thin', color: { argb:'00000000' } },
                bottom: { style:'double', color: { argb:'00000000' } }
            };
        }

        AgregarTotalesDiot(sheetDiot.getCell('G81'), sheetDiot.getCell('L81'), "TOTAL SUBTOTAL", { formula: `SUM(G79:T79)` });
        AgregarTotalesDiot(sheetDiot.getCell('T81'), sheetDiot.getCell('U81'), "TOTAL IVA", { formula: `SUM(Y79:Z79)` });
        AgregarTotalesDiot(sheetDiot.getCell('Y81'), sheetDiot.getCell('Z81'), "TOTAL RET.", { formula: `=+AA79` });

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

//Método para leer el archivo de con la información de los XML emitidos en el SAT
app.post('/leer_archivo', upload.single("ReporteDeGastos"), async (req, res) => {
    const filePath = req.file.path;

    try {
        const workbook = new ExcelJS.Workbook();
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
            rowData.Serie = row.getCell('I').value;
            rowData.Folio = row.getCell('J').value;
            rowData.RfcEmisor = row.getCell('M').value;
            rowData.NombreEmisor = row.getCell('N').value;
            rowData.Descuento = row.getCell('V').value;
            rowData.SubTotal = CalcularSubTotal(rowData.Tipo, row.getCell('U').value, rowData.Descuento);
            rowData.RetIsr = CalcularValorParaMostrar(rowData.Tipo, row.getCell('Z').value);
            rowData.RetIva = CalcularValorParaMostrar(rowData.Tipo, row.getCell('Y').value);
            rowData.Ieps = CalcularValorParaMostrar(rowData.Tipo, row.getCell('W').value);
            rowData.Iva8 = CalcularValorParaMostrar(rowData.Tipo, row.getCell('BE').value);
            rowData.Iva16 = CalcularValorParaMostrar(rowData.Tipo, row.getCell('X').value);
            rowData.Total = CalcularValorParaMostrar(rowData.Tipo, row.getCell('AB').value);
            rowData.Concepto = row.getCell('AO').value;

            if(rowData.NombreEmisor != null)
            {
                data.push(rowData);
            }
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({
        success: false,
        message: 'Error al leer el archivo de Excel',
        error: error.message,
        });
    }
});

app.get("/getXMLInfo", async(req, res)=> {
    const xmlPath = 'C:/AdminXML/BovedaCFDi/BAGA680128QQ7/Emitidas/2024/03/';

    fs.readdirSync(xmlPath).forEach((file) => {
        const filePath = path.join(xmlPath, file);

        if (path.extname(file) === '.xml') {
            // Read the XML file
            const xmlData = fs.readFileSync(filePath, 'utf8');

            // Parse the XML data
            const result = xml2js.parseString(xmlData, (err, result) => {
                if (err) {
                    console.error(err);
                    return;
                }

                // Extract the required information
                let factura = new Factura(result["cfdi:Comprobante"]);
                console.log(factura);
            });
        }
    });
});


//Método para generar el archivo de excel de la relación de ingresos
app.post("/generar_relacion_de_ingresos", multer({ dest: 'uploads/' }).none(), async(req, res)=>{
    try {
        //Obtiene los datos del body
        const data = req.body

        if(req.query.orderBy === 'id') {
            data[1].sort(function(a, b) {
                if (a.Folio < b.Folio) {
                    return -1;
                }
                if (a.Folio > b.Folio) {
                    return 1;
                }
                return 0;
            });

            data[0].sort(function(a, b) {
                if (a.Folio < b.Folio) {
                    return -1;
                }
                if (a.Folio > b.Folio) {
                    return 1;
                }
                return 0;
            });
        }
        else {
            res.status(403).json({
                success: false,
                message: 'El parámetro enviado en la petición es incorrecto',
                error: error.message,
                });
        }

        //Accede al libro de excel previamente almacenado en caché
        const workbook = req.workbook;

        //Agrega la hoja con el nombre "RESUMEN"
        const HojaResumen = workbook.addWorksheet("RESUMEN");

        //Manda a llamar al método para llenar la hoja y manda el array con la información intacta
        LlenarHojaDeRelacionDeGastos(HojaResumen, data[0], "RELACION DE INGRESOS");

        //Protege la hoja "RESUMEN" para que la información no pueda ser modificada, asignando la contraseña por parametro
        HojaResumen.protect("SistemasRG");

        //Agrega la hoja "GASTOS"
        const HojaGastos = workbook.addWorksheet("INGRESOS");

        LlenarHojaDeRelacionDeGastos(HojaGastos, data[1], "RELACION DE INGRESOS", true);

        workbook.xlsx.writeBuffer().then(excelBuffer => {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');
            res.send(excelBuffer);

            req.workbook = null;
        });
    }
    catch(error) {
        res.status(500).json({
            success: false,
            message: 'Error al generar el archivo',
            error: error.message,
            });
    }
});

//Inicia el servidor
app.listen(serverPort, (req, res)=> {
    console.log("Servidor corriendo en el puerto: " + serverPort);
});

//Sirve para manejar excepciones no controladas por alguna razón y que el servidor no se apague.
process.on('unhandledRejection', (error, promise) => {
    console.log('Error en este código: ', promise);
    console.log("==================================");
    console.log('El error fué: ', error );
});