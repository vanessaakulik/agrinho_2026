// ==========================================
// AGRO INTELIGENTE - MAIN.JS
// ==========================================

const resultadoCalagem =
  document.getElementById("resultadoCalagem");

const resultadoClima =
  document.getElementById("resultadoClima");

let historicoClima = [];

// ==========================================
// CARREGAR HISTÓRICO
// ==========================================

function carregarHistorico() {
  const dados =
    localStorage.getItem("historicoClima");

  if (dados) {
    historicoClima = JSON.parse(dados);
  }
}

function salvarHistorico() {
  localStorage.setItem(
    "historicoClima",
    JSON.stringify(historicoClima)
  );
}

carregarHistorico();

// ==========================================
// CALCULADORA DE CALAGEM
// ==========================================

function calcularCalagem(event) {
  event.preventDefault();

  const ph = Number(
    document.getElementById("ph").value
  );

  if (isNaN(ph) || ph < 0 || ph > 14) {
    resultadoCalagem.innerHTML = `
      <div style="color:red;">
        ⚠️ Digite um valor válido entre 0 e 14.
      </div>
    `;
    return;
  }

  let mensagem = "";
  let cor = "";

  if (ph < 5.5) {
    mensagem =
      "⚠️ Solo ácido. Recomenda-se aplicação de calcário.";
    cor = "#e74c3c";
  } else if (ph > 7.5) {
    mensagem =
      "⚠️ Solo alcalino. Avalie correções específicas.";
    cor = "#f39c12";
  } else {
    mensagem =
      "✅ Solo adequado para a maioria das culturas.";
    cor = "#27ae60";
  }

  resultadoCalagem.innerHTML = `
    <div style="
      padding:15px;
      border-radius:10px;
      background:#f8f8f8;
      margin-top:10px;
    ">
      <h3>Resultado da Análise</h3>

      <p><strong>pH:</strong> ${ph}</p>

      <p>${mensagem}</p>

      <div style="
        width:100%;
        height:25px;
        background:#ddd;
        border-radius:20px;
        overflow:hidden;
      ">
        <div style="
          width:${(ph / 14) * 100}%;
          height:100%;
          background:${cor};
          transition:1s;
        ">
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// LOADING
// ==========================================

function mostrarLoading() {
  resultadoClima.innerHTML = `
    <div style="
      text-align:center;
      padding:20px;
    ">
      ⏳ Buscando clima...
    </div>
  `;
}

// ==========================================
// RECOMENDAÇÃO AGRÍCOLA
// ==========================================

function gerarRecomendacao(dados) {

  const temp = dados.main.temp;
  const umidade = dados.main.humidity;
  const vento = dados.wind.speed;

  if (temp > 35) {
    return "🔥 Temperatura muito alta. Reforce a irrigação.";
  }

  if (umidade > 85) {
    return "💧 Umidade elevada. Monitore fungos e doenças.";
  }

  if (vento > 10) {
    return "🌬 Ventos fortes. Evite pulverizações.";
  }

  if (temp < 10) {
    return "❄️ Risco de frio intenso. Proteja culturas sensíveis.";
  }

  return "✅ Condições favoráveis para atividades agrícolas.";
}

// ==========================================
// EXIBIR HISTÓRICO
// ==========================================

function gerarHistoricoHTML() {

  const ultimos = historicoClima
    .slice(-5)
    .reverse();

  if (ultimos.length === 0) {
    return "";
  }

  return `
    <hr>

    <h4>📜 Últimas Consultas</h4>

    <ul>
      ${ultimos
        .map(
          item =>
            `<li>${item.cidade} - ${item.temperatura}°C</li>`
        )
        .join("")}
    </ul>
  `;
}

// ==========================================
// BUSCAR CLIMA
// ==========================================

async function buscarClima(event) {

  event.preventDefault();

  const cidade = document
    .getElementById("cidade")
    .value
    .trim();

  if (!cidade) {
    resultadoClima.innerHTML =
      "⚠️ Digite uma cidade.";
    return;
  }

  mostrarLoading();

  const apiKey = "SUA_API_KEY";

  const url =
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

  try {

    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error();
    }

    const dados =
      await resposta.json();

    const ventoKmh =
      (dados.wind.speed * 3.6).toFixed(1);

    const recomendacao =
      gerarRecomendacao(dados);

    historicoClima.push({
      cidade: dados.name,
      temperatura: dados.main.temp
    });

    salvarHistorico();

    resultadoClima.innerHTML = `
      <div style="
        text-align:center;
      ">

        <h2>
          📍 ${dados.name}, ${dados.sys.country}
        </h2>

        <img
          src="https://openweathermap.org/img/wn/${dados.weather[0].icon}@2x.png"
          alt="${dados.weather[0].description}"
        >

        <p>
          🌡 <strong>${dados.main.temp}°C</strong>
        </p>

        <p>
          💧 Umidade:
          <strong>${dados.main.humidity}%</strong>
        </p>

        <p>
          🌬 Vento:
          <strong>${ventoKmh} km/h</strong>
        </p>

        <p>
          ☁️
          <strong>${dados.weather[0].description}</strong>
        </p>

        <hr>

        <p>
          <strong>${recomendacao}</strong>
        </p>

        ${gerarHistoricoHTML()}

      </div>
    `;

  } catch (erro) {

    resultadoClima.innerHTML = `
      <div style="
        color:red;
        padding:15px;
      ">
        ❌ Cidade não encontrada ou erro na API.
      </div>
    `;

    console.error(erro);
  }
}

// ==========================================
// LOCALIZAÇÃO AUTOMÁTICA
// ==========================================

async function buscarMinhaLocalizacao() {

  if (!navigator.geolocation) {
    alert("Geolocalização não suportada.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async posicao => {

      const lat =
        posicao.coords.latitude;

      const lon =
        posicao.coords.longitude;

      const apiKey = "SUA_API_KEY";

      const url =
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;

      try {

        mostrarLoading();

        const resposta =
          await fetch(url);

        const dados =
          await resposta.json();

        document.getElementById(
          "cidade"
        ).value = dados.name;

        resultadoClima.innerHTML = `
          <h2>
            📍 Sua localização:
            ${dados.name}
          </h2>

          <p>
            🌡 ${dados.main.temp}°C
          </p>

          <p>
            💧 ${dados.main.humidity}%
          </p>
        `;

      } catch (erro) {
        console.error(erro);
      }

    }
  );
}

// ==========================================
// MODO ESCURO
// ==========================================

function alternarTema() {

  document.body.classList.toggle(
    "dark"
  );

  localStorage.setItem(
    "tema",
    document.body.classList.contains("dark")
      ? "dark"
      : "light"
  );
}

// ==========================================
// CARREGAR TEMA
// ==========================================

window.addEventListener("load", () => {

  const tema =
    localStorage.getItem("tema");

  if (tema === "dark") {
    document.body.classList.add("dark");
  }

});