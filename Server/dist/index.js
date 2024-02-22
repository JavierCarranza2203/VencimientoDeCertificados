import express from 'express';
import cors from 'cors';
import { createPool } from 'mysql2/promise';
import ExcelJS from 'exceljs';
import multer from 'multer';
import { AddHeaders, AddRowsByClientGroup } from './MetodosExcel.js';
import { RegresarRegistrosPorVencer, FiltarRegistroPorVencerEnLaSemana } from './MetodosServer.js';
import { Invoice } from './dist/Invoice.js';
import { InvoicesReport } from './dist/InvoicesReport.js';

const app = new express();
const upload = multer({ dest: 'uploads/' });
let LibroDeGastos;
let DatosOriginales;

//Variable para el puerto en el que se abre el servidor
const serverPort = 8082;

app.use(express.json({ limit: "2mb", extended: true }));
app.use(express.urlencoded({ limit: "10mb", extended: true, parameterLimit: 50000 }))

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

        const data = RegresarRegistrosPorVencer(rows);

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
        AddHeaders([sheetClientesA_Semana, sheetClientesB_Semana, sheetClientesC_Semana]);

        //Filtra los clientes por semana
        data = FiltarRegistroPorVencerEnLaSemana(data);

        //Agrega los renglones a las paginas de los clientes que se vencen en la semana
        AddRowsByClientGroup(sheetClientesA_Semana, data, 'A');
        AddRowsByClientGroup(sheetClientesB_Semana, data, 'B');
        AddRowsByClientGroup(sheetClientesC_Semana, data, 'C');

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
        
        let myInvoicesReport = new InvoicesReport();
        
        for (let i = 2; i <= rowCount; i++) {
            const row = sheet.getRow(i);

            let dateString = row.getCell('D').value;
            dateString = dateString.split('/');

            let myInvoice = new Invoice(i - 2, row.getCell('D').value, new Date(Date.parse(dateString[2] + "-" + dateString[1] + "-" + dateString[0])),
            row.getCell('I').value, row.getCell('J').value, row.getCell('M'), row.getCell('N'), row.getCell('V').value, row.getCell('AO').value);

            myInvoice.SubTotal = row.getCell('U').value;
            myInvoice.IsrRet = row.getCell('Z').value;
            myInvoice.IvaRet = row.getCell('Y').value;
            myInvoice.Ieps = row.getCell('W').value;
            myInvoice.IvaAtEightPercent = row.getCell('BE').value;
            myInvoice.IvaAtSixteenPercent = row.getCell('X').value;
            myInvoice.Total = row.get('AB').value;

            myInvoicesReport.AddInvoice(myInvoice);
        }

        if(req.query.orderBy === 'name') {
            myInvoicesReport.OrderInvoicesList((a, b) => a.SenderName.localeCompare(b.SenderName));
        }
        else if(req.query.orderBy === 'id') {
            myInvoicesReport.OrderInvoicesList((a, b) => a.Folio.localeCompare(b.Folio));
        }
        else {
            res.status(403).json({
                success: false,
                message: 'El parámetro enviado en la petición es incorrecto',
                error: error.message,
            });
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

//Método para generar el archivo de excel con la relación de gastos
app.post("/generar_relacion_de_gastos", multer({ dest: 'uploads/' }).none(), async (req, res) => {
    try {
        //Obtiene los datos del body
        const data = req.body;

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

//Método para generar el archivo de excel de la relación de ingresos
app.post("/generar_relacion_de_ingresos", multer({ dest: 'uploads/' }).none(), async(req, res)=>{
    try {
        //Obtiene los datos del body
        const data = req.body

        //Accede al libro de excel previamente almacenado en caché
        const workbook = req.workbook;

        //Agrega la hoja con el nombre "RESUMEN"
        const HojaResumen = workbook.addWorksheet("RESUMEN");

        //Manda a llamar al método para llenar la hoja y manda el array con la información intacta
        LlenarHojaDeRelacion(HojaResumen, data[0], "RELACION DE INGRESOS");

        //Protege la hoja "RESUMEN" para que la información no pueda ser modificada, asignando la contraseña por parametro
        HojaResumen.protect("SistemasRG");

        //Agrega la hoja "GASTOS"
        const HojaGastos = workbook.addWorksheet("INGRESOS");

        LlenarHojaDeRelacion(HojaGastos, data[1], "RELACION DE INGRESOS", true);

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
})