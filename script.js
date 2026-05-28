function cargarGraficaAreas(data){
  const conteo = {};
  data.forEach(r=>{
    const area = r.AREA?.trim() || "Sin área";
    conteo[area] = (conteo[area] || 0) + 1;
  });

  const labels = Object.keys(conteo);
  const valores = Object.values(conteo);

  // Paleta de colores automática por área
  const colores = [
    "#38bdf8", "#f87171", "#34d399", "#fbbf24",
    "#a78bfa", "#fb7185", "#22d3ee", "#facc15",
    "#4ade80", "#c084fc"
  ];
  const coloresFinales = labels.map((_, i) => colores[i % colores.length]);

  if(areasChart){ areasChart.destroy(); }

  areasChart = new Chart(document.getElementById("areasChart"), {
    type:"bar",
    data:{
      labels:labels,
      datasets:[{
        label:"Accesos por área",
        data:valores,
        backgroundColor:coloresFinales,
        borderColor:"#1b263b",
        borderWidth:1
      }]
    },
    options:{
      plugins:{
        legend:{ labels:{ color:"white" } }
      },
      scales:{
        x:{ ticks:{ color:"white" } },
        y:{ ticks:{ color:"white" } }
      }
    }
  });
}
