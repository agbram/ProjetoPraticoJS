import { buscarComCache, buscarDadosDasURLsComCache } from "./apiCache.js";

let especiesFavoritos;
let especies = [];

// Função para mostrar estado de loading no modal
function mostrarLoadingModal() {
  const elementosLoading = ["modalPessoas", "modalFilmes", "modalPlanetaNatal"];

  elementosLoading.forEach(function (id) {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.innerHTML = '<span class="text-muted">Carregando...</span>';
    }
  });
}

// Função para preencher listas no modal
function preencherListaModal(elementId, itens) {
  const elemento = document.getElementById(elementId);
  if (!elemento) return;

  elemento.innerHTML = "";

  if (itens.length === 0) {
    elemento.innerHTML = '<li class="text-muted">Nenhum item encontrado</li>';
    return;
  }

  itens.forEach(function (item) {
    const li = document.createElement("li");
    li.classList.add("mb-1");
    li.textContent = item;
    elemento.appendChild(li);
  });
}

// Função para formatar cores (separadas por vírgulas)
function formatarCores(coresString) {
  if (!coresString || coresString === "unknown" || coresString === "none") {
    return ["Desconhecido"];
  }

  // Remover espaços extras e dividir por vírgula
  return coresString.split(",").map(function (cor) {
    return cor.trim();
  });
}

