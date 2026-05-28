const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRxwCo5Z1qQNx_W4-PLSLjy5GHGFARpRSTgPfQnm3EKKHy-yPzdYJWqdO2hty666bfo6nuDvJEYJdIb/pub?gid=1909276998&single=true&output=csv";

let datosGlobales = [];

async function loadData() {

  Papa.parse(SHEET_URL, {

    download: true,
    header: true,

    complete: function(results) {

      console.log(results.data);

      datosGlobales = results.data;

      document.getElementById(
        "totalRegistros"
      ).innerText = datosGlobales.length;

      document.getElementById(
        "personasSitio"
      ).innerText = datosGlobales.length;

      cargarTabla(datosGlobales);

    }

  });

}

function cargarTabla(data){

  const tabla =
  document.getElementById("tablaDatos");

  if(!tabla) return;

  tabla.innerHTML = "";

  data.forEach(row => {

    tabla.innerHTML += `
      <tr>
        <td>${row.FECHA || ""}</td>
        <td>${row.INGRESO || ""}</td>
        <td>${row.VISITANTE || ""}</td>
        <td>${row.AREA || ""}</td>
        <td>${row.SALIDA || ""}</td>
      </tr>
    `;

  });

}

loadData();

setInterval(loadData,30000);
