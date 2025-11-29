// Função assíncrona para buscar dados da SWAPI
async function buscarDados(endpoint) {
  const url = "https://swapi.dev/api/" + endpoint;

  try {
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error("Erro na requisição: " + resposta.status);
    }

    const dados = await resposta.json();
    return dados.results;
  } catch (erro) {
    console.error("Erro ao buscar dados:", erro);
    alert("Não foi possível carregar os dados. Verifique sua conexão.");
    return [];
  }
}

async function buscarComCache(endpoint) {
  const chave = "cache_" + endpoint;

  // 1. Tenta pegar do cache
  const cache = localStorage.getItem(chave);

  if (cache) {
    return JSON.parse(cache);
  }

  // 2. Se não tiver cache → faz fetch normalmente
  const dados = await buscarDados(endpoint);

  // 3. Salva no cache
  localStorage.setItem(chave, JSON.stringify(dados));

  return dados;
}

// Função para buscar dados de URLs com cache
async function buscarDadosDasURLsComCache(urls) {
  if (!urls || urls.length === 0) {
    return [];
  }

  try {
    const promessas = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const chaveCache = "cache_url_" + url.split("/").filter(Boolean).pop();
      const cache = localStorage.getItem(chaveCache);

      if (cache) {
        // Se tem cache, usa o valor salvo
        promessas.push(Promise.resolve(JSON.parse(cache)));
      } else {
        // Se não tem cache, faz a requisição
        const promessa = fetch(url)
          .then(function (resposta) {
            if (!resposta.ok) throw new Error("Erro na requisição");
            return resposta.json();
          })
          .then(function (dados) {
            const resultado = dados.name || dados.title;
            // Salva no cache para usar depois
            localStorage.setItem(chaveCache, JSON.stringify(resultado));
            return resultado;
          })
          .catch(function (erro) {
            console.error("Erro ao buscar " + url + ":", erro);
            return "N/A";
          });

        promessas.push(promessa);
      }
    }

    const resultados = await Promise.all(promessas);
    return resultados;
  } catch (erro) {
    console.error("Erro geral ao buscar dados:", erro);
    return [];
  }
}
let planetasFavoritos;
let planetas = [];

