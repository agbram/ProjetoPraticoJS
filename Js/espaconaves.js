// espaconaves.js - JavaScript específico para a página de espaçonaves

import { buscarComCache, buscarDadosDasURLsComCache } from "./apiCache.js";

// Função para extrair ID da URL da SWAPI (DEVE VIR ANTES DE SER USADA)
function extrairIdDaUrl(url) {
  if (!url) return null;
  const partes = url.split("/").filter((part) => part !== "");
  return partes[partes.length - 1];
}

// Funções para buscar nomes por ID COM CACHE
async function pegarNomePersonagemPorId(id) {
  try {
    // Usando a função de cache para buscar personagens
    const personagens = await buscarComCache("people");
    const personagemEncontrado = personagens.find((p) => {
      const personagemId = extrairIdDaUrl(p.url);
      return personagemId === id.toString();
    });

    if (personagemEncontrado) {
      return personagemEncontrado.name;
    } else {
      // Se não encontrar no cache, tenta buscar diretamente
      const response = await fetch(`https://swapi.dev/api/people/${id}/`);
      if (!response.ok) throw new Error(`Erro ao buscar personagem ${id}`);
      const data = await response.json();
      return data.name;
    }
  } catch (error) {
    console.error("Erro ao buscar nome do personagem:", error);
    return `Piloto ${id}`;
  }
}

async function pegarNomeFilmePorId(id) {
  try {
    // Usando a função de cache para buscar filmes
    const filmes = await buscarComCache("films");
    const filmeEncontrado = filmes.find((f) => {
      const filmeId = extrairIdDaUrl(f.url);
      return filmeId === id.toString();
    });

    if (filmeEncontrado) {
      return filmeEncontrado.title;
    } else {
      // Se não encontrar no cache, tenta buscar diretamente
      const response = await fetch(`https://swapi.dev/api/films/${id}/`);
      if (!response.ok) throw new Error(`Erro ao buscar filme ${id}`);
      const data = await response.json();
      return data.title;
    }
  } catch (error) {
    console.error("Erro ao buscar título do filme:", error);
    return `Filme ${id}`;
  }
}

// Pega do localStorage
let favoritos = JSON.parse(localStorage.getItem("favoritosEspaconaves")) || [];

// Função para verificar se uma espaçonave é favorita
function isFavorito(espaconave) {
  return favoritos.some((fav) => fav.name === espaconave.name);
}

// Função para favoritar/desfavoritar espaçonave
function toggleFavorito(espaconave, botaoFavorito = null) {
  const index = favoritos.findIndex((fav) => fav.name === espaconave.name);

  if (index === -1) {
    // Adicionar aos favoritos
    favoritos.push(espaconave);
    if (botaoFavorito) {
      botaoFavorito.innerHTML = '<i class="fas fa-heart"></i>';
      botaoFavorito.classList.add("favoritado");
    }
  } else {
    // Remover dos favoritos
    favoritos.splice(index, 1);
    if (botaoFavorito) {
      botaoFavorito.innerHTML = '<i class="far fa-heart"></i>';
      botaoFavorito.classList.remove("favoritado");
    }
  }

  // Atualizar localStorage
  localStorage.setItem("favoritosEspaconaves", JSON.stringify(favoritos));

  // Atualizar todos os botões de favorito na página
  atualizarBotoesFavorito();
}

// Função para atualizar todos os botões de favorito na página
function atualizarBotoesFavorito() {
  const botoesFavorito = document.querySelectorAll(".btn-favorito");

  botoesFavorito.forEach((botao) => {
    const card = botao.closest(".veiculo-card");
    const titulo = card.querySelector(".veiculo-card-title");
    if (titulo) {
      const nomeEspaconave = titulo.textContent;
      const espaconaveEncontrada = favoritos.find(
        (fav) => fav.name === nomeEspaconave
      );

      if (espaconaveEncontrada) {
        botao.innerHTML = '<i class="fas fa-heart"></i>';
        botao.classList.add("favoritado");
      } else {
        botao.innerHTML = '<i class="far fa-heart"></i>';
        botao.classList.remove("favoritado");
      }
    }
  });
}

