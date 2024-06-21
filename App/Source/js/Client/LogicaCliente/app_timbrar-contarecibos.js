import { PermitirAcceso } from "../../Functions/MetodosSinPeticion.js";
import { TimbrarContraRecibo } from "../../Functions/Peticiones.js";

const tableContainer = document.getElementById("wrapper");
let table;

window.addEventListener("load", async ()=> {
    PermitirAcceso().then(res => {
        InicializarTabla();
    });
});

function InicializarTabla() {
    const url = '../Controllers/ClienteController.php?Operacion=getCustomersWithTickets';

    table = new gridjs.Grid({
        search: true,
        columns: ["RFC", "Nombre del cliente", "Grupo de clientes", "Tarifa mensual", {
            name: 'Timbrar',
            formatter: (cell, row) => {
                const timbrarIcono = `<i class="fa-solid fa-bell" aria-hidden="true" title="Timbrar ContraRecibo"></i>`;

                return gridjs.html(`<div class="acciones">${timbrarIcono}</div>`);
            }
        }],
        server: {
            url: url,
            then: data => data.map(pago => [pago[0], pago[1], pago[2], pago[3]])
        },
        pagination: {
            limit: 11
        },
        language: {
            'search': {
                'placeholder': '🔍 Escriba para buscar...'
            }
        }
    }).render(tableContainer);
}

document.getElementById('btnTimbrarTodos').addEventListener('click', ()=> {
    Swal.fire({
        title: 'Timbrar todos por honorarios mensuales',
        html:
            '<label for="txtRfc" class="form__label">Concepto:</label>' +
            `<input id="txtRfc" class="double-form-container__form-input" value="HONORARIOS DEL MES DE" placeholder="Concepto" readonly><br>` +

            '<label for="cmbMesDeTimbrado" class="form__label">Seleccione el mes que aparecerá en el concepto:</label>' +
            '<select name="cmbMesDeTimbrado" id="cmbMesDeTimbrado" class="double-form-container__form-combobox">' +
                '<option value=""></option>' +
                '<option value="ENERO">ENERO</option>' +
                '<option value="FEBRERO">FEBRERO</option>' +
                '<option value="MARZO">MARZO</option>' +
                '<option value="ABRIL">ABRIL</option>' +
                '<option value="MAYO">MAYO</option>' +
                '<option value="JUNIO">JUNIO</option>' +
                '<option value="JULIO">JULIO</option>' +
                '<option value="AGOSTO">AGOSTO</option>' +
                '<option value="SEPTIEMBRE">SEPTIEMBRE</option>' +
                '<option value="OCTUBRE">OCTUBRE</option>' +
                '<option value="NOVIEMBRE">NOVIEMBRE</option>' +
                '<option value="DICIEMBRE">DICIEMBRE</option>' +
            '</select><br>',
        showCancelButton: true,
        confirmButtonText: 'Timbrar todos',
        cancelButtonText: 'Cancelar',
        backdrop: false,
        preConfirm: () => {
            // Obtiene los valores de los campos de entrada
            const concepto = Swal.getPopup().querySelector('#txtRfc').value;
            const mes = Swal.getPopup().querySelector('#cmbMesDeTimbrado').value;

            const conceptoTimbrado = concepto + ' ' + mes + ' 2024';

            if(mes === '' || mes === null) { throw new Error("Debe seleccionar el mes de timbrado"); }
            let datos = new FormData();
            datos.append("concepto", conceptoTimbrado);

            fetch('../Controllers/ClienteController.php?Operacion=stampAllTickets', {
                method: 'POST',
                body: datos,
            }).then(response => {
                if(response.ok) {
                    Swal.fire({
                        title: '¡Acción realizada con éxito!',
                        text: 'Se han timbrado todos los contra recibos por honorarios del mes de ' + mes + '.',
                        icon: 'success'
                    });
                }
                else{
                    console.log(response.json());
                    Swal.fire({
                        title: 'Error',
                        text: response.json(),
                        icon: 'error'
                    });
                }
            })
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Cancelado',
                text: 'La operación fue cancelada.',
                icon: 'info'
            });
        }
    })
    .catch((error)=>{
        Swal.fire({
            title: 'Error',
            text: error,
            icon: 'error'
        });
    });
});

document.addEventListener('click', async function(event) {
    try {
        if (event.target.classList.contains('fa-bell')) {
            const row = event.target.parentElement.parentElement.parentElement.parentElement;
            const rfc = row.cells[0].textContent;
            const tarifa = row.cells[3].textContent;

            TimbrarContraRecibo(rfc, tarifa);
        }
    }
    catch(error) {
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
});