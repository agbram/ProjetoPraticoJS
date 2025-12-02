// Js/filmes.js
import { buscarComCache, buscarDadosDasURLsComCache } from "./apiCache.js";

// Variáveis globais
let filmsFavorites;
let filmes = [];

// Gerenciador de instâncias de modais
let modalInstances = {
  filmeModal: null,
  favoritosModal: null
};

// Função para limpar backdrop
function limparBackdrop() {
  // Remover backdrops
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => {
    if (backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
    }
  });
  
  // Restaurar body
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

// Função para fechar todos os modais
function fecharTodosModais() {
  Object.keys(modalInstances).forEach(key => {
    if (modalInstances[key]) {
      modalInstances[key].hide();
    }
  });
  
  // Limpar backdrop após um pequeno delay
  setTimeout(limparBackdrop, 100);
}

// Função para abrir modal com segurança
function abrirModalSeguro(modalId) {
  // Fechar todos os modais abertos primeiro
  fecharTodosModais();
  
  // Pequeno delay para garantir o fechamento
  return new Promise(resolve => {
    setTimeout(() => {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        // Se já existe uma instância, usar ela
        if (!modalInstances[modalId]) {
          modalInstances[modalId] = new bootstrap.Modal(modalElement, {
            backdrop: true,
            keyboard: true,
            focus: true
          });
        }
        
        // Configurar evento para limpar quando fechar
        modalElement.addEventListener('hidden.bs.modal', function() {
          setTimeout(limparBackdrop, 100);
        }, { once: true });
        
        modalInstances[modalId].show();
        resolve(modalInstances[modalId]);
      } else {
        console.error(`Modal ${modalId} não encontrado!`);
        resolve(null);
      }
    }, 150);
  });
}