// Função para mostrar estado de loading no modal
function mostrarLoadingModal() {
  const elementosLoading = ["modalResidentes", "modalFilmes"];

  elementosLoading.forEach(function (id) {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.innerHTML = '<li class="text-muted">Carregando...</li>';
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

// Função para criar e adicionar cards na tela
function adicionaCards(listaPlanetas) {
  const container = document.getElementById("listaPlanetas");
  container.innerHTML = "";

  if (listaPlanetas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🌍</div>
        <h3>Nenhum planeta encontrado</h3>
        <p>Tente ajustar sua busca ou filtro</p>
      </div>
    `;
    return;
  }

  listaPlanetas.forEach(function (planeta) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("planeta-card");
    cardDiv.setAttribute("data-planeta-id", planeta.name);

    // Botão de favoritar
    const btnFavoritar = document.createElement("button");
    btnFavoritar.classList.add("btn-favorito");
    btnFavoritar.innerHTML = '<i class="far fa-heart"></i>';

    // Verificar se o planeta já está favoritado
    const favoritos =
      JSON.parse(localStorage.getItem("planetasFavoritos")) || [];
    let isFavoritado = false;

    for (let i = 0; i < favoritos.length; i++) {
      if (favoritos[i].name === planeta.name) {
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
      e.stopPropagation(); // Impede que o evento chegue até o card
      toggleFavorito(planeta, btnFavoritar);
    });

    const cardHeader = document.createElement("div");
    cardHeader.classList.add("planeta-card-header");

    const cardTitle = document.createElement("h3");
    cardTitle.classList.add("planeta-card-title");
    cardTitle.textContent = planeta.name;

    const cardSubtitle = document.createElement("p");
    cardSubtitle.classList.add("planeta-card-subtitle");
    cardSubtitle.textContent = "Clima: " + planeta.climate;

    const cardBody = document.createElement("div");
    cardBody.classList.add("planeta-card-body");

    const cardFeatures = document.createElement("div");
    cardFeatures.classList.add("planeta-card-features");

    // População
    const populacaoFeature = document.createElement("div");
    populacaoFeature.classList.add("planeta-feature");

    let populacaoTexto = "Desconhecida";
    if (planeta.population !== "unknown") {
      populacaoTexto = parseInt(planeta.population).toLocaleString("pt-BR");
    }

    populacaoFeature.innerHTML = `
      <span class="feature-label">População</span>
      <span class="feature-value">${populacaoTexto}</span>
    `;

    // Diâmetro
    const diametroFeature = document.createElement("div");
    diametroFeature.classList.add("planeta-feature");

    let diametroTexto = "Desconhecido";
    if (planeta.diameter !== "unknown") {
      diametroTexto = planeta.diameter + " km";
    }

    diametroFeature.innerHTML = `
      <span class="feature-label">Diâmetro</span>
      <span class="feature-value">${diametroTexto}</span>
    `;

    // Terreno
    const terrenoFeature = document.createElement("div");
    terrenoFeature.classList.add("planeta-feature");

    let terrenoTexto = "Desconhecido";
    if (planeta.terrain !== "unknown") {
      terrenoTexto = planeta.terrain.split(", ")[0];
    }

    terrenoFeature.innerHTML = `
      <span class="feature-label">Terreno</span>
      <span class="feature-value">${terrenoTexto}</span>
    `;

    const cardFooter = document.createElement("div");
    cardFooter.classList.add("planeta-card-footer");

    const btnDetalhes = document.createElement("button");
    btnDetalhes.classList.add("btn-planeta-detalhes");
    btnDetalhes.textContent = "Ver Detalhes";

    // Montagem do card
    cardFeatures.appendChild(populacaoFeature);
    cardFeatures.appendChild(diametroFeature);
    cardFeatures.appendChild(terrenoFeature);

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
      abrirModalPlaneta(planeta);
    });
  });
}

// Função para alternar entre favoritar e desfavoritar
function toggleFavorito(planeta, btnElement) {
  let favoritos = JSON.parse(localStorage.getItem("planetasFavoritos")) || [];
  let isFavoritado = false;

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].name === planeta.name) {
      isFavoritado = true;
      break;
    }
  }

  if (isFavoritado) {
    // Remover dos favoritos
    const novosFavoritos = [];
    for (let i = 0; i < favoritos.length; i++) {
      if (favoritos[i].name !== planeta.name) {
        novosFavoritos.push(favoritos[i]);
      }
    }
    favoritos = novosFavoritos;
    btnElement.innerHTML = '<i class="far fa-heart"></i>';
    btnElement.classList.remove("favoritado");
    console.log('❌ "' + planeta.name + '" removido dos favoritos');
  } else {
    // Adicionar aos favoritos
    favoritos.push(planeta);
    btnElement.innerHTML = '<i class="fas fa-heart"></i>';
    btnElement.classList.add("favoritado");
    console.log('✅ "' + planeta.name + '" adicionado aos favoritos');
  }

  localStorage.setItem("planetasFavoritos", JSON.stringify(favoritos));

  // Feedback visual
  btnElement.style.transform = "scale(1.3)";
  setTimeout(function () {
    btnElement.style.transform = "scale(1)";
  }, 300);
}

// Função para abrir modal do planeta
async function abrirModalPlaneta(planeta) {
  // Preencher informações básicas do modal
  const modalNome = document.getElementById("modalNome");
  const modalClima = document.getElementById("modalClima");
  const modalDiametro = document.getElementById("modalDiametro");
  const modalGravidade = document.getElementById("modalGravidade");
  const modalPopulacao = document.getElementById("modalPopulacao");
  const modalPeriodoOrbital = document.getElementById("modalPeriodoOrbital");
  const modalPeriodoRotacao = document.getElementById("modalPeriodoRotacao");
  const modalAguaSuperficial = document.getElementById("modalAguaSuperficial");

  modalNome.textContent = planeta.name;
  modalClima.textContent = planeta.climate;

  if (planeta.diameter !== "unknown") {
    modalDiametro.textContent = planeta.diameter + " km";
  } else {
    modalDiametro.textContent = "Desconhecido";
  }

  modalGravidade.textContent = planeta.gravity;

  if (planeta.population !== "unknown") {
    modalPopulacao.textContent = parseInt(planeta.population).toLocaleString(
      "pt-BR"
    );
  } else {
    modalPopulacao.textContent = "Desconhecida";
  }

  modalPeriodoOrbital.textContent = planeta.orbital_period + " dias";
  modalPeriodoRotacao.textContent = planeta.rotation_period + " horas";

  if (planeta.surface_water !== "unknown") {
    modalAguaSuperficial.textContent = planeta.surface_water + "%";
  } else {
    modalAguaSuperficial.textContent = "Desconhecida";
  }

  // Preencher terrenos
  const terrenosElement = document.getElementById("modalTerrenos");
  terrenosElement.innerHTML = "";

  if (planeta.terrain && planeta.terrain !== "unknown") {
    const terrenos = planeta.terrain.split(", ");
    for (let i = 0; i < terrenos.length; i++) {
      const li = document.createElement("li");
      li.classList.add("mb-1");
      li.textContent = terrenos[i];
      terrenosElement.appendChild(li);
    }
  } else {
    terrenosElement.innerHTML =
      '<li class="text-muted">Nenhum terreno registrado</li>';
  }

  // Mostrar loading nas listas
  mostrarLoadingModal();

  // Buscar dados adicionais em paralelo COM CACHE
  try {
    const residentes = await buscarDadosDasURLsComCache(planeta.residents);
    const filmes = await buscarDadosDasURLsComCache(planeta.films);

    // Preencher as listas no modal
    preencherListaModal("modalResidentes", residentes);
    preencherListaModal("modalFilmes", filmes);
  } catch (error) {
    console.error("Erro ao carregar dados adicionais:", error);
    preencherListaModal("modalResidentes", ["Erro ao carregar dados"]);
  }

  // Definir o planeta atual para favoritos
  planetasFavoritos = planeta;

  // Configurar botão de favoritar
  const buttonFavorites = document.getElementById("btn-favorite");
  const jaFavoritado = verificarSeJaFavoritado(planeta);

  if (jaFavoritado) {
    buttonFavorites.textContent = "Remover dos Favoritos ❌";
    buttonFavorites.onclick = function () {
      removerDosFavoritos(planeta.name);
    };
  } else {
    buttonFavorites.textContent = "Favoritar ⭐";
    buttonFavorites.onclick = function () {
      adicionarAosFavoritos(planeta);
    };
  }

  // Abrir modal
  const modalElement = document.getElementById("planetaModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// Função para verificar se planeta já está favoritado
function verificarSeJaFavoritado(planeta) {
  const favoritos = obterFavoritos();

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].name === planeta.name) {
      return true;
    }
  }

  return false;
}

// Função para filtrar planetas pelo texto digitado
function filtrarPorNome(lista, textoUsuario) {
  const textoEmMinusculo = textoUsuario.toLowerCase();
  const planetasFiltrados = [];

  for (let i = 0; i < lista.length; i++) {
    const planeta = lista[i];
    if (planeta.name.toLowerCase().includes(textoEmMinusculo)) {
      planetasFiltrados.push(planeta);
    }
  }

  return planetasFiltrados;
}

// Funções para gerenciar favoritos
function obterFavoritos() {
  const favoritos = localStorage.getItem("planetasFavoritos");
  if (favoritos) {
    return JSON.parse(favoritos);
  } else {
    return [];
  }
}

function salvarFavoritos(favoritos) {
  localStorage.setItem("planetasFavoritos", JSON.stringify(favoritos));
}

function adicionarAosFavoritos(planeta) {
  const favoritos = obterFavoritos();
  let jaExiste = false;

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].name === planeta.name) {
      jaExiste = true;
      break;
    }
  }

  if (!jaExiste) {
    favoritos.push(planeta);
    salvarFavoritos(favoritos);

    // Atualizar botão no modal
    const buttonFavorites = document.getElementById("btn-favorite");
    buttonFavorites.textContent = "Remover dos Favoritos ❌";
    buttonFavorites.onclick = function () {
      removerDosFavoritos(planeta.name);
    };

    atualizarBotaoCard(planeta.name);

    return true;
  }
  return false;
}

function removerDosFavoritos(nomePlaneta) {
  let favoritos = obterFavoritos();
  const novosFavoritos = [];

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].name !== nomePlaneta) {
      novosFavoritos.push(favoritos[i]);
    }
  }

  favoritos = novosFavoritos;
  salvarFavoritos(favoritos);

  // Atualizar botão no modal
  const buttonFavorites = document.getElementById("btn-favorite");
  buttonFavorites.textContent = "Favoritar ⭐";
  buttonFavorites.onclick = function () {
    const planetaAtual = encontrarPlanetaPorNome(nomePlaneta);
    if (planetaAtual) {
      adicionarAosFavoritos(planetaAtual);
    }
  };

  atualizarBotaoCard(nomePlaneta);
}

// Função auxiliar para encontrar planeta por nome
function encontrarPlanetaPorNome(nomePlaneta) {
  for (let i = 0; i < planetas.length; i++) {
    if (planetas[i].name === nomePlaneta) {
      return planetas[i];
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
        <h3>Nenhum planeta favoritado</h3>
        <p>Adicione planetas aos favoritos para vizualizar.</p>
      </div>
    `;
    return;
  }

  let htmlFavoritos = "";

  for (let i = 0; i < favoritos.length; i++) {
    const planeta = favoritos[i];

    let populacaoTexto = "Desconhecida";
    if (planeta.population !== "unknown") {
      populacaoTexto = parseInt(planeta.population).toLocaleString("pt-BR");
    }

    htmlFavoritos += `
      <div class="favorito-item">
        <div>
          <h5 class="mb-1">${planeta.name}</h5>
          <p class="mb-1"><strong>Clima:</strong> ${planeta.climate}</p>
          <p class="mb-1"><strong>População:</strong> ${populacaoTexto}</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-light" onclick="abrirDetalhesPlaneta('${planeta.name}')">
            Ver Detalhes
          </button>
          <button class="btn btn-sm btn-remover-favorito" onclick="removerDosFavoritos('${planeta.name}'); atualizarListaFavoritos();">
            Remover
          </button>
        </div>
      </div>
    `;
  }

  listaFavoritos.innerHTML = htmlFavoritos;
}

// Função para abrir detalhes do planeta a partir dos favoritos
function abrirDetalhesPlaneta(nomePlaneta) {
  const favoritos = obterFavoritos();
  let planetaEncontrado = null;

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].name === nomePlaneta) {
      planetaEncontrado = favoritos[i];
      break;
    }
  }

  if (planetaEncontrado) {
    // Fechar modal de favoritos
    const favoritosModalElement = document.getElementById("favoritosModal");
    const favoritosModal = bootstrap.Modal.getInstance(favoritosModalElement);

    if (favoritosModal) {
      favoritosModal.hide();
    }

    // Abrir modal de detalhes
    abrirModalPlaneta(planetaEncontrado);
  }
}

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Carregar planetas
    planetas = await buscarComCache("planets");
    adicionaCards(planetas);

    // Configurar busca
    const inputBusca = document.getElementById("buscaPlaneta");
    const botao = document.getElementById("btnBuscar");

    botao.addEventListener("click", function () {
      const valorInput = inputBusca.value;
      const planetasFiltrados = filtrarPorNome(planetas, valorInput);
      adicionaCards(planetasFiltrados);
    });

    // Permitir busca com Enter
    inputBusca.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const valorInput = inputBusca.value;
        const planetasFiltrados = filtrarPorNome(planetas, valorInput);
        adicionaCards(planetasFiltrados);
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
    alert("Erro ao carregar os planetas. Verifique sua conexão.");
  }
});

// Função para atualizar o botão do card quando favoritar pelo modal
function atualizarBotaoCard(nomePlaneta) {
  const card = document.querySelector(
    '.planeta-card[data-planeta-id="' + nomePlaneta + '"]'
  );

  if (card) {
    const btnFavoritar = card.querySelector(".btn-favorito");
    const favoritos =
      JSON.parse(localStorage.getItem("planetasFavoritos")) || [];
    let isFavoritado = false;

    for (let i = 0; i < favoritos.length; i++) {
      if (favoritos[i].name === nomePlaneta) {
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
