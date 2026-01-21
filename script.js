console.log("script.js loaded");

let logamData=[], csvResults=[], riskChart=null;

// Load logam dari JSON
fetch('data/logam.json')
.then(res=>res.json())
.then(data=>{
  logamData = data;
  const sel = document.getElementById("logam");
  data.forEach(item=>sel.innerHTML+=`<option value="${item.logam}">${item.logam}</option>`);
});

function toggleInputs() {
  const jenis = document.getElementById("jenisRisiko").value;
  document.getElementById("rfdBox").style.display = (jenis==="non")?"block":"none";
  document.getElementById("sfBox").style.display = (jenis==="kar")?"block":"none";
}
document.addEventListener("DOMContentLoaded", toggleInputs);

// Auto-fill logam
function updateLogamData(){
  const selected = document.getElementById("logam").value;
  const item = logamData.find(l=>l.logam===selected);
  if(item){
    document.getElementById("RfD").value=item.RfD||"";
    document.getElementById("SF").value=item.SF||"";
    document.getElementById("BAF").value=item.BAF||1;
    document.getElementById("Wb").value=item.Wb||"";
    document.getElementById("UF").value=item.UF||1;
    document.getElementById("jenisRisiko").value=item.jenisRisiko||"non";
    toggleInputs();
    
    // Ingestion
    if(item.jalur.ingestion){
      document.getElementById("C_air").value=item.jalur.ingestion.air?.C||0;
      document.getElementById("R_air").value=item.jalur.ingestion.air?.R||0;
      document.getElementById("C_food").value=item.jalur.ingestion.makanan?.C||0;
      document.getElementById("R_food").value=item.jalur.ingestion.makanan?.R||0;
      document.getElementById("C_drink").value=item.jalur.ingestion.minuman?.C||0;
      document.getElementById("R_drink").value=item.jalur.ingestion.minuman?.R||0;
    }
    if(item.jalur.inhalation){
      document.getElementById("C_airu").value=item.jalur.inhalation.C||0;
      document.getElementById("R_airu").value=item.jalur.inhalation.R||0;
    }
    if(item.jalur.dermal){
      document.getElementById("C_dermal").value=item.jalur.dermal.C||0;
      document.getElementById("SA").value=item.jalur.dermal.SA||0;
      document.getElementById("AF").value=item.jalur.dermal.AF||0;
    }
  }
}

// Hitung risiko tunggal
function hitungRisiko(){
  csvResults=[]; calculateRisk(document.getElementById("logam").value?logamData.find(l=>l.logam===document.getElementById("logam").value):null);
  updateChart();
}

// Hitung batch
function hitungBatch(){
  csvResults=[];
  logamData.forEach(item=>calculateRisk(item));
  updateChart();
}

// Fungsi inti perhitungan
function calculateRisk(item){
  if(!item){ alert("Pilih logam"); return; }
  const Wb=parseFloat(document.getElementById("Wb").value);
  const UF=parseFloat(document.getElementById("UF").value)||1;
  const BAF=parseFloat(document.getElementById("BAF").value)||1;
  const jenis=document.getElementById("jenisRisiko").value;

  let totalIntake=0;

  // Ingestion
  const ingestion=[
    {name:"Air Minum", C:parseFloat(document.getElementById("C_air").value)||0, R:parseFloat(document.getElementById("R_air").value)||0},
    {name:"Makanan", C:parseFloat(document.getElementById("C_food").value)||0, R:parseFloat(document.getElementById("R_food").value)||0},
    {name:"Minuman Lain", C:parseFloat(document.getElementById("C_drink").value)||0, R:parseFloat(document.getElementById("R_drink").value)||0}
  ];
  ingestion.forEach(i=>totalIntake+=(i.C*i.R)/Wb);

  // Inhalation
  totalIntake += ((parseFloat(document.getElementById("C_airu").value)||0)*(parseFloat(document.getElementById("R_airu").value)||0))/Wb;

  // Dermal
  totalIntake += ((parseFloat(document.getElementById("C_dermal").value)||0)*(parseFloat(document.getElementById("SA").value)||0)*(parseFloat(document.getElementById("AF").value)||0))/Wb;

  totalIntake *= BAF;

  let riskValue="", riskStatus="";
  if(jenis==="non"){
    const HQ=parseFloat(totalIntake)/(parseFloat(document.getElementById("RfD").value)*UF);
    riskValue=HQ.toFixed(2);
    riskStatus=(HQ<=1?"AMAN":"TIDAK AMAN");
  }else{
    const ECR=totalIntake*parseFloat(document.getElementById("SF").value);
    riskValue=ECR.toExponential(3);
    if(ECR<=1e-6) riskStatus="Risiko Rendah";
    else if(ECR<=1e-4) riskStatus="Risiko Sedang";
    else riskStatus="Risiko Tinggi";
  }
  csvResults.push({logam:item.logam,value:riskValue,status:riskStatus});
  document.getElementById("hasil").innerText="Simulasi selesai, cek tabel/visualisasi chart.";
}

// Update chart
function updateChart(){
  const ctx=document.getElementById("riskChart").getContext("2d");
  const labels=csvResults.map(r=>r.logam);
  const values=csvResults.map(r=>parseFloat(r.value.replace(/[^\d\.]/g,"")));
  const bgColors=csvResults.map(r=>{
    if(r.status==="AMAN" || r.status==="Risiko Rendah") return "#d4edda";
    else if(r.status==="Risiko Sedang") return "#fff3cd";
    else return "#f8d7da";
  });

  if(riskChart) riskChart.destroy();
  riskChart=new Chart(ctx,{
    type:"bar",
    data:{
      labels:labels,
      datasets:[{
        label:"HQ / ECR",
        data:values,
        backgroundColor:bgColors,
        borderColor:"#333",
        borderWidth:1
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true}}
    }
  });
}

// Download CSV
function downloadCSV(){
  if(csvResults.length===0){ alert("Lakukan simulasi terlebih dahulu!"); return; }
  let csv="Logam,HQ/ECR,Status\n";
  csvResults.forEach(r=>csv+=`${r.logam},${r.value},${r.status}\n`);
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="simulasi_risiko.csv";
  link.click();
}
