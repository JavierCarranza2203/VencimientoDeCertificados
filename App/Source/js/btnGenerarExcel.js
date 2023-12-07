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
        }
        else{
            let errorMessage = await response.json();

            throw new Error(errorMessage);
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