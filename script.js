console.log("script.js loaded");

// Database logam berat
const logamBerat = {
  Pb: { RfD: 0.003, SF: 0 },
  Cd: { RfD: 0.001, SF: 0 },
  As: { RfD: 0.0003, SF: 1.5 },
  Hg: { RfD: 0.0003, SF: 0 },
  Cr6: { RfD: 0.003, SF: 0.5 }
};

// Toggle Non-Karsinogenik / Karsinogenik
function toggleInputs() {
  const jenis = document.getElementById("jenisRisiko").value;
  const rfdBox = document.getElementById("rfdBox");
  const sfBox = document.getElementById("sfBox");

  if (jenis === "non") {
    rfdBox.style.display = "block";
    sfBox.style.display = "none";
  } else {
    rfdBox.style.display = "none";
    sfBox.style.display = "block";
  }

  // Auto-fill RfD / SF sesuai logam terpilih
  const logam = document.getElementById("logam").value;
  document.getElementById("RfD").value = logamBerat[logam].RfD;
  document.getElementById("SF").value = logamBerat[logam].SF;
}

// Event Listener
document.getElementById("logam").addEventListener("change", toggleInputs);
document.addEventListener("DOMContentLoaded", toggleInputs);

// Hitung Risiko
function hitungRisiko() {
  const logam = document.getElementById("logam").value;
  const jenis = document.getElementById("jenisRisiko").value;
  const C  = parseFloat(document.getElementById("C").value);
  const R  = parseFloat(document.getElementById("R").value);
  const tE = parseFloat(document.getElementById("tE").value);
  const fE = parseFloat(document.getElementById("fE").value);
  const Dt = parseFloat(document.getElementById("Dt").value);
  const Wb = parseFloat(document.getElementById("Wb").value);

  if ([C,R,tE,fE,Dt,Wb].some(v => isNaN(v) || v <= 0)) {
    alert("Semua parameter pajanan wajib diisi dengan benar");
    return;
  }

  const avgT = (jenis === "non") ? Dt * 365 : 70 * 365;
  const intake = (C * R * tE * fE * Dt) / (Wb * avgT);
  const hasil = document.getElementById("hasil");
  hasil.className = "result";

  let output = `<b>Intake ADKL:</b> ${intake.toExponential(3)} mg/kg/hari<br>`;

  if (jenis === "non") {
    let RfD = parseFloat(document.getElementById("RfD").value) || logamBerat[logam].RfD;
    const HQ = intake / RfD;
    hasil.classList.add(HQ <= 1 ? "safe" : "risk");
    output += `<b>Hazard Quotient (HQ):</b> ${HQ.toFixed(2)}<br>
               <b>Status Risiko:</b> ${HQ <= 1 ? "AMAN" : "TIDAK AMAN"}`;
  } else {
    let SF = parseFloat(document.getElementById("SF").value) || logamBerat[logam].SF;
    const ECR = intake * SF;
    let status = "";
    if (ECR <= 1e-6) status = "Risiko Rendah";
    else if (ECR <= 1e-4) status = "Risiko Sedang";
    else status = "Risiko Tinggi";

    hasil.classList.add(ECR <= 1e-6 ? "safe" : "risk");
    output += `<b>Excess Cancer Risk (ECR):</b> ${ECR.toExponential(3)}<br>
               <b>Status Risiko:</b> ${status}`;
  }

  hasil.innerHTML = output;
  hasil.scrollIntoView({behavior: "smooth"});
}
