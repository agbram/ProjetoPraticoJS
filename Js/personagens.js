// Js/personagens.js - JavaScript específico para a página de personagens
import { buscarDados } from "./apiCache.js";

// Função para buscar nome do planeta por ID
async function pegarNomePlaneta(id) {
  try {
    const response = await fetch(`https://swapi.dev/api/planets/${id}/`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar planeta ${id}`);
    }
    const data = await response.json();
    return data.name;
  } catch (error) {
    console.error('Erro ao buscar nome do planeta:', error);
    return `Planeta ${id}`;
  }
}

// Pega do localStorage
let favoritos = JSON.parse(localStorage.getItem("favoritosPersonagens")) || [];

// Função para verificar se um personagem é favorito
function isFavorito(personagem) {
  return favoritos.some((fav) => fav.name === personagem.name);
}

// Função para favoritar/desfavoritar personagem
function toggleFavorito(personagem, botaoFavorito = null) {
  const index = favoritos.findIndex((fav) => fav.name === personagem.name);

  if (index === -1) {
    // Adicionar aos favoritos
    favoritos.push(personagem);
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
  localStorage.setItem("favoritosPersonagens", JSON.stringify(favoritos));

  // Atualizar todos os botões de favorito na página
  atualizarBotoesFavorito();
}

// Função para atualizar todos os botões de favorito na página
function atualizarBotoesFavorito() {
  const botoesFavorito = document.querySelectorAll(".btn-favorito");

  botoesFavorito.forEach((botao) => {
    const card = botao.closest(".personagem-card");
    const titulo = card.querySelector(".personagem-card-title");
    if (titulo) {
      const nomePersonagem = titulo.textContent;
      const personagemEncontrado = favoritos.find(
        (fav) => fav.name === nomePersonagem
      );

      if (personagemEncontrado) {
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

  // Remove event listeners antigos se existirem
  const listaAntiga = modalBody.querySelector(".list-group");
  if (listaAntiga) {
    listaAntiga.remove();
  }

  // Caso não tenha favoritos
  if (lista.length === 0) {
    modalBody.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-heart-broken fa-3x text-muted mb-3"></i>
        <h5>Nenhum favorito salvo</h5>
        <p class="text-muted">Adicione alguns personagens aos seus favoritos para vê-los aqui.</p>
      </div>
    `;
  } else {
    // Cria a lista de favoritos
    const listaFavoritos = document.createElement("div");
    listaFavoritos.className = "list-group";

    lista.forEach((personagem, indice) => {
      const item = document.createElement("div");
      item.className =
        "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
      item.setAttribute("data-personagem-nome", personagem.name);

      item.innerHTML = `
        <div class="flex-grow-1">
          <h6 class="mb-1">${personagem.name}</h6>
          <small class="text-muted">${personagem.gender} • ${personagem.birth_year}</small>
        </div>
        <button class="btn btn-outline-danger btn-sm btn-remover-favorito ms-2" data-nome="${personagem.name}">
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
        const nomePersonagem = botaoRemover.getAttribute("data-nome");
        removerFavoritoPorNome(nomePersonagem);
        return;
      }

      // Se clicou no item (não no botão de remover)
      const item = e.target.closest(".list-group-item");
      if (item && !e.target.closest(".btn-remover-favorito")) {
        const nomePersonagem = item.getAttribute("data-personagem-nome");
        const personagem = favoritos.find((fav) => fav.name === nomePersonagem);
        if (personagem) {
          // Fecha o modal de favoritos
          if (modalFavoritosInstance) {
            modalFavoritosInstance.hide();
          }

          // Abre o modal com os detalhes do personagem
          exibirModalPersonagem(personagem);
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
function removerFavoritoPorNome(nomePersonagem) {
  const index = favoritos.findIndex((fav) => fav.name === nomePersonagem);

  if (index !== -1) {
    favoritos.splice(index, 1);
    localStorage.setItem("favoritosPersonagens", JSON.stringify(favoritos));

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
      // Não destruímos a instância, apenas limpamos event listeners conflitantes
      const modalBody = modalElement.querySelector(".modal-body");
      const lista = modalBody.querySelector(".list-group");
      if (lista) {
        // Remove event listeners substituindo o elemento
        const novaLista = lista.cloneNode(false);
        modalBody.replaceChild(novaLista, lista);
      }
    });
  }
});

// Função para preencher e exibir o modal
async function exibirModalPersonagem(personagem) {
  // Atualiza o título do modal
  document.getElementById("modalPersonagemLabel").textContent = personagem.name;

  const modalBody = document.getElementById("modalPersonagemBody");
  modalBody.innerHTML = ""; // Limpa o conteúdo anterior

  // Cria o grid de detalhes
  const detailsGrid = document.createElement("div");
  detailsGrid.classList.add("personagem-details-grid");

  // Grupo 1: Informações Básicas
  const basicInfoGroup = document.createElement("div");
  basicInfoGroup.classList.add("personagem-detail-group");

  const basicTitle = document.createElement("div");
  basicTitle.classList.add("detail-group-title");
  basicTitle.textContent = "Informações Básicas";
  basicInfoGroup.appendChild(basicTitle);

  const basicInfo = [
    { label: "Altura", value: `${personagem.height} cm` },
    { label: "Peso", value: `${personagem.mass} kg` },
    { label: "Cor do Cabelo", value: personagem.hair_color },
    { label: "Cor da Pele", value: personagem.skin_color },
    { label: "Cor dos Olhos", value: personagem.eye_color },
    { label: "Data de Nascimento", value: personagem.birth_year },
    { label: "Gênero", value: personagem.gender },
  ];

  basicInfo.forEach((info) => {
    const item = document.createElement("div");
    item.classList.add("personagem-detail-item");

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
  
  // Adiciona o link para o planeta natal
  const planetaGroup = document.createElement('div');
  planetaGroup.classList.add('personagem-detail-group');

  const planetaTitle = document.createElement('div');
  planetaTitle.classList.add('detail-group-title');
  planetaTitle.textContent = 'Planeta Natal';
  planetaGroup.appendChild(planetaTitle);

  const planetaItem = document.createElement('div');
  planetaItem.classList.add('personagem-detail-item');

  const planetaId = personagem.homeworld.split('/').filter(Boolean).pop();
  const planetaLink = document.createElement('a');
  planetaLink.href = `../../Paginas/Planetas/planetas.html?id=${planetaId}`;
  planetaLink.classList.add('btn', 'btn-sm', 'btn-outline-primary');

  // Buscar nome do planeta e aplicar no texto do link
  try {
    const nomePlaneta = await pegarNomePlaneta(planetaId);
    planetaLink.textContent = nomePlaneta;
  } catch (error) {
    console.error('Erro ao buscar nome do planeta:', error);
    planetaLink.textContent = `Planeta ${planetaId}`;
  }

  planetaItem.appendChild(planetaLink);
  planetaGroup.appendChild(planetaItem);

  detailsGrid.appendChild(planetaGroup);
  
  // Monta o modal
  modalBody.appendChild(detailsGrid);

  // Exibe o modal
  const modal = new bootstrap.Modal(document.getElementById('modalPersonagem'));
  modal.show();
}

// Função para criar e adicionar cards na tela
function adicionaCards(listaPersonagens) {
  const container = document.getElementById("listaPersonagens");
  container.innerHTML = ""; // Limpa o container antes de adicionar novos cards

  if (listaPersonagens.length === 0) {
    // Exibe estado vazio
    const emptyState = document.createElement("div");
    emptyState.classList.add("empty-state");

    const emptyIcon = document.createElement("div");
    emptyIcon.classList.add("empty-state-icon");
    emptyIcon.textContent = "👤";

    const emptyText = document.createElement("div");
    emptyText.textContent = "Nenhum personagem encontrado";

    emptyState.appendChild(emptyIcon);
    emptyState.appendChild(emptyText);
    container.appendChild(emptyState);
    return;
  }

  listaPersonagens.forEach((personagem, index) => {
    // Criar card para o personagem
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("personagem-card");

    // Verifica se o personagem já é favorito
    const favoritado = isFavorito(personagem);

    // Cabeçalho do card
    const cardHeader = document.createElement("div");
    cardHeader.classList.add("personagem-card-header");

    const title = document.createElement("h5");
    title.classList.add("personagem-card-title");
    title.textContent = personagem.name;

    const subtitle = document.createElement("div");
    subtitle.classList.add("personagem-card-subtitle");
    subtitle.textContent = `Nascimento: ${personagem.birth_year}`;

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
      toggleFavorito(personagem, botaoFavorito);
    });

    cardHeader.appendChild(title);
    cardHeader.appendChild(subtitle);
    cardHeader.appendChild(botaoFavorito);

    // Corpo do card
    const cardBody = document.createElement("div");
    cardBody.classList.add("personagem-card-body");

    const features = document.createElement("div");
    features.classList.add("personagem-card-features");

    const featureList = [
      { label: "Altura", value: `${personagem.height} cm` },
      { label: "Peso", value: `${personagem.mass} kg` },
      { label: "Gênero", value: personagem.gender },
      { label: "Cor dos Olhos", value: personagem.eye_color },
    ];

    featureList.forEach((feature) => {
      const featureDiv = document.createElement("div");
      featureDiv.classList.add("personagem-feature");

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
    cardFooter.classList.add("personagem-card-footer");

    const btnVerDetalhes = document.createElement("button");
    btnVerDetalhes.classList.add("btn-personagem-detalhes");
    btnVerDetalhes.textContent = "Ver Detalhes Completos";
    btnVerDetalhes.addEventListener("click", () => {
      exibirModalPersonagem(personagem);
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

// Função para filtrar personagens
function filtrarPorNome(lista, textoUsuario) {
  const textoEmMinusculo = textoUsuario.toLowerCase();

  const listaFiltrada = lista.filter((personagem) => {
    return personagem.name.toLowerCase().includes(textoEmMinusculo);
  });

  return listaFiltrada;
}

// Inicialização quando a página carrega
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Carrega todos os personagens
    const personagens = await buscarDados("people");

    // Exibe os personagens na tela
    adicionaCards(personagens);

    // Selecionando input e botão
    const inputBusca = document.getElementById("buscaPersonagem");
    const botao = document.getElementById("btnBuscar");

    // Evento de clique no botão de buscar
    botao.addEventListener("click", function () {
      const valorInput = inputBusca.value.trim();

      if (valorInput === "") {
        // Se estiver vazio, mostra todos os personagens
        adicionaCards(personagens);
      } else {
        // Filtra os personagens contendo o texto digitado
        const personagensFiltrados = filtrarPorNome(personagens, valorInput);
        adicionaCards(personagensFiltrados);
      }
    });

    // Evento para buscar ao pressionar Enter
    inputBusca.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        botao.click();
      }
    });

    // Verificar se há um parâmetro id na URL para abrir o modal automaticamente
    const urlParams = new URLSearchParams(window.location.search);
    const personagemId = urlParams.get('id');

    if (personagemId) {
      // Buscar o personagem específico
      try {
        const response = await fetch(`https://swapi.dev/api/people/${personagemId}/`);
        if (response.ok) {
          const personagem = await response.json();
          
          // Verificar se o personagem já está na lista carregada
          let personagemEncontrado = personagens.find(p => {
            // Extrair ID da URL do personagem
            const idDaUrl = p.url.split('/').filter(Boolean).pop();
            return idDaUrl === personagemId;
          });
          
          // Se não encontrou na lista, usar o personagem da API
          if (!personagemEncontrado) {
            personagemEncontrado = personagem;
          }
          
          // Abrir o modal do personagem
          exibirModalPersonagem(personagemEncontrado);
          
          // Remover o parâmetro id da URL sem recarregar a página
          const novaURL = window.location.protocol + "//" + 
                         window.location.host + 
                         window.location.pathname;
          window.history.replaceState({}, document.title, novaURL);
        }
      } catch (error) {
        console.error('Erro ao carregar personagem específico:', error);
      }
    }
  } catch (error) {
    console.error("Erro ao inicializar a página:", error);
  }
});