// Função assíncrona para buscar dados da SWAPI
async function buscarDados(endpoint) {
  const url = `https://swapi.dev/api/${endpoint}`;

  try {
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error(`Erro na requisição: ${resposta.status}`);
    }

    const dados = await resposta.json();
    return dados.results;
  } catch (erro) {
    console.error("Erro ao buscar dados:", erro);
    alert("Não foi possível carregar os dados. Verifique sua conexão.");
    return [];
  }
}

// Função auxiliar para buscar múltiplos dados da API
async function buscarDadosDasURLs(urls) {
  if (!urls || urls.length === 0) {
    return [];
  }

  try {
    const promises = urls.map((url) =>
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error("Erro na requisição");
          return response.json();
        })
        .then((data) => data.name || data.title)
        .catch((error) => {
          console.error(`Erro ao buscar ${url}:`, error);
          return "N/A";
        })
    );

    return await Promise.all(promises);
  } catch (error) {
    console.error("Erro geral ao buscar dados:", error);
    return [];
  }
}

let planetasFavoritos;
let planetas = [];

// Função para mostrar estado de loading no modal
function mostrarLoadingModal() {
  const elementosLoading = ["modalResidentes", "modalFilmes"];

  elementosLoading.forEach((id) => {
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

  itens.forEach((item) => {
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

  listaPlanetas.forEach((planeta) => {
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
    const isFavoritado = favoritos.some((fav) => fav.name === planeta.name);

    if (isFavoritado) {
      btnFavoritar.innerHTML = '<i class="fas fa-heart"></i>';
      btnFavoritar.classList.add("favoritado");
    }

    // Prevenir que o clique no coração abra o modal
    btnFavoritar.addEventListener("click", (e) => {
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
    cardSubtitle.textContent = `Clima: ${planeta.climate}`;

    const cardBody = document.createElement("div");
    cardBody.classList.add("planeta-card-body");

    const cardFeatures = document.createElement("div");
    cardFeatures.classList.add("planeta-card-features");

    // População
    const populacaoFeature = document.createElement("div");
    populacaoFeature.classList.add("planeta-feature");
    populacaoFeature.innerHTML = `
      <span class="feature-label">População</span>
      <span class="feature-value">${
        planeta.population !== "unknown"
          ? parseInt(planeta.population).toLocaleString("pt-BR")
          : "Desconhecida"
      }</span>
    `;

    // Diâmetro
    const diametroFeature = document.createElement("div");
    diametroFeature.classList.add("planeta-feature");
    diametroFeature.innerHTML = `
      <span class="feature-label">Diâmetro</span>
      <span class="feature-value">${
        planeta.diameter !== "unknown"
          ? `${planeta.diameter} km`
          : "Desconhecido"
      }</span>
    `;

    // Terreno
    const terrenoFeature = document.createElement("div");
    terrenoFeature.classList.add("planeta-feature");
    terrenoFeature.innerHTML = `
      <span class="feature-label">Terreno</span>
      <span class="feature-value">${
        planeta.terrain !== "unknown"
          ? planeta.terrain.split(", ")[0]
          : "Desconhecido"
      }</span>
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
    cardDiv.addEventListener("click", async () => {
      await abrirModalPlaneta(planeta);
    });
  });
}

// Função para alternar entre favoritar e desfavoritar
function toggleFavorito(planeta, btnElement) {
  let favoritos = JSON.parse(localStorage.getItem("planetasFavoritos")) || [];
  const isFavoritado = favoritos.some((fav) => fav.name === planeta.name);

  if (isFavoritado) {
    // Remover dos favoritos
    favoritos = favoritos.filter((fav) => fav.name !== planeta.name);
    btnElement.innerHTML = '<i class="far fa-heart"></i>';
    btnElement.classList.remove("favoritado");
    console.log(`❌ "${planeta.name}" removido dos favoritos`);
  } else {
    // Adicionar aos favoritos
    favoritos.push(planeta);
    btnElement.innerHTML = '<i class="fas fa-heart"></i>';
    btnElement.classList.add("favoritado");
    console.log(`✅ "${planeta.name}" adicionado aos favoritos`);
  }

  localStorage.setItem("planetasFavoritos", JSON.stringify(favoritos));

  // Feedback visual
  btnElement.style.transform = "scale(1.3)";
  setTimeout(() => {
    btnElement.style.transform = "scale(1)";
  }, 300);
}

// Função para abrir modal do planeta
async function abrirModalPlaneta(planeta) {
  // Preencher informações básicas do modal
  document.getElementById("modalNome").textContent = planeta.name;
  document.getElementById("modalClima").textContent = planeta.climate;
  document.getElementById("modalDiametro").textContent =
    planeta.diameter !== "unknown" ? `${planeta.diameter} km` : "Desconhecido";
  document.getElementById("modalGravidade").textContent = planeta.gravity;
  document.getElementById("modalPopulacao").textContent =
    planeta.population !== "unknown"
      ? parseInt(planeta.population).toLocaleString("pt-BR")
      : "Desconhecida";
  document.getElementById(
    "modalPeriodoOrbital"
  ).textContent = `${planeta.orbital_period} dias`;
  document.getElementById(
    "modalPeriodoRotacao"
  ).textContent = `${planeta.rotation_period} horas`;
  document.getElementById("modalAguaSuperficial").textContent =
    planeta.surface_water !== "unknown"
      ? `${planeta.surface_water}%`
      : "Desconhecida";

  // Preencher terrenos
  const terrenosElement = document.getElementById("modalTerrenos");
  terrenosElement.innerHTML = "";
  if (planeta.terrain && planeta.terrain !== "unknown") {
    const terrenos = planeta.terrain.split(", ");
    terrenos.forEach((terreno) => {
      const li = document.createElement("li");
      li.classList.add("mb-1");
      li.textContent = terreno;
      terrenosElement.appendChild(li);
    });
  } else {
    terrenosElement.innerHTML =
      '<li class="text-muted">Nenhum terreno registrado</li>';
  }

  // Mostrar loading nas listas
  mostrarLoadingModal();

  // Buscar dados adicionais em paralelo
  try {
    const [residentes, filmes] = await Promise.all([
      buscarDadosDasURLs(planeta.residents),
      buscarDadosDasURLs(planeta.films),
    ]);

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
    buttonFavorites.onclick = () => removerDosFavoritos(planeta.name);
  } else {
    buttonFavorites.textContent = "Favoritar ⭐";
    buttonFavorites.onclick = () => adicionarAosFavoritos(planeta);
  }

  // Abrir modal
  const modalElement = document.getElementById("planetaModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// Função para verificar se planeta já está favoritado
function verificarSeJaFavoritado(planeta) {
  const favoritos = obterFavoritos();
  return favoritos.some((f) => f.name === planeta.name);
}

// Função para filtrar planetas pelo texto digitado
function filtrarPorNome(lista, textoUsuario) {
  const textoEmMinusculo = textoUsuario.toLowerCase();
  return lista.filter((planeta) => {
    return planeta.name.toLowerCase().includes(textoEmMinusculo);
  });
}

// Funções para gerenciar favoritos
function obterFavoritos() {
  const favoritos = localStorage.getItem("planetasFavoritos");
  return favoritos ? JSON.parse(favoritos) : [];
}

function salvarFavoritos(favoritos) {
  localStorage.setItem("planetasFavoritos", JSON.stringify(favoritos));
}

function adicionarAosFavoritos(planeta) {
  const favoritos = obterFavoritos();

  if (!favoritos.some((f) => f.name === planeta.name)) {
    favoritos.push(planeta);
    salvarFavoritos(favoritos);

    // Atualizar botão no modal
    const buttonFavorites = document.getElementById("btn-favorite");
    buttonFavorites.textContent = "Remover dos Favoritos ❌";
    buttonFavorites.onclick = () => removerDosFavoritos(planeta.name);

    atualizarBotaoCard(planeta.name);

    return true;
  }
  return false;
}

function removerDosFavoritos(nomePlaneta) {
  let favoritos = obterFavoritos();
  favoritos = favoritos.filter((f) => f.name !== nomePlaneta);
  salvarFavoritos(favoritos);

  // Atualizar botão no modal
  const buttonFavorites = document.getElementById("btn-favorite");
  buttonFavorites.textContent = "Favoritar ⭐";
  buttonFavorites.onclick = () => {
    const planetaAtual = planetas.find((f) => f.name === nomePlaneta);
    if (planetaAtual) adicionarAosFavoritos(planetaAtual);
  };

  atualizarBotaoCard(nomePlaneta);
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

  listaFavoritos.innerHTML = favoritos
    .map((planeta) => {
      return `
      <div class="favorito-item">
        <div>
          <h5 class="mb-1">${planeta.name}</h5>
          <p class="mb-1"><strong>Clima:</strong> ${planeta.climate}</p>
          <p class="mb-1"><strong>População:</strong> ${
            planeta.population !== "unknown"
              ? parseInt(planeta.population).toLocaleString("pt-BR")
              : "Desconhecida"
          }</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-light" onclick="abrirDetalhesPlaneta('${
            planeta.name
          }')">
            Ver Detalhes
          </button>
          <button class="btn btn-sm btn-remover-favorito" onclick="removerDosFavoritos('${
            planeta.name
          }'); atualizarListaFavoritos();">
            Remover
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

// Função para abrir detalhes do planeta a partir dos favoritos
function abrirDetalhesPlaneta(nomePlaneta) {
  const favoritos = obterFavoritos();
  const planeta = favoritos.find((f) => f.name === nomePlaneta);

  if (planeta) {
    // Fechar modal de favoritos
    const favoritosModal = bootstrap.Modal.getInstance(
      document.getElementById("favoritosModal")
    );
    if (favoritosModal) {
      favoritosModal.hide();
    }

    // Abrir modal de detalhes
    abrirModalPlaneta(planeta);
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
      const favoritosModal = new bootstrap.Modal(
        document.getElementById("favoritosModal")
      );
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
    `.planeta-card[data-planeta-id="${nomePlaneta}"]`
  );

  if (card) {
    const btnFavoritar = card.querySelector(".btn-favorito");
    const favoritos =
      JSON.parse(localStorage.getItem("planetasFavoritos")) || [];
    const isFavoritado = favoritos.some((fav) => fav.name === nomePlaneta);

    if (isFavoritado) {
      btnFavoritar.innerHTML = '<i class="fas fa-heart"></i>';
      btnFavoritar.classList.add("favoritado");
    } else {
      btnFavoritar.innerHTML = '<i class="far fa-heart"></i>';
      btnFavoritar.classList.remove("favoritado");
    }

    // Feedback visual
    btnFavoritar.style.transform = "scale(1.3)";
    setTimeout(() => {
      btnFavoritar.style.transform = "scale(1)";
    }, 300);
  }
}

async function buscarComCache(endpoint) {
  const chave = `cache_${endpoint}`;

  // 1. Tenta pegar do cache
  const cache = localStorage.getItem(chave);

  if (cache) {
    console.log(`🔵 Usando cache de ${endpoint}`);
    return JSON.parse(cache);
  }

  // 2. Se não tiver cache → faz fetch normalmente
  console.log(`🟡 Buscando ${endpoint} da API...`);
  const dados = await buscarDados(endpoint);

  // 3. Salva no cache
  localStorage.setItem(chave, JSON.stringify(dados));

  return dados;
}
