let logamData = [];

fetch('data/logam.json')
  .then(res => res.json())
  .then(data => logamData = data);

function simulasiSemua() {
  const tbody = document.querySelector("#hasilTable tbody");
  tbody.innerHTML = "";

  const jalurIngestion = document.getElementById("chk_ingestion").checked;
  const jalurInhalation = document.getElementById("chk_inhalation").checked;
  const jalurDermal = document.getElementById("chk_dermal").checked;

  logamData.forEach(logam => {
    // Ingestion
    if(jalurIngestion) {
      const ingestion = logam.jalur.ingestion;
      for(const key of Object.keys(ingestion)) {
        const C = ingestion[key].C;
        const R = ingestion[key].R;
        const intake = (C * R * 1 * 365) / (logam.Wb * 365); // simplifikasi avgT
        let status = logam.jenisRisiko === "non" ? (intake / logam.RfD <=1 ? "AMAN":"TIDAK AMAN") : 
                      (intake * logam.SF <= 1e-4 ? "Risiko Rendah":"Risiko Tinggi");
        const val = logam.jenisRisiko === "non" ? (intake / logam.RfD).toFixed(2) : (intake * logam.SF).toExponential(3);
        tbody.innerHTML += `<tr>
          <td>${logam.logam}</td>
          <td>Ingestion - ${key}</td>
          <td>${intake.toExponential(3)}</td>
          <td>${val} / ${status}</td>
        </tr>`;
      }
    }

    // Inhalation
    if(jalurInhalation) {
      const inh = logam.jalur.inhalation;
      const intake = (inh.C * inh.R * 1 * 365) / (logam.Wb * 365);
      let status = logam.jenisRisiko === "non" ? (intake / logam.RfD <=1 ? "AMAN":"TIDAK AMAN") : 
                    (intake * logam.SF <= 1e-4 ? "Risiko Rendah":"Risiko Tinggi");
      const val = logam.jenisRisiko === "non" ? (intake / logam.RfD).toFixed(2) : (intake * logam.SF).toExponential(3);
      tbody.innerHTML += `<tr>
        <td>${logam.logam}</td>
        <td>Inhalation</td>
        <td>${intake.toExponential(3)}</td>
        <td>${val} / ${status}</td>
      </tr>`;
    }

    // Dermal
    if(jalurDermal) {
      const derm = logam.jalur.dermal;
      const intake = (derm.C * derm.SA * derm.AF * 1 * 365) / (logam.Wb * 365);
      let status = logam.jenisRisiko === "non" ? (intake / logam.RfD <=1 ? "AMAN":"TIDAK AMAN") : 
                    (intake * logam.SF <= 1e-4 ? "Risiko Rendah":"Risiko Tinggi");
      const val = logam.jenisRisiko === "non" ? (intake / logam.RfD).toFixed(2) : (intake * logam.SF).toExponential(3);
      tbody.innerHTML += `<tr>
        <td>${logam.logam}</td>
        <td>Dermal</td>
        <td>${intake.toExponential(3)}</td>
        <td>${val} / ${status}</td>
      </tr>`;
    }
  });
}

function downloadCSV() {
  const rows = document.querySelectorAll("#hasilTable tr");
  let csvContent = "";
  rows.forEach(row => {
    const cols = row.querySelectorAll("th, td");
    const data = Array.from(cols).map(c => c.innerText);
    csvContent += data.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "simulasi_ADKL.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
