document.getElementById("btnGenerarExcel").addEventListener('click', async ()=>{
    let response = await fetch(`http://localhost:8082/clientes_por_vencer/excel`, { method: "GET" });
    let blob = await response.blob();
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'Reporte de firmas y sellos por vencer';
    a.click();
});