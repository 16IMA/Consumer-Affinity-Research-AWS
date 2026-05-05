# Guía de configuración — Consumer Affinity Research

## Arquitectura general

```
Formulario web (EC2) → S3 (JSON) → AWS Glue → AWS Athena
```

---

## 1. Bucket S3

Se necesita 1 bucket:

**Bucket 1 — Web estática + datos**

- Crear bucket s3
- Nombre del bucket (lo tenemos en enviar.php, si no es el mismo modificarlo en este archivo)
- Todo lo demás dejarlo como viene por defecto
- Crear bucket
- Crear carpeta `athena-results` (la / se ponen sola)

- Estructura de carpetas:
  ```
  registros/       ← JSONs del formulario y survey_data.json (se crea sola con el envio de los fomularios)
  athena-results/ ← resultados de queries de Athena
  ```

---

## 2. EC2

- Lanzar instancia
- Nombre: consumer-affinity-web
- Par de claves > crear un nuevo par de claves
  - Nombre: claves
  - Formato: .ppk
  - Crear par de claves (se descarga el archivo ppk para usar en Putty)
- Configuraciones de red > editar (para que la gente pueda acceder a la web)
  - Reglas de grupos de seguridad de entrada
    - ssh > puerto 22 (ya viene por defecto, para conectarnos a putty) > cualquier lugar
    - agregar regla del grupo de seguridad
    - http > puerto 80 (para que el formulario sea accesible) > cualquier lugar
- Detalles avanzados > perfil de instancia de IAM > EMR_EC2_DefaultRole
- Lanzar instancia

---

## 3. Putty

- Conectamos a putty con el ppk (IP en la instancia que acabamos de crear)
- login as: ec2-user
- Copiamos el contenido del archivo `configuracion.php` y lo pegamos en el putty y damos enter (esperamos a que salga Complete!)
- cd /var/www/html
- nano index.html
  - Copiamos el contenido del archivo `index.html` y lo pegamos en el putty y damos enter
  - Ctrl + O > Enter > Ctrl + X
- nano enviar.php
  - Copiamos el contenido del archivo `enviar.php` y lo pegamos en el putty y damos enter
  - Ctrl + O > Enter > Ctrl + X
- nano script.js
  - Copiamos el contenido del archivo `script.js` y lo pegamos en el putty y damos enter
  - Ctrl + O > Enter > Ctrl + X

---

## 4. Comprobar que todo funciona OK

- Abrimos en el navegador la web ( `http://35.92.197.7` por ejemplo, misma ip usada en putty )
- Hacemos prueba haciendo el formulario y enviandolo
- Vamos a s3 > nuestro bucket > se abrá creado la carpeta `registros/` > dentro el json del formulario que acabamos de hacer

---

## 5. AWS Athena

### Configurar ubicación de resultados

- Editor de consultas → Configuración de consultas → Administrar → Browse S3 → click link s3 → seleccionamos la carpeta `athena-results` → choose → guardar
- Editor → consulta 1

### Crear base de datos

```sql
CREATE DATABASE IF NOT EXISTS survey_db;
```

- Ejecutar → completado

#### se podría crear la base de datos desde Glue pero lo hacemos así para ya apuntar al s3

---

## 6. AWS Glue

### Crear Crawler

1. Glue → Crawlers → Create crawler
2. Nombre: `survey-crawler` → Next
3. Data source: Add a data source → S3 → S3 path → Browse S3 → click link `survey-data-consumer...` → seleccionamos `registros/` → choose → add an S3 data source → Crawl all sub-folders → Add ab S3 data source → Next
4. IAM Role: `LabRole`
5. Target database: `survey_db`
6. Schedule: On demand (on demand = hacer cada vez "Run Crawler" manualmente)
7. Create crawler → Run crawler
8. Esperar a que ponga "Completed"

---

## 7. AWS Athena

### Consultar datos

Nueva consulta y ejecutar:

```sql
SELECT * FROM survey_db.registros LIMIT 10;
```

---

## 8. Subir el archivo json con todos los datos de "clientes"

- S3 > survey-data-consumer... > registros/ > cargar > agregar archivos
- Subimos el archivo `survey_data.json` > cargar
- Volvemos a "Athena" y lanzamos la query de antes

---

## 9. Demo "magia de Glue"

El formulario tiene un campo nuevo comentado en `index.html`.

**Pasos durante la demo:**

1. Volvemos al PuTTY (volver a hacer este paso si lo hemos cerrado)
2. Abrir el HTML con `nano index.html`
3. Buscar el campo comentado con `Ctrl + W`
4. Descomentar la línea (eliminar `<!--` y `-->`)
5. Guardar con `Ctrl + O` → Enter y salir con `Ctrl + X`
6. Enviar una respuesta nueva desde el formulario
7. Correr el Crawler en Glue
8. En Athena la nueva columna aparece automáticamente sin tocar nada