// Função para criar e adicionar cards na tela
function adicionaCards(listaEspecies) {
  const container = document.getElementById("listaEspecies");
  container.innerHTML = "";

  if (listaEspecies.length === 0) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👽</div>
                <h3>Nenhuma espécie encontrada</h3>
                <p>Tente ajustar sua busca ou filtro</p>
            </div>
        `;
    return;
  }

  listaEspecies.forEach(function (especie) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("especie-card");
    cardDiv.setAttribute("data-especie-id", especie.name);

    // Botão de favoritar
    const btnFavoritar = document.createElement("button");
    btnFavoritar.classList.add("btn-favorito");
    btnFavoritar.innerHTML = '<i class="far fa-heart"></i>';

    // Verificar se a espécie já está favoritada
    const favoritos =
      JSON.parse(localStorage.getItem("especiesFavoritos")) || [];
    let isFavoritado = false;

    for (let i = 0; i < favoritos.length; i++) {
      if (favoritos[i].name === especie.name) {
        isFavoritado = true;
        break;
      }
    }

    if (isFavoritado) {
      btnFavoritar.innerHTML = '<i class="fas fa-heart"></i>';
      btnFavoritar.classList.add("favoritado");
    }

    // Prevenir que o clique no coração abra o modal
    btnFavoritar.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleFavorito(especie, btnFavoritar);
    });

    const cardHeader = document.createElement("div");
    cardHeader.classList.add("especie-card-header");

    const cardTitle = document.createElement("h3");
    cardTitle.classList.add("especie-card-title");
    cardTitle.textContent = especie.name;

    const cardSubtitle = document.createElement("p");
    cardSubtitle.classList.add("especie-card-subtitle");
    cardSubtitle.textContent = "Classificação: " + especie.classification;

    const cardBody = document.createElement("div");
    cardBody.classList.add("especie-card-body");

    const cardFeatures = document.createElement("div");
    cardFeatures.classList.add("especie-card-features");

    // Altura média
    const alturaFeature = document.createElement("div");
    alturaFeature.classList.add("especie-feature");

    let alturaTexto = "Desconhecida";
    if (
      especie.average_height !== "unknown" &&
      especie.average_height !== "n/a"
    ) {
      alturaTexto = especie.average_height + " cm";
    }

    alturaFeature.innerHTML = `
            <span class="feature-label">Altura Média</span>
            <span class="feature-value">${alturaTexto}</span>
        `;

    // Expectativa de vida
    const vidaFeature = document.createElement("div");
    vidaFeature.classList.add("especie-feature");

    let vidaTexto = "Desconhecida";
    if (
      especie.average_lifespan !== "unknown" &&
      especie.average_lifespan !== "n/a"
    ) {
      vidaTexto = especie.average_lifespan + " anos";
    }

    vidaFeature.innerHTML = `
            <span class="feature-label">Expectativa de Vida</span>
            <span class="feature-value">${vidaTexto}</span>
        `;

    // Designação
    const designacaoFeature = document.createElement("div");
    designacaoFeature.classList.add("especie-feature");

    let designacaoTexto = "Desconhecida";
    if (especie.designation !== "unknown") {
      designacaoTexto = especie.designation;
    }

    designacaoFeature.innerHTML = `
            <span class="feature-label">Designação</span>
            <span class="feature-value">${designacaoTexto}</span>
        `;

    const cardFooter = document.createElement("div");
    cardFooter.classList.add("especie-card-footer");

    const btnDetalhes = document.createElement("button");
    btnDetalhes.classList.add("btn-especie-detalhes");
    btnDetalhes.textContent = "Ver Detalhes";

    // Montagem do card
    cardFeatures.appendChild(alturaFeature);
    cardFeatures.appendChild(vidaFeature);
    cardFeatures.appendChild(designacaoFeature);

    cardBody.appendChild(cardFeatures);
    cardBody.appendChild(cardFooter);

    cardFooter.appendChild(btnDetalhes);

    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(cardSubtitle);
    cardHeader.appendChild(btnFavoritar);

    cardDiv.appendChild(cardHeader);
    cardDiv.appendChild(cardBody);

    container.appendChild(cardDiv);

    // Evento de abrir modal
    cardDiv.addEventListener("click", function () {
      abrirModalEspecie(especie);
    });
  });
}

// Função para alternar entre favoritar e desfavoritar
function toggleFavorito(especie, btnElement) {
  let favoritos = JSON.parse(localStorage.getItem("especiesFavoritos")) || [];
  let isFavoritado = false;

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].name === especie.name) {
      isFavoritado = true;
      break;
    }
  }

  if (isFavoritado) {
    // Remover dos favoritos
    const novosFavoritos = [];
    for (let i = 0; i < favoritos.length; i++) {
      if (favoritos[i].name !== especie.name) {
        novosFavoritos.push(favoritos[i]);
      }
    }
    favoritos = novosFavoritos;
    btnElement.innerHTML = '<i class="far fa-heart"></i>';
    btnElement.classList.remove("favoritado");
  } else {
    // Adicionar aos favoritos
    favoritos.push(especie);
    btnElement.innerHTML = '<i class="fas fa-heart"></i>';
    btnElement.classList.add("favoritado");
  }

  localStorage.setItem("especiesFavoritos", JSON.stringify(favoritos));

  // Feedback visual
  btnElement.style.transform = "scale(1.3)";
  setTimeout(function () {
    btnElement.style.transform = "scale(1)";
  }, 300);
}

// Função para abrir modal da espécie
async function abrirModalEspecie(especie) {
  // Preencher informações básicas do modal
  const modalNome = document.getElementById("modalNome");
  const modalClassificacao = document.getElementById("modalClassificacao");
  const modalDesignacao = document.getElementById("modalDesignacao");
  const modalAltura = document.getElementById("modalAltura");
  const modalVida = document.getElementById("modalVida");
  const modalLinguagem = document.getElementById("modalLinguagem");

  modalNome.textContent = especie.name;
  modalClassificacao.textContent = especie.classification;
  modalDesignacao.textContent = especie.designation;

  if (
    especie.average_height !== "unknown" &&
    especie.average_height !== "n/a"
  ) {
    modalAltura.textContent = especie.average_height + " cm";
  } else {
    modalAltura.textContent = "Desconhecida";
  }

  if (
    especie.average_lifespan !== "unknown" &&
    especie.average_lifespan !== "n/a"
  ) {
    modalVida.textContent = especie.average_lifespan + " anos";
  } else {
    modalVida.textContent = "Desconhecida";
  }

  modalLinguagem.textContent = especie.language;

  // Preencher cores dos olhos
  const coresOlhosElement = document.getElementById("modalCoresOlhos");
  coresOlhosElement.innerHTML = "";
  const coresOlhos = formatarCores(especie.eye_colors);

  coresOlhos.forEach(function (cor) {
    const li = document.createElement("li");
    li.classList.add("mb-1");
    li.textContent = cor;
    coresOlhosElement.appendChild(li);
  });

  // Preencher cores de cabelo
  const coresCabeloElement = document.getElementById("modalCoresCabelo");
  coresCabeloElement.innerHTML = "";
  const coresCabelo = formatarCores(especie.hair_colors);

  coresCabelo.forEach(function (cor) {
    const li = document.createElement("li");
    li.classList.add("mb-1");
    li.textContent = cor;
    coresCabeloElement.appendChild(li);
  });

  // Preencher cores de pele
  const coresPeleElement = document.getElementById("modalCoresPele");
  coresPeleElement.innerHTML = "";
  const coresPele = formatarCores(especie.skin_colors);

  coresPele.forEach(function (cor) {
    const li = document.createElement("li");
    li.classList.add("mb-1");
    li.textContent = cor;
    coresPeleElement.appendChild(li);
  });

  // Mostrar loading nas listas
  mostrarLoadingModal();

  // Buscar dados adicionais em paralelo COM CACHE
  try {
    // Buscar planeta natal se existir
    if (
      especie.homeworld &&
      especie.homeworld !== "unknown" &&
      especie.homeworld !== "n/a"
    ) {
      const planetaNatal = await buscarDadosDasURLsComCache([
        especie.homeworld,
      ]);
      if (planetaNatal.length > 0) {
        document.getElementById("modalPlanetaNatal").textContent =
          planetaNatal[0];
      } else {
        document.getElementById("modalPlanetaNatal").textContent =
          "Desconhecido";
      }
    } else {
      document.getElementById("modalPlanetaNatal").textContent = "Desconhecido";
    }

    // Buscar pessoas e filmes
    const pessoas = await buscarDadosDasURLsComCache(especie.people);
    const filmes = await buscarDadosDasURLsComCache(especie.films);

    // Preencher as listas no modal
    preencherListaModal("modalPessoas", pessoas);
    preencherListaModal("modalFilmes", filmes);
  } catch (error) {
    console.error("Erro ao carregar dados adicionais:", error);
    preencherListaModal("modalPessoas", ["Erro ao carregar dados"]);
  }

  // Definir a espécie atual para favoritos
  especiesFavoritos = especie;

  // Configurar botão de favoritar
  const buttonFavorites = document.getElementById("btn-favorite");
  const jaFavoritado = verificarSeJaFavoritado(especie);

  if (jaFavoritado) {
    buttonFavorites.textContent = "Remover dos Favoritos ❌";
    buttonFavorites.onclick = function () {
      removerDosFavoritos(especie.name);
    };
  } else {
    buttonFavorites.textContent = "Favoritar ⭐";
    buttonFavorites.onclick = function () {
      adicionarAosFavoritos(especie);
    };
  }

  // Abrir modal
  const modalElement = document.getElementById("especieModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// Função para verificar se espécie já está favoritada
function verificarSeJaFavoritado(especie) {
  const favoritos = obterFavoritos();

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].name === especie.name) {
      return true;
    }
  }

  return false;
}

// Função para filtrar espécies pelo texto digitado
function filtrarPorNome(lista, textoUsuario) {
  const textoEmMinusculo = textoUsuario.toLowerCase();
  const especiesFiltradas = [];

  for (let i = 0; i < lista.length; i++) {
    const especie = lista[i];
    if (especie.name.toLowerCase().includes(textoEmMinusculo)) {
      especiesFiltradas.push(especie);
    }
  }

  return especiesFiltradas;
}

// Funções para gerenciar favoritos
function obterFavoritos() {
  const favoritos = localStorage.getItem("especiesFavoritos");
  if (favoritos) {
    return JSON.parse(favoritos);
  } else {
    return [];
  }
}

function salvarFavoritos(favoritos) {
  localStorage.setItem("especiesFavoritos", JSON.stringify(favoritos));
}

function adicionarAosFavoritos(especie) {
  const favoritos = obterFavoritos();
  let jaExiste = false;

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].name === especie.name) {
      jaExiste = true;
      break;
    }
  }

  if (!jaExiste) {
    favoritos.push(especie);
    salvarFavoritos(favoritos);

    // Atualizar botão no modal
    const buttonFavorites = document.getElementById("btn-favorite");
    buttonFavorites.textContent = "Remover dos Favoritos ❌";
    buttonFavorites.onclick = function () {
      removerDosFavoritos(especie.name);
    };

    atualizarBotaoCard(especie.name);

    return true;
  }
  return false;
}

function removerDosFavoritos(nomeEspecie) {
  let favoritos = obterFavoritos();
  const novosFavoritos = [];

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].name !== nomeEspecie) {
      novosFavoritos.push(favoritos[i]);
    }
  }

  favoritos = novosFavoritos;
  salvarFavoritos(favoritos);

  // Atualizar botão no modal
  const buttonFavorites = document.getElementById("btn-favorite");
  buttonFavorites.textContent = "Favoritar ⭐";
  buttonFavorites.onclick = function () {
    const especieAtual = encontrarEspeciePorNome(nomeEspecie);
    if (especieAtual) {
      adicionarAosFavoritos(especieAtual);
    }
  };

  atualizarBotaoCard(nomeEspecie);
}

// Função auxiliar para encontrar espécie por nome
function encontrarEspeciePorNome(nomeEspecie) {
  for (let i = 0; i < especies.length; i++) {
    if (especies[i].name === nomeEspecie) {
      return especies[i];
    }
  }
  return null;
}

function atualizarListaFavoritos() {
  const listaFavoritos = document.getElementById("listaFavoritosModal");
  const favoritos = obterFavoritos();

  if (favoritos.length === 0) {
    listaFavoritos.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⭐</div>
                <h3>Nenhuma espécie favoritada</h3>
                <p>Adicione espécies aos favoritos para visualizar.</p>
            </div>
        `;
    return;
  }

  let htmlFavoritos = "";

  for (let i = 0; i < favoritos.length; i++) {
    const especie = favoritos[i];

    let alturaTexto = "Desconhecida";
    if (
      especie.average_height !== "unknown" &&
      especie.average_height !== "n/a"
    ) {
      alturaTexto = especie.average_height + " cm";
    }

    htmlFavoritos += `
            <div class="favorito-item">
                <div>
                    <h5 class="mb-1">${especie.name}</h5>
                    <p class="mb-1"><strong>Classificação:</strong> ${especie.classification}</p>
                    <p class="mb-1"><strong>Altura Média:</strong> ${alturaTexto}</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-light" onclick="abrirDetalhesEspecie('${especie.name}')">
                        Ver Detalhes
                    </button>
                    <button class="btn btn-sm btn-remover-favorito" onclick="removerDosFavoritos('${especie.name}'); atualizarListaFavoritos();">
                        Remover
                    </button>
                </div>
            </div>
        `;
  }

  listaFavoritos.innerHTML = htmlFavoritos;
}

