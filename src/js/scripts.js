// 1. Selecionando os elementos
const inputTexto = document.querySelector(".input-texto");
const traducaoTexto = document.querySelector(".traducao");
const idiomaOrigem = document.querySelector(".idioma-origem");
const idiomaDestino = document.querySelector(".idioma-destino");

// Selecionando botões (Certifique-se de ter essas classes no seu HTML)
const btnLer = document.querySelector(".btn-ler");
const btnVoz = document.querySelector(".btn-voz");
const btnInverter = document.querySelector(".btn-inverter");
const btnCopiar = document.querySelector(".btn-copiar");

// 2. Função para traduzir
async function traduzir() {
    const texto = inputTexto.value.trim();
    
    if (texto === "") {
        traducaoTexto.textContent = "A Tradução aparecerá aqui...";
        return;
    }

    traducaoTexto.classList.remove("animar-texto");
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${idiomaOrigem.value}|${idiomaDestino.value}`;

    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();
        
        // MyMemory pode retornar erro dentro do JSON (ex: limite de tradução)
        if(dados.responseStatus !== 200) {
            traducaoTexto.textContent = "Erro na API: " + dados.responseDetails;
            return;
        }

        traducaoTexto.textContent = dados.responseData.translatedText;
        void traducaoTexto.offsetWidth; 
        traducaoTexto.classList.add("animar-texto");
    } catch (erro) {
        traducaoTexto.textContent = "Erro ao buscar tradução.";
    }
}

// 3. Funções de suporte
function lerTexto() {
    const textoParaLer = traducaoTexto.textContent;
    if (textoParaLer && textoParaLer !== "A Tradução aparecerá aqui...") {
        const leitura = new SpeechSynthesisUtterance(textoParaLer);
        leitura.lang = idiomaDestino.value;
        window.speechSynthesis.speak(leitura);
    }
}

function ouvirVoz() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Seu navegador não suporta reconhecimento de voz.");
        return;
    }
    const reconhecimentoVoz = new SpeechRecognition();
    reconhecimentoVoz.lang = idiomaOrigem.value;
    reconhecimentoVoz.onresult = (evento) => {
        inputTexto.value = evento.results[0][0].transcript;
        traduzir();
    };
    reconhecimentoVoz.start();
}

function inverterIdiomas() {
    const auxIdioma = idiomaOrigem.value;
    idiomaOrigem.value = idiomaDestino.value;
    idiomaDestino.value = auxIdioma;

    const textoAtualInput = inputTexto.value;
    const textoAtualTraduzido = traducaoTexto.textContent;

    if (textoAtualTraduzido !== "A Tradução aparecerá aqui...") {
        inputTexto.value = textoAtualTraduzido;
        // Opcional: já traduz de volta para confirmar
        traduzir();
    }
}

function copiarTexto() {
    const texto = traducaoTexto.textContent;
    if (texto !== "A Tradução aparecerá aqui...") {
        navigator.clipboard.writeText(texto).then(() => alert("Copiado!"));
    }
}

// 4. ADICIONANDO OS GATILHOS (IMPORTANTE!)
if(btnLer) btnLer.addEventListener("click", lerTexto);
if(btnVoz) btnVoz.addEventListener("click", ouvirVoz);
if(btnInverter) btnInverter.addEventListener("click", inverterIdiomas);
if(btnCopiar) btnCopiar.addEventListener("click", copiarTexto);

let timer;
inputTexto.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(traduzir, 500);
});