// Variável para controlar a instância do modal
let modalFavoritosInstance = null;

// Função para montar e exibir modal de favoritos
function exibirModalFavoritos(lista) {
  const modalElement = document.getElementById("modalFavoritos");
  const modalBody = modalElement.querySelector(".modal-body");

  // Limpa o conteúdo anterior
  modalBody.innerHTML = "";

  // Caso não tenha favoritos
  if (lista.length === 0) {
    modalBody.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-heart-broken fa-3x text-muted mb-3"></i>
        <h5>Nenhum favorito salvo</h5>
        <p class="text-muted">Adicione algumas espaçonaves aos seus favoritos para vê-las aqui.</p>
      </div>
    `;
  } else {
    // Cria a lista de favoritos
    const listaFavoritos = document.createElement("div");
    listaFavoritos.className = "list-group";

    lista.forEach((espaconave, indice) => {
      const item = document.createElement("div");
      item.className =
        "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
      item.setAttribute("data-espaconave-nome", espaconave.name);

      item.innerHTML = `
        <div class="flex-grow-1">
          <h6 class="mb-1">${espaconave.name}</h6>
          <small class="text-muted">${espaconave.model} • ${espaconave.manufacturer}</small>
        </div>
        <button class="btn btn-outline-danger btn-sm btn-remover-favorito ms-2" data-nome="${espaconave.name}">
          <i class="fas fa-trash"></i>
        </button>
      `;

      listaFavoritos.appendChild(item);
    });

    modalBody.appendChild(listaFavoritos);

    // Adiciona event delegation para os botões de remover
    listaFavoritos.addEventListener("click", function (e) {
      const botaoRemover = e.target.closest(".btn-remover-favorito");
      if (botaoRemover) {
        e.preventDefault();
        e.stopPropagation();
        const nomeEspaconave = botaoRemover.getAttribute("data-nome");
        removerFavoritoPorNome(nomeEspaconave);
        return;
      }

      // Se clicou no item (não no botão de remover)
      const item = e.target.closest(".list-group-item");
      if (item && !e.target.closest(".btn-remover-favorito")) {
        const nomeEspaconave = item.getAttribute("data-espaconave-nome");
        const espaconave = favoritos.find((fav) => fav.name === nomeEspaconave);
        if (espaconave) {
          // Fecha o modal de favoritos
          if (modalFavoritosInstance) {
            modalFavoritosInstance.hide();
          }

          // Abre o modal com os detalhes da espaçonave
          exibirModalEspaconave(espaconave);
        }
      }
    });
  }

  // Cria ou obtém a instância do modal
  if (!modalFavoritosInstance) {
    modalFavoritosInstance = new bootstrap.Modal(modalElement);
  }

  // Exibe o modal
  modalFavoritosInstance.show();
}

// Função que remove favorito por nome e atualiza a interface
function removerFavoritoPorNome(nomeEspaconave) {
  const index = favoritos.findIndex((fav) => fav.name === nomeEspaconave);

  if (index !== -1) {
    favoritos.splice(index, 1);
    localStorage.setItem("favoritosEspaconaves", JSON.stringify(favoritos));

    // Atualiza a interface
    atualizarBotoesFavorito();

    // Se o modal de favoritos estiver aberto, atualiza ele também
    const modalElement = document.getElementById("modalFavoritos");
    if (modalElement.classList.contains("show")) {
      // Pequeno delay para garantir a atualização
      setTimeout(() => {
        exibirModalFavoritos(favoritos);
      }, 100);
    }
  }
}

// Função para formatar valores numéricos
function formatarNumero(valor) {
  if (valor === "unknown" || valor === "n/a" || valor === "none") {
    return "Desconhecido";
  }

  const num = parseFloat(valor.replace(/,/g, ""));
  if (!isNaN(num)) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString("pt-BR");
  }

  return valor;
}

// Função para formatar o custo
function formatarCusto(custo) {
  if (custo === "unknown" || custo === "n/a") {
    return "Desconhecido";
  }

  const num = parseFloat(custo.replace(/,/g, ""));
  if (!isNaN(num)) {
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  return custo;
}

// Função para formatar velocidade
function formatarVelocidade(velocidade) {
  if (velocidade === "unknown" || velocidade === "n/a") {
    return "Desconhecido";
  }

  const num = parseFloat(velocidade.replace(/,/g, ""));
  if (!isNaN(num)) {
    return `${num.toLocaleString("pt-BR")} km/h`;
  }

  return velocidade;
}

// Função para formatar comprimento
function formatarComprimento(comprimento) {
  if (comprimento === "unknown" || comprimento === "n/a") {
    return "Desconhecido";
  }

  const num = parseFloat(comprimento.replace(/,/g, ""));
  if (!isNaN(num)) {
    return `${num.toLocaleString("pt-BR")} metros`;
  }

  return comprimento;
}

// Função para exibir modal com detalhes da espaçonave
async function exibirModalEspaconave(espaconave) {
  // Atualiza o título do modal
  document.getElementById("modalVeiculoLabel").textContent = espaconave.name;

  const modalBody = document.getElementById("modalVeiculoBody");
  modalBody.innerHTML = ""; // Limpa o conteúdo anterior

  // Cria o grid de detalhes
  const detailsGrid = document.createElement("div");
  detailsGrid.classList.add("veiculo-details-grid");

  // Grupo 1: Informações Básicas
  const basicInfoGroup = document.createElement("div");
  basicInfoGroup.classList.add("veiculo-detail-group");

  const basicTitle = document.createElement("div");
  basicTitle.classList.add("detail-group-title");
  basicTitle.textContent = "Informações Básicas";
  basicInfoGroup.appendChild(basicTitle);

  const basicInfo = [
    { label: "Nome", value: espaconave.name },
    { label: "Modelo", value: espaconave.model || "Desconhecido" },
    { label: "Fabricante", value: espaconave.manufacturer || "Desconhecido" },
    { label: "Classe", value: espaconave.starship_class || "Desconhecido" },
    { label: "Custo", value: formatarCusto(espaconave.cost_in_credits) },
    { label: "Comprimento", value: formatarComprimento(espaconave.length) },
    { label: "Tripulação", value: formatarNumero(espaconave.crew) },
    { label: "Passageiros", value: formatarNumero(espaconave.passengers) },
  ];

  basicInfo.forEach((info) => {
    const item = document.createElement("div");
    item.classList.add("veiculo-detail-item");

    const label = document.createElement("span");
    label.classList.add("detail-label");
    label.textContent = info.label;

    const value = document.createElement("span");
    value.classList.add("detail-value");
    value.textContent = info.value;

    item.appendChild(label);
    item.appendChild(value);
    basicInfoGroup.appendChild(item);
  });

  // Adiciona o grupo ao grid
  detailsGrid.appendChild(basicInfoGroup);

  // Grupo 2: Especificações Técnicas
  const specsGroup = document.createElement("div");
  specsGroup.classList.add("veiculo-detail-group");

  const specsTitle = document.createElement("div");
  specsTitle.classList.add("detail-group-title");
  specsTitle.textContent = "Especificações Técnicas";
  specsGroup.appendChild(specsTitle);

  const specsInfo = [
    {
      label: "Velocidade Atmosférica",
      value: formatarVelocidade(espaconave.max_atmosphering_speed),
    },
    {
      label: "Classificação Hiperdrive",
      value: espaconave.hyperdrive_rating || "Desconhecido",
    },
    {
      label: "Capacidade de Carga",
      value: `${formatarNumero(espaconave.cargo_capacity)} kg`,
    },
    { label: "Consumíveis", value: espaconave.consumables || "Desconhecido" },
  ];

  specsInfo.forEach((info) => {
    const item = document.createElement("div");
    item.classList.add("veiculo-detail-item");

    const label = document.createElement("span");
    label.classList.add("detail-label");
    label.textContent = info.label;

    const value = document.createElement("span");
    value.classList.add("detail-value");
    value.textContent = info.value;

    item.appendChild(label);
    item.appendChild(value);
    specsGroup.appendChild(item);
  });

  // Adiciona o grupo ao grid
  detailsGrid.appendChild(specsGroup);

  // Grupo 3: Filmes
  const filmesGroup = document.createElement("div");
  filmesGroup.classList.add("veiculo-detail-group");

  const filmesTitle = document.createElement("div");
  filmesTitle.classList.add("detail-group-title");
  filmesTitle.textContent = "Filmes";
  filmesGroup.appendChild(filmesTitle);

  if (espaconave.films && espaconave.films.length > 0) {
    // Usar Promise.all para buscar todos os nomes de filmes de uma vez
    const filmesPromises = espaconave.films.map(async (filmeUrl, index) => {
      const filmeItem = document.createElement("div");
      filmeItem.classList.add("veiculo-detail-item");

      // Extrair ID do filme
      const filmeId = extrairIdDaUrl(filmeUrl);

      // Criar link com parâmetro id
      const filmeLink = document.createElement("a");
      filmeLink.href = `../../Paginas/Filmes/filmes.html?id=${filmeId}`;
      filmeLink.classList.add("btn", "btn-sm", "btn-outline-primary");

      // Buscar o nome e aplicar
      try {
        const nomeFilme = await pegarNomeFilmePorId(filmeId);
        filmeLink.textContent = nomeFilme;
      } catch (error) {
        filmeLink.textContent = `Filme ${index + 1}`;
      }

      filmeItem.appendChild(filmeLink);
      return filmeItem;
    });

    // Esperar todos os filmes serem processados
    const filmesItems = await Promise.all(filmesPromises);
    filmesItems.forEach((item) => filmesGroup.appendChild(item));
  } else {
    const filmeItem = document.createElement("div");
    filmeItem.classList.add("veiculo-detail-item");

    const noFilmesMsg = document.createElement("span");
    noFilmesMsg.textContent = "Nenhum filme encontrado";
    noFilmesMsg.classList.add("text-muted");

    filmeItem.appendChild(noFilmesMsg);
    filmesGroup.appendChild(filmeItem);
  }

  detailsGrid.appendChild(filmesGroup);

  // Grupo 4: Pilotos
  const pilotosGroup = document.createElement("div");
  pilotosGroup.classList.add("veiculo-detail-group");

  const pilotosTitle = document.createElement("div");
  pilotosTitle.classList.add("detail-group-title");
  pilotosTitle.textContent = "Pilotos";
  pilotosGroup.appendChild(pilotosTitle);

  if (espaconave.pilots && espaconave.pilots.length > 0) {
    // Usar Promise.all para buscar todos os nomes de pilotos de uma vez
    const pilotosPromises = espaconave.pilots.map(async (pilotoUrl, index) => {
      const pilotoItem = document.createElement("div");
      pilotoItem.classList.add("veiculo-detail-item");

      // Extrair ID do piloto
      const pilotoId = extrairIdDaUrl(pilotoUrl);

      // Criar link com parâmetro id
      const pilotoLink = document.createElement("a");
      pilotoLink.href = `../../Paginas/Personagens/personagens.html?id=${pilotoId}`;
      pilotoLink.classList.add("btn", "btn-sm", "btn-outline-primary");

      // Buscar o nome e aplicar
      try {
        const nomePiloto = await pegarNomePersonagemPorId(pilotoId);
        pilotoLink.textContent = nomePiloto;
      } catch (error) {
        pilotoLink.textContent = `Piloto ${index + 1}`;
      }

      pilotoItem.appendChild(pilotoLink);
      return pilotoItem;
    });

    // Esperar todos os pilotos serem processados
    const pilotosItems = await Promise.all(pilotosPromises);
    pilotosItems.forEach((item) => pilotosGroup.appendChild(item));
  } else {
    const pilotoItem = document.createElement("div");
    pilotoItem.classList.add("veiculo-detail-item");

    const noPilotosMsg = document.createElement("span");
    noPilotosMsg.textContent = "Nenhum piloto conhecido";
    noPilotosMsg.classList.add("text-muted");

    pilotoItem.appendChild(noPilotosMsg);
    pilotosGroup.appendChild(pilotoItem);
  }

  detailsGrid.appendChild(pilotosGroup);

  // Monta o modal
  modalBody.appendChild(detailsGrid);

  // Exibe o modal
  const modal = new bootstrap.Modal(document.getElementById("modalVeiculo"));
  modal.show();
}

// Evento para abrir modal de favoritos
document.addEventListener("DOMContentLoaded", function () {
  const botaoFavoritos = document.getElementById("btnFavoritos");
  if (botaoFavoritos) {
    botaoFavoritos.addEventListener("click", function () {
      exibirModalFavoritos(favoritos);
    });
  }

  // Limpa a instância do modal quando ele é fechado
  const modalElement = document.getElementById("modalFavoritos");
  if (modalElement) {
    modalElement.addEventListener("hidden.bs.modal", function () {
      const modalBody = modalElement.querySelector(".modal-body");
      const lista = modalBody.querySelector(".list-group");
      if (lista) {
        const novaLista = lista.cloneNode(false);
        modalBody.replaceChild(novaLista, lista);
      }
    });
  }
});

// Função para criar e adicionar cards na tela
function adicionaCards(listaEspaconaves) {
  const container = document.getElementById("listaVeiculos");
  container.innerHTML = ""; // Limpa o container antes de adicionar novos cards

  if (listaEspaconaves.length === 0) {
    // Exibe estado vazio
    const emptyState = document.createElement("div");
    emptyState.classList.add("empty-state");

    const emptyIcon = document.createElement("div");
    emptyIcon.classList.add("empty-state-icon");
    emptyIcon.textContent = "🚀";

    const emptyText = document.createElement("div");
    emptyText.textContent = "Nenhuma espaçonave encontrada";

    emptyState.appendChild(emptyIcon);
    emptyState.appendChild(emptyText);
    container.appendChild(emptyState);
    return;
  }

  listaEspaconaves.forEach((espaconave, index) => {
    // Criar card para a espaçonave
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("veiculo-card");

    // Verifica se a espaçonave já é favorita
    const favoritado = isFavorito(espaconave);

    // Cabeçalho do card
    const cardHeader = document.createElement("div");
    cardHeader.classList.add("veiculo-card-header");

    const title = document.createElement("h5");
    title.classList.add("veiculo-card-title");
    title.textContent = espaconave.name;

    const subtitle = document.createElement("div");
    subtitle.classList.add("veiculo-card-subtitle");
    subtitle.textContent = `Modelo: ${espaconave.model || "Desconhecido"}`;

    // Botão de favorito
    const botaoFavorito = document.createElement("button");
    botaoFavorito.classList.add("btn-favorito");
    if (favoritado) {
      botaoFavorito.innerHTML = '<i class="fas fa-heart"></i>';
      botaoFavorito.classList.add("favoritado");
    } else {
      botaoFavorito.innerHTML = '<i class="far fa-heart"></i>';
    }

    // Evento para favoritar/desfavoritar
    botaoFavorito.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorito(espaconave, botaoFavorito);
    });

    cardHeader.appendChild(title);
    cardHeader.appendChild(subtitle);
    cardHeader.appendChild(botaoFavorito);

    // Corpo do card
    const cardBody = document.createElement("div");
    cardBody.classList.add("veiculo-card-body");

    const features = document.createElement("div");
    features.classList.add("veiculo-card-features");

    const featureList = [
      { label: "Fabricante", value: espaconave.manufacturer || "Desconhecido" },
      { label: "Classe", value: espaconave.starship_class || "Desconhecido" },
      { label: "Custo", value: formatarCusto(espaconave.cost_in_credits) },
      { label: "Comprimento", value: formatarComprimento(espaconave.length) },
      { label: "Tripulação", value: formatarNumero(espaconave.crew) },
      {
        label: "Velocidade Máx.",
        value: formatarVelocidade(espaconave.max_atmosphering_speed),
      },
    ];

    featureList.forEach((feature) => {
      const featureDiv = document.createElement("div");
      featureDiv.classList.add("veiculo-feature");

      const label = document.createElement("span");
      label.classList.add("feature-label");
      label.textContent = feature.label;

      const value = document.createElement("span");
      value.classList.add("feature-value");
      value.textContent = feature.value;

      featureDiv.appendChild(label);
      featureDiv.appendChild(value);
      features.appendChild(featureDiv);
    });

    // Rodapé do card
    const cardFooter = document.createElement("div");
    cardFooter.classList.add("veiculo-card-footer");

    const btnVerDetalhes = document.createElement("button");
    btnVerDetalhes.classList.add("btn-veiculo-detalhes");
    btnVerDetalhes.textContent = "Ver Detalhes";
    btnVerDetalhes.addEventListener("click", () => {
      exibirModalEspaconave(espaconave);
    });

    // Montar a estrutura
    cardBody.appendChild(features);
    cardFooter.appendChild(btnVerDetalhes);
    cardBody.appendChild(cardFooter);

    cardDiv.appendChild(cardHeader);
    cardDiv.appendChild(cardBody);

    container.appendChild(cardDiv);
  });
}

// Função para filtrar espaçonaves
function filtrarPorNome(lista, textoUsuario) {
  const textoEmMinusculo = textoUsuario.toLowerCase();

  const listaFiltrada = lista.filter((espaconave) => {
    return (
      espaconave.name.toLowerCase().includes(textoEmMinusculo) ||
      (espaconave.model &&
        espaconave.model.toLowerCase().includes(textoEmMinusculo)) ||
      (espaconave.manufacturer &&
        espaconave.manufacturer.toLowerCase().includes(textoEmMinusculo))
    );
  });

  return listaFiltrada;
}

// Inicialização quando a página carrega
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const espaconaves = await buscarComCache("starships");

    // Verifica se veio do cache ou da API
    const cacheSalvo = localStorage.getItem("cache_starships");
    if (cacheSalvo) {
    } else {
    }

    // Exibe as espaçonaves na tela
    adicionaCards(espaconaves);

    // Selecionando input e botão
    const inputBusca = document.getElementById("buscaVeiculos");
    const botao = document.getElementById("btnBuscar");

    // Evento de clique no botão de buscar
    botao.addEventListener("click", function () {
      const valorInput = inputBusca.value.trim();

      if (valorInput === "") {
        // Se estiver vazio, mostra todas as espaçonaves
        adicionaCards(espaconaves);
      } else {
        // Filtra as espaçonaves contendo o texto digitado
        const espaconavesFiltradas = filtrarPorNome(espaconaves, valorInput);
        adicionaCards(espaconavesFiltradas);
      }
    });

    // Evento para buscar ao pressionar Enter
    inputBusca.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        botao.click();
      }
    });
  } catch (error) {
    console.error("❌ Erro ao carregar espaçonaves:", error);
    // Mostra mensagem de erro para o usuário
    const container = document.getElementById("listaVeiculos");
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Erro ao carregar espaçonaves</h3>
        <p>Verifique sua conexão com a internet e tente novamente.</p>
        <button onclick="location.reload()" class="btn btn-primary mt-3">Tentar Novamente</button>
      </div>
    `;
  }
});