// Função para abrir detalhes da espécie a partir dos favoritos
function abrirDetalhesEspecie(nomeEspecie) {
  const favoritos = obterFavoritos();
  let especieEncontrada = null;

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].name === nomeEspecie) {
      especieEncontrada = favoritos[i];
      break;
    }
  }

  if (especieEncontrada) {
    // Fechar modal de favoritos
    const favoritosModalElement = document.getElementById("favoritosModal");
    const favoritosModal = bootstrap.Modal.getInstance(favoritosModalElement);

    if (favoritosModal) {
      favoritosModal.hide();
    }

    // Abrir modal de detalhes
    abrirModalEspecie(especieEncontrada);
  }
}

// Função para atualizar o botão do card quando favoritar pelo modal
function atualizarBotaoCard(nomeEspecie) {
  const card = document.querySelector(
    '.especie-card[data-especie-id="' + nomeEspecie + '"]'
  );

  if (card) {
    const btnFavoritar = card.querySelector(".btn-favorito");
    const favoritos =
      JSON.parse(localStorage.getItem("especiesFavoritos")) || [];
    let isFavoritado = false;

    for (let i = 0; i < favoritos.length; i++) {
      if (favoritos[i].name === nomeEspecie) {
        isFavoritado = true;
        break;
      }
    }

    if (isFavoritado) {
      btnFavoritar.innerHTML = '<i class="fas fa-heart"></i>';
      btnFavoritar.classList.add("favoritado");
    } else {
      btnFavoritar.innerHTML = '<i class="far fa-heart"></i>';
      btnFavoritar.classList.remove("favoritado");
    }

    // Feedback visual
    btnFavoritar.style.transform = "scale(1.3)";
    setTimeout(function () {
      btnFavoritar.style.transform = "scale(1)";
    }, 300);
  }
}

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Carregar espécies
    especies = await buscarComCache("species");
    adicionaCards(especies);

    // Configurar busca
    const inputBusca = document.getElementById("buscaEspecie");
    const botao = document.getElementById("btnBuscar");

    botao.addEventListener("click", function () {
      const valorInput = inputBusca.value;
      const especiesFiltradas = filtrarPorNome(especies, valorInput);
      adicionaCards(especiesFiltradas);
    });

    // Permitir busca com Enter
    inputBusca.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const valorInput = inputBusca.value;
        const especiesFiltradas = filtrarPorNome(especies, valorInput);
        adicionaCards(especiesFiltradas);
      }
    });

    // Configurar botão para abrir modal de favoritos
    const btnFavoritos = document.getElementById("btnFavoritos");
    btnFavoritos.addEventListener("click", function () {
      atualizarListaFavoritos();
      const favoritosModalElement = document.getElementById("favoritosModal");
      const favoritosModal = new bootstrap.Modal(favoritosModalElement);
      favoritosModal.show();
    });
  } catch (error) {
    console.error("Erro ao inicializar aplicação:", error);
    alert("Erro ao carregar as espécies. Verifique sua conexão.");
  }
});

// Exportar funções para uso global (para o HTML)
window.abrirDetalhesEspecie = abrirDetalhesEspecie;
window.removerDosFavoritos = removerDosFavoritos;
window.atualizarListaFavoritos = atualizarListaFavoritos;