// Função para mostrar notificação
function mostrarNotificacao(mensagem, tipo = 'info') {
  const tipos = {
    'success': 'alert-success',
    'info': 'alert-info',
    'warning': 'alert-warning',
    'danger': 'alert-danger'
  };
  
  // Criar elemento de notificação
  const notificacao = document.createElement('div');
  notificacao.className = `alert ${tipos[tipo]} alert-dismissible fade show position-fixed`;
  notificacao.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  notificacao.innerHTML = `
    ${mensagem}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notificacao);
  
  // Remover após 3 segundos
  setTimeout(() => {
    if (notificacao.parentNode) {
      notificacao.remove();
    }
  }, 3000);
}

// Função para mostrar estado de loading no modal
function mostrarLoadingModal() {
  const elementosLoading = [
    "modalPersonagens",
    "modalPlanetas",
    "modalNaves",
    "modalVeiculos",
    "modalEspecies",
  ];

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
function adicionaCards(listaFilmes) {
  const container = document.getElementById("listaFilmes");
  container.innerHTML = "";

  // VERIFICAÇÃO CRÍTICA: Garantir que listaFilmes é um array
  if (!listaFilmes || !Array.isArray(listaFilmes)) {
    console.error("listaFilmes não é um array:", listaFilmes);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Erro ao carregar filmes</h3>
        <p>Dados recebidos em formato inválido</p>
      </div>
    `;
    return;
  }

  if (listaFilmes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎬</div>
        <h3>Nenhum filme encontrado</h3>
        <p>Tente ajustar sua busca ou filtro</p>
      </div>
    `;
    return;
  }

  listaFilmes.forEach(function (filme) {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("filme-card");
    cardDiv.setAttribute("data-episode-id", filme.episode_id);

    // Botão de favoritar
    const btnFavoritar = document.createElement("button");
    btnFavoritar.classList.add("btn-favorito");
    btnFavoritar.innerHTML = '<i class="far fa-heart"></i>';

    // Verificar se o filme já está favoritado
    const favoritos = JSON.parse(localStorage.getItem("filmesFavoritos")) || [];
    let isFavoritado = false;

    for (let i = 0; i < favoritos.length; i++) {
      if (favoritos[i].episode_id === filme.episode_id) {
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
      toggleFavorito(filme, btnFavoritar);
    });

    const cardHeader = document.createElement("div");
    cardHeader.classList.add("filme-card-header");

    const cardTitle = document.createElement("h3");
    cardTitle.classList.add("filme-card-title");
    cardTitle.textContent = filme.title;

    const cardSubtitle = document.createElement("p");
    cardSubtitle.classList.add("filme-card-subtitle");
    cardSubtitle.textContent = "Episódio " + filme.episode_id;

    const cardBody = document.createElement("div");
    cardBody.classList.add("filme-card-body");

    const cardFeatures = document.createElement("div");
    cardFeatures.classList.add("filme-card-features");

    // Diretor
    const diretorFeature = document.createElement("div");
    diretorFeature.classList.add("filme-feature");
    diretorFeature.innerHTML = `
      <span class="feature-label">Diretor</span>
      <span class="feature-value">${filme.director}</span>
    `;

    // Data de lançamento
    const dataFeature = document.createElement("div");
    dataFeature.classList.add("filme-feature");
    const dataLancamento = filme.release_date;
    let dataFormatada = dataLancamento;

    if (dataLancamento) {
      const data = new Date(dataLancamento);
      if (!isNaN(data.getTime())) {
        dataFormatada = data.toLocaleDateString("pt-BR");
      }
    }

    dataFeature.innerHTML = `
      <span class="feature-label">Lançamento</span>
      <span class="feature-value">${dataFormatada}</span>
    `;

    // Produtor
    const produtorFeature = document.createElement("div");
    produtorFeature.classList.add("filme-feature");
    const primeiroProdutor = filme.producer.split(",")[0];
    produtorFeature.innerHTML = `
      <span class="feature-label">Produtor</span>
      <span class="feature-value">${primeiroProdutor}</span>
    `;

    const cardFooter = document.createElement("div");
    cardFooter.classList.add("filme-card-footer");

    const btnDetalhes = document.createElement("button");
    btnDetalhes.classList.add("btn-filme-detalhes");
    btnDetalhes.textContent = "Ver Detalhes";

    // Montagem do card
    cardFeatures.appendChild(diretorFeature);
    cardFeatures.appendChild(dataFeature);
    cardFeatures.appendChild(produtorFeature);

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
      abrirModalFilme(filme);
    });
  });
}

// Função para alternar entre favoritar e desfavoritar
function toggleFavorito(filme, btnElement) {
  let favoritos = JSON.parse(localStorage.getItem("filmesFavoritos")) || [];
  let isFavoritado = false;

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].episode_id === filme.episode_id) {
      isFavoritado = true;
      break;
    }
  }

  if (isFavoritado) {
    // Remover dos favoritos
    const novosFavoritos = [];
    for (let i = 0; i < favoritos.length; i++) {
      if (favoritos[i].episode_id !== filme.episode_id) {
        novosFavoritos.push(favoritos[i]);
      }
    }
    favoritos = novosFavoritos;
    btnElement.innerHTML = '<i class="far fa-heart"></i>';
    btnElement.classList.remove("favoritado");
    console.log('❌ "' + filme.title + '" removido dos favoritos');
  } else {
    // Adicionar aos favoritos
    favoritos.push(filme);
    btnElement.innerHTML = '<i class="fas fa-heart"></i>';
    btnElement.classList.add("favoritado");
    console.log('✅ "' + filme.title + '" adicionado aos favoritos');
  }

  localStorage.setItem("filmesFavoritos", JSON.stringify(favoritos));

  // Feedback visual
  btnElement.style.transform = "scale(1.3)";
  setTimeout(function () {
    btnElement.style.transform = "scale(1)";
  }, 300);
}

// Função para abrir modal do filme (VERSÃO CORRIGIDA)
async function abrirModalFilme(filme) {
  // Preencher informações básicas do modal
  const modalTitulo = document.getElementById("modalTitulo");
  const modalDiretor = document.getElementById("modalDiretor");
  const modalProdutor = document.getElementById("modalProdutor");
  const modalAbertura = document.getElementById("modalAbertura");
  const modalDataLancamento = document.getElementById("modalDataLancamento");

  if (!modalTitulo || !modalDiretor || !modalProdutor || !modalAbertura || !modalDataLancamento) {
    console.error("Elementos do modal não encontrados!");
    return;
  }

  modalTitulo.textContent = filme.title;
  modalDiretor.textContent = filme.director;
  modalProdutor.textContent = filme.producer;
  modalAbertura.textContent = filme.opening_crawl;

  // Formatar data
  const dataLancamento = filme.release_date;
  let dataFormatada = dataLancamento;

  if (dataLancamento) {
    const data = new Date(dataLancamento);
    if (!isNaN(data.getTime())) {
      dataFormatada = data.toLocaleDateString("pt-BR");
    }
  }

  modalDataLancamento.textContent = dataFormatada;

  // Mostrar loading nas listas
  mostrarLoadingModal();

  // Buscar dados adicionais em paralelo COM CACHE
  try {
    const [personagens, planetas, naves, veiculos, especies] = await Promise.all([
      buscarDadosDasURLsComCache(filme.characters),
      buscarDadosDasURLsComCache(filme.planets),
      buscarDadosDasURLsComCache(filme.starships),
      buscarDadosDasURLsComCache(filme.vehicles),
      buscarDadosDasURLsComCache(filme.species)
    ]);

    // Preencher as listas no modal
    preencherListaModal("modalPersonagens", personagens);
    preencherListaModal("modalPlanetas", planetas);
    preencherListaModal("modalNaves", naves);
    preencherListaModal("modalVeiculos", veiculos);
    preencherListaModal("modalEspecies", especies);
  } catch (error) {
    console.error("Erro ao carregar dados adicionais:", error);
    preencherListaModal("modalPersonagens", ["Erro ao carregar dados"]);
  }

  // Definir o filme atual para favoritos
  filmsFavorites = filme;

  // Configurar botão de favoritar
  const buttonFavorites = document.getElementById("btn-favorite");
  if (!buttonFavorites) {
    console.error("Botão de favoritar não encontrado!");
  } else {
    const jaFavoritado = verificarSeJaFavoritado(filme);

    if (jaFavoritado) {
      buttonFavorites.innerHTML = 'Remover dos Favoritos ❌';
      buttonFavorites.onclick = function () {
        removerDosFavoritos(filme.episode_id);
        // Atualizar o botão após remover
        buttonFavorites.innerHTML = 'Favoritar ⭐';
        buttonFavorites.onclick = function () {
          adicionarAosFavoritos(filme);
        };
        // Atualizar o botão no card
        atualizarBotaoCard(filme.episode_id);
      };
    } else {
      buttonFavorites.innerHTML = 'Favoritar ⭐';
      buttonFavorites.onclick = function () {
        if (adicionarAosFavoritos(filme)) {
          // Atualizar o botão após adicionar
          buttonFavorites.innerHTML = 'Remover dos Favoritos ❌';
          buttonFavorites.onclick = function () {
            removerDosFavoritos(filme.episode_id);
          };
          // Atualizar o botão no card
          atualizarBotaoCard(filme.episode_id);
        }
      };
    }
  }

  // Abrir modal de forma segura
  await abrirModalSeguro('filmeModal');

  // Rolar para o topo da página para ver o modal melhor
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Função para verificar se filme já está favoritado
function verificarSeJaFavoritado(filme) {
  const favoritos = obterFavoritos();

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].episode_id === filme.episode_id) {
      return true;
    }
  }

  return false;
}

// Função para filtrar filmes pelo texto digitado
function filtrarPorNome(lista, textoUsuario) {
  const textoEmMinusculo = textoUsuario.toLowerCase();
  const filmesFiltrados = [];

  for (let i = 0; i < lista.length; i++) {
    const filme = lista[i];
    if (filme.title.toLowerCase().includes(textoEmMinusculo)) {
      filmesFiltrados.push(filme);
    }
  }

  return filmesFiltrados;
}

// Funções para gerenciar favoritos
function obterFavoritos() {
  const favoritos = localStorage.getItem("filmesFavoritos");
  if (favoritos) {
    return JSON.parse(favoritos);
  } else {
    return [];
  }
}

function salvarFavoritos(favoritos) {
  localStorage.setItem("filmesFavoritos", JSON.stringify(favoritos));
}

function adicionarAosFavoritos(filme) {
  const favoritos = obterFavoritos();
  let jaExiste = false;

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].episode_id === filme.episode_id) {
      jaExiste = true;
      break;
    }
  }

  if (!jaExiste) {
    favoritos.push(filme);
    salvarFavoritos(favoritos);

    // Atualizar botão no modal
    const buttonFavorites = document.getElementById("btn-favorite");
    buttonFavorites.textContent = "Remover dos Favoritos ❌";
    buttonFavorites.onclick = function () {
      removerDosFavoritos(filme.episode_id);
    };

    atualizarBotaoCard(filme.episode_id);

    return true;
  }
  return false;
}

function removerDosFavoritos(episodeId) {
  let favoritos = obterFavoritos();
  const novosFavoritos = [];

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].episode_id !== episodeId) {
      novosFavoritos.push(favoritos[i]);
    }
  }

  favoritos = novosFavoritos;
  salvarFavoritos(favoritos);

  // Atualizar botão no modal
  const buttonFavorites = document.getElementById("btn-favorite");
  buttonFavorites.textContent = "Favoritar ⭐";
  buttonFavorites.onclick = function () {
    const filmeAtual = encontrarFilmePorEpisodeId(episodeId);
    if (filmeAtual) {
      adicionarAosFavoritos(filmeAtual);
    }
  };

  atualizarBotaoCard(episodeId);
}

// Função auxiliar para encontrar filme por episode_id
function encontrarFilmePorEpisodeId(episodeId) {
  for (let i = 0; i < filmes.length; i++) {
    if (filmes[i].episode_id === episodeId) {
      return filmes[i];
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
        <h3>Nenhum filme favoritado</h3>
        <p>Adicione filmes aos favoritos para vizualizar.</p>
      </div>
    `;
    return;
  }

  let htmlFavoritos = "";

  for (let i = 0; i < favoritos.length; i++) {
    const filme = favoritos[i];

    // Formatar data igual no modal
    const dataLancamento = filme.release_date;
    let dataFormatada = dataLancamento;

    if (dataLancamento) {
      const data = new Date(dataLancamento);
      if (!isNaN(data.getTime())) {
        dataFormatada = data.toLocaleDateString("pt-BR");
      }
    }

    htmlFavoritos += `
      <div class="favorito-item">
        <div>
          <h5 class="mb-1">${filme.title}</h5>
          <p class="mb-1"><strong>Diretor:</strong> ${filme.director}</p>
          <p class="mb-1"><strong>Lançamento:</strong> ${dataFormatada}</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-light btn-ver-detalhes-favorito" data-episode-id="${filme.episode_id}">
            Ver Detalhes
          </button>
          <button class="btn btn-sm btn-remover-favorito" data-episode-id="${filme.episode_id}">
            Remover
          </button>
        </div>
      </div>
    `;
  }

  listaFavoritos.innerHTML = htmlFavoritos;
  
  // Adicionar event listeners aos botões dos favoritos
  setTimeout(() => {
    // Botões "Ver Detalhes"
    document.querySelectorAll('.btn-ver-detalhes-favorito').forEach(button => {
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        const episodeId = this.getAttribute('data-episode-id');
        abrirDetalhesFilme(parseInt(episodeId));
      });
    });
    
    // Botões "Remover"
    document.querySelectorAll('.btn-remover-favorito').forEach(button => {
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        const episodeId = this.getAttribute('data-episode-id');
        removerDosFavoritos(parseInt(episodeId));
        atualizarListaFavoritos();
      });
    });
  }, 50);
}

