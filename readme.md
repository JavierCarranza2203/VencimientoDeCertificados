# Software para verificar el vencimiento de firmas electronicas

Este programa ayuda a saber si un conjunto de certificados emitidos por el sat están a punto de vencerse para así evitar que el cliente tenga que ir a renovar

## Características principales

- Avisa las firmas que están próximas a vencer.
- Permite ver un registro de todas las firmas.

## Estructura del proyecto (Solo carpetas)

- |- App  
    - |- Config  
    - |- Controllers  
    - |- Libraries  
    - |- Models  
    - |- Services  
    - |- Source  
        - |- css  
            - |- base
            - |- layout
                - |- components
            - |- module
                - |- components
            - |- state
                - |- components
            - |- theme
                - |- components
        - |- js
            - |- Clases
            - |- Metodos
    - |- Utilities
    - |- Views
- |- Database
    - |- Tables
- |- Server
    - |- node_modules
- |- Test

## Explicación de la estructura

- **App:** Contiene todo el código de lógico de la página así como las vistas html.  
    -  **Config:** Se encuentran los archivos de configuración, incluyendo la conexión a la BD y configuraciones.
    - **Controllers:** Aqui se encuentran los controladores que van a interactuar con el lado del    cliente y que actuarán como especie de Router para llamar los métodos necesarios de los servicios  
    - **Libraries:** Contiene los archivos necesarios para funcionar, en este caso. La conexión  
    - **Models:** Contiene la definción de las clases, estas concuerdan con la base de datos  
    - **Services:** Contiene los archivos que interactuan directamente con la base de datos  
    - **Source:** Contien el código de lado del cliente y estilos css  
        - **css:** Contiene los archivos separados en metología SMACSS  
        - **js:** Contiene los archivos JavaScript de los modulos de la pagina asi como clases y metodos  
            - **clases:** Contiene la definición de las clases de usadas  
            - **metodos:** Contiene la logica para hacer peticiones o métodos reutilizables  
    - **Utilities:** Contiene las utilerias como img, videos, etc.  
    - **Views:** Contiene la parte gráfica del proyecto (Elementos html)  

- **Database:** Carpeta donde se encuentra la estructura de la base de datos

- **Server:** Aqui se encuentra el código del server de express que genera el excel (Se hizo así para que la aplicación de escritorio pueda hacer peticiones de manera más facil);

- **Test:** En esta carpeta van toda clase de código o archivos para realizar alguna prueba y así no modificar el código principal

## Requisitos del sistema

- La gran ventaja de este software es que al ser un sistema desarrollado en entorno web y pensado para manejarse en una red local, la única condición para usarlo es tener acceso a la red.

## Uso

- Necesitará un usuario y contraseña para poder acceder
- Una vez otorgado por el administrador, debe visitar el link para poder acceder a la plataforma
- Ya que haya entrado al enlace, ingrese su usuario y contraseña.
- ¡Listo, ya puede impedir que sus clientes tengan que ir al SAT!
- **Nota:** El sistema enviará un correo con los clientes que estén a punto de vencer

## A considerar

- El sistema no sabe diferenciar entre un certificado de una firma a un certificado de un sello. Por lo que es necesario tener mucho cuidado al momento de ingresar los datos, ya que un error podría costar el vencimiento de una firma o un sello sin darse cuenta.
- Si se requiere agregar mas de 10 clientes, es necesario hablar con el administrador para que pueda usar el servicio de auto guardado.
- Solo los administradores pueden agregar clientes y solo el programador puede usar el servicio de auto guardado.
- El sistema estará en periodo de prueba así que es necesario verificar que los datos se hayan agregado sin ningún error (A pesar de que el sistema diga que todo salió bien).

## Desarrollo

Este sistema fué desarrollado por Javier Armando Carranza Garcia cómo idea de proyecto inicial.
  
Para ver más acerca de mi trabajo, por favor visita mi portafolio.  
  
[Haz click aquí](https://javier-carranza.netlify.app/?fbclid=IwAR0w_i8sGFqF1SHBliC57Qw-K0nWHRsaJlMnQALfdznnQgc19aNnYygElgk)