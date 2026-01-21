console.log("script.js loaded");

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
}

document.addEventListener("DOMContentLoaded", toggleInputs);

function hitungRisiko() {
  const C  = parseFloat(document.getElementById("C").value);
  const R  = parseFloat(document.getElementById("R").value);
  const tE = parseFloat(document.getElementById("tE").value);
  const fE = parseFloat(document.getElementById("fE").value);
  const Dt = parseFloat(document.getElementById("Dt").value);
  const Wb = parseFloat(document.getElementById("Wb").value);
  const jenis = document.getElementById("jenisRisiko").value;

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
    const RfD = parseFloat(document.getElementById("RfD").value);
    if (isNaN(RfD) || RfD <= 0) {
      alert("Masukkan nilai RfD yang valid");
      return;
    }
    const HQ = intake / RfD;
    hasil.classList.add(HQ <= 1 ? "safe" : "risk");
    output += `<b>Hazard Quotient (HQ):</b> ${HQ.toFixed(2)}<br>
               <b>Status Risiko:</b> ${HQ <= 1 ? "AMAN" : "TIDAK AMAN"}`;
  } else {
    const SF = parseFloat(document.getElementById("SF").value);
    if (isNaN(SF) || SF <= 0) {
      alert("Masukkan nilai Slope Factor (SF) yang valid");
      return;
    }
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