// Função para abrir detalhes do filme a partir dos favoritos
async function abrirDetalhesFilme(episodeId) {
  const favoritos = obterFavoritos();
  let filmeEncontrado = null;

  for (let i = 0; i < favoritos.length; i++) {
    if (favoritos[i].episode_id === episodeId) {
      filmeEncontrado = favoritos[i];
      break;
    }
  }

  if (filmeEncontrado) {
    // Fechar modal de favoritos primeiro
    if (modalInstances.favoritosModal) {
      modalInstances.favoritosModal.hide();
      
      // Pequeno delay para garantir o fechamento
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Abrir modal de detalhes
    await abrirModalFilme(filmeEncontrado);
  }
}

// Função para atualizar o botão do card quando favoritar pelo modal
function atualizarBotaoCard(episodeId) {
  const card = document.querySelector(
    '.filme-card[data-episode-id="' + episodeId + '"]'
  );

  if (card) {
    const btnFavoritar = card.querySelector(".btn-favorito");
    const favoritos = JSON.parse(localStorage.getItem("filmesFavoritos")) || [];
    let isFavoritado = false;

    for (let i = 0; i < favoritos.length; i++) {
      if (favoritos[i].episode_id === episodeId) {
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
    console.log("Iniciando carregamento de filmes...");

    // Verificar se há um parâmetro id na URL para abrir o modal automaticamente
    const urlParams = new URLSearchParams(window.location.search);
    const filmeId = urlParams.get('id');

    // Carregar filmes
    filmes = await buscarComCache("films");
    console.log("Dados recebidos:", filmes);

    // VERIFICAÇÃO: Garantir que filmes seja um array
    if (filmes && !Array.isArray(filmes)) {
      console.warn("filmes não é um array, tentando extrair results...");

      // Se for o objeto completo da API, extrai o results
      if (filmes.results && Array.isArray(filmes.results)) {
        filmes = filmes.results;
        console.log("Extraído results:", filmes);
      } else {
        console.error("Formato inesperado:", filmes);
        filmes = [];
      }
    }

    if (!filmes || filmes.length === 0) {
      console.warn("Nenhum filme encontrado ou array vazio");
    }

    adicionaCards(filmes);

    // Configurar busca
    const inputBusca = document.getElementById("buscaFilme");
    const botao = document.getElementById("btnBuscar");

    botao.addEventListener("click", function () {
      const valorInput = inputBusca.value;
      const filmeFiltrado = filtrarPorNome(filmes, valorInput);
      adicionaCards(filmeFiltrado);
    });

    // Permitir busca com Enter
    inputBusca.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const valorInput = inputBusca.value;
        const filmeFiltrado = filtrarPorNome(filmes, valorInput);
        adicionaCards(filmeFiltrado);
      }
    });

    // Configurar botão para abrir modal de favoritos
    const btnFavoritos = document.getElementById("btnFavoritos");
    btnFavoritos.addEventListener("click", async function () {
      atualizarListaFavoritos();
      await abrirModalSeguro('favoritosModal');
    });

    // Configurar evento para quando o modal de filme for fechado
    const filmeModalElement = document.getElementById("filmeModal");
    if (filmeModalElement) {
      filmeModalElement.addEventListener('hidden.bs.modal', function() {
        setTimeout(limparBackdrop, 100);
      });
    }

    // Configurar evento para quando o modal de favoritos for fechado
    const favoritosModalElement = document.getElementById("favoritosModal");
    if (favoritosModalElement) {
      favoritosModalElement.addEventListener('hidden.bs.modal', function() {
        setTimeout(limparBackdrop, 100);
      });
    }

    // Verificar se precisa abrir um filme específico a partir da URL
    if (filmeId) {
      // Esperar os filmes carregarem e então abrir o modal correspondente
      setTimeout(async () => {
        try {
          // Buscar os dados específicos do filme pela API
          const response = await fetch(`https://swapi.dev/api/films/${filmeId}/`);
          if (response.ok) {
            const filme = await response.json();
            
            // Encontrar o filme na lista carregada
            const todosFilmes = await buscarComCache('films');
            let filmesArray = todosFilmes;
            
            // Verificar se precisa extrair results
            if (todosFilmes && !Array.isArray(todosFilmes) && todosFilmes.results) {
              filmesArray = todosFilmes.results;
            }
            
            const filmeEncontrado = filmesArray.find(f => f.episode_id === filme.episode_id);
            
            if (filmeEncontrado) {
              // Abrir o modal do filme
              await abrirModalFilme(filmeEncontrado);
              
              // Remover o parâmetro id da URL sem recarregar a página
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        } catch (error) {
          console.error('Erro ao carregar filme específico:', error);
        }
      }, 1000); // Dar tempo para os filmes carregarem
    }

    console.log("Aplicação inicializada com sucesso!");
  } catch (error) {
    console.error("Erro ao inicializar aplicação:", error);
    mostrarNotificacao("Erro ao carregar os filmes. Verifique sua conexão.", 'danger');

    // Mostrar mensagem de erro na interface
    const container = document.getElementById("listaFilmes");
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <h3>Erro ao carregar filmes</h3>
        <p>${error.message || "Verifique sua conexão com a internet"}</p>
        <button class="btn btn-primary mt-3" onclick="location.reload()">Tentar Novamente</button>
      </div>
    `;
  }
});

// Exportar funções para uso global (para o HTML)
window.abrirDetalhesFilme = abrirDetalhesFilme;
window.removerDosFavoritos = removerDosFavoritos;