document.getElementById("btnGenerarExcel").addEventListener('click', async ()=>{
    try
    {
        let response = await fetch(`http://localhost:8082/clientes_por_vencer/excel`, { method: "GET" });

        if(response.ok)
        {
            let blob = await response.blob();
            let url = window.URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = url;
            a.download = 'Reporte de firmas y sellos por vencer';
            a.click();

            Swal.fire({
                title: "¡El archivo se ha generado!",
                text: "Puede encontrarlo en la carpeta de descargas",
                icon: "success",
                confirmButtonText: "OK",
            });
        }
        else{
            Swal.fire({
                icon: "error",
                title: "¡Hubo un error inesperado!",
                text: "No se puede generar el archivo",
                footer: '<label>Llame al administrador de sistemas.</label>'
            });
        }
    }
    catch(error){
        Swal.fire({
            icon: "error",
            title: "¡Hubo un error inesperado!",
            text: error,
            footer: '<label>Si ya ha intentado, llame al administrador de sistemas.</label>'
        });
    }
});