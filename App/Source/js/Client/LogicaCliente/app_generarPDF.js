const btnImprimirContraRecibo = document.getElementById("btnImprimirContraRecibo");
const contrarecibo = document.getElementById("content");
const imageElement = document.getElementById("img");


window.addEventListener('DOMContentLoaded', ()=>{
    btnImprimirContraRecibo.addEventListener('click', ()=>{
        html2canvas(contrarecibo).then(canvas => {
            // Convertir el canvas en una imagen PNG
            const pngImage = canvas.toDataURL('image/png');

            const formData = new FormData();
            formData.append("image", pngImage);

            fetch('http://localhost:8082/generar-contrarecibo', {
                method: 'POST',
                body: formData
            })
            .then(response => response.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);
                imageElement.src = url;
            })
            .catch(error => console.error(error));
        });
    });
});