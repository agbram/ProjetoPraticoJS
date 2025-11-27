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

let filmsFavorites;
let filmes = [];

// Função para mostrar estado de loading no modal
function mostrarLoadingModal() {
  const elementosLoading = [
    "modalPersonagens",
    "modalPlanetas",
    "modalNaves",
    "modalVeiculos",
    "modalEspecies",
  ];

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
function adicionaCards(listaFilmes) {
  const container = document.getElementById("listaFilmes");
  container.innerHTML = "";

  listaFilmes.forEach((filme) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card", "card-filme");
    cardDiv.style.width = "18rem";
    cardDiv.style.cursor = "pointer";
    cardDiv.setAttribute("data-episode-id", filme.episode_id);

    // Botão de favoritar
    const btnFavoritar = document.createElement("button");
    btnFavoritar.classList.add("btn-favoritar-card");
    btnFavoritar.innerHTML = "🤍"; // Coração vazio inicialmente

    // Verificar se o filme já está favoritado
    const favoritos = JSON.parse(localStorage.getItem("filmesFavoritos")) || [];
    const isFavoritado = favoritos.some(
      (fav) => fav.episode_id === filme.episode_id
    );

    if (isFavoritado) {
      btnFavoritar.innerHTML = "💛";
      btnFavoritar.classList.add("favoritado");
    }

    // Prevenir que o clique no coração abra o modal
    btnFavoritar.addEventListener("click", (e) => {
      e.stopPropagation(); // Impede que o evento chegue até o card
      toggleFavorito(filme, btnFavoritar);
    });

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const titulo = document.createElement("h5");
    titulo.classList.add("card-title");
    titulo.textContent = filme.title;

    const diretor = document.createElement("p");
    diretor.classList.add("card-text");
    diretor.textContent = `Diretor: ${filme.director}`;

    cardBody.appendChild(titulo);
    cardBody.appendChild(diretor);
    cardDiv.appendChild(btnFavoritar); // Adiciona o botão primeiro
    cardDiv.appendChild(cardBody);
    container.appendChild(cardDiv);

    // Evento de abrir modal
    cardDiv.addEventListener("click", async () => {
      await abrirModalFilme(filme);
    });
  });
}

// Função para alternar entre favoritar e desfavoritar
function toggleFavorito(filme, btnElement) {
  let favoritos = JSON.parse(localStorage.getItem("filmesFavoritos")) || [];
  const isFavoritado = favoritos.some(
    (fav) => fav.episode_id === filme.episode_id
  );

  if (isFavoritado) {
    // Remover dos favoritos
    favoritos = favoritos.filter((fav) => fav.episode_id !== filme.episode_id);
    btnElement.innerHTML = "🤍";
    btnElement.classList.remove("favoritado");
    console.log(`❌ "${filme.title}" removido dos favoritos`);
  } else {
    // Adicionar aos favoritos
    favoritos.push(filme);
    btnElement.innerHTML = "💛";
    btnElement.classList.add("favoritado");
    console.log(`✅ "${filme.title}" adicionado aos favoritos`);
  }

  localStorage.setItem("filmesFavoritos", JSON.stringify(favoritos));

  // Feedback visual
  btnElement.style.transform = "scale(1.3)";
  setTimeout(() => {
    btnElement.style.transform = "scale(1)";
  }, 300);
}

// Função para abrir modal do filme
async function abrirModalFilme(filme) {
  // Preencher informações básicas do modal
  document.getElementById("modalTitulo").textContent = filme.title;
  document.getElementById("modalDiretor").textContent = filme.director;
  document.getElementById("modalProdutor").textContent = filme.producer;
  document.getElementById("modalAbertura").textContent = filme.opening_crawl;

  // Formatar data
  const dataLancamento = filme.release_date;
  let dataFormatada;
  if (dataLancamento) {
    const data = new Date(dataLancamento);
    if (!isNaN(data.getTime())) {
      dataFormatada = data.toLocaleDateString("pt-BR");
    }
  }
  document.getElementById("modalDataLancamento").textContent =
    dataFormatada || dataLancamento;

  // Mostrar loading nas listas
  mostrarLoadingModal();

  // Buscar dados adicionais em paralelo
  try {
    const [personagens, planetas, naves, veiculos, especies] =
      await Promise.all([
        buscarDadosDasURLs(filme.characters),
        buscarDadosDasURLs(filme.planets),
        buscarDadosDasURLs(filme.starships),
        buscarDadosDasURLs(filme.vehicles),
        buscarDadosDasURLs(filme.species),
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
  const jaFavoritado = verificarSeJaFavoritado(filme);

  if (jaFavoritado) {
    buttonFavorites.textContent = "Remover dos Favoritos❌";
    buttonFavorites.onclick = () => removerDosFavoritos(filme.episode_id);
  } else {
    buttonFavorites.textContent = "Favoritar⭐";
    buttonFavorites.onclick = () => adicionarAosFavoritos(filme);
  }

  // Abrir modal
  const modalElement = document.getElementById("filmeModal");
  const modal = new bootstrap.Modal(modalElement);
  modal.show();
}

// Função para verificar se filme já está favoritado
function verificarSeJaFavoritado(filme) {
  const favoritos = obterFavoritos();
  return favoritos.some((f) => f.episode_id === filme.episode_id);
}

// Função para filtrar filmes pelo texto digitado
function filtrarPorNome(lista, textoUsuario) {
  const textoEmMinusculo = textoUsuario.toLowerCase();
  return lista.filter((filme) => {
    return filme.title.toLowerCase().includes(textoEmMinusculo);
  });
}

// Funções para gerenciar favoritos
function obterFavoritos() {
  const favoritos = localStorage.getItem("filmesFavoritos");
  return favoritos ? JSON.parse(favoritos) : [];
}

function salvarFavoritos(favoritos) {
  localStorage.setItem("filmesFavoritos", JSON.stringify(favoritos));
}

function adicionarAosFavoritos(filme) {
  const favoritos = obterFavoritos();

  if (!favoritos.some((f) => f.episode_id === filme.episode_id)) {
    favoritos.push(filme);
    salvarFavoritos(favoritos);

    // Atualizar botão no modal
    const buttonFavorites = document.getElementById("btn-favorite");
    buttonFavorites.textContent = "Remover dos Favoritos❌";
    buttonFavorites.onclick = () => removerDosFavoritos(filme.episode_id);

    atualizarBotaoCard(filme.episode_id);

    return true;
  }
  return false;
}

function removerDosFavoritos(episodeId) {
  let favoritos = obterFavoritos();
  favoritos = favoritos.filter((f) => f.episode_id !== episodeId);
  salvarFavoritos(favoritos);

  // Atualizar botão no modal
  const buttonFavorites = document.getElementById("btn-favorite");
  buttonFavorites.textContent = "Favoritar⭐";
  buttonFavorites.onclick = () => {
    const filmeAtual = filmes.find((f) => f.episode_id === episodeId);
    if (filmeAtual) adicionarAosFavoritos(filmeAtual);
  };

  atualizarBotaoCard(episodeId);
}

function atualizarListaFavoritos() {
  const listaFavoritos = document.getElementById("listaFavoritosModal");
  const favoritos = obterFavoritos();

  if (favoritos.length === 0) {
    listaFavoritos.innerHTML = `
      <div class="empty-favorites">
        <i>⭐</i>
        <h4>Nenhum filme favoritado</h4>
        <p>Adicione filmes aos favoritos clicando no botão "Favoritar" nos detalhes do filme.</p>
      </div>
    `;
    return;
  }
  listaFavoritos.innerHTML = favoritos
    .map((filme) => {
      // Formatar data igual no modal
      const dataLancamento = filme.release_date;
      let dataFormatada;
      if (dataLancamento) {
        const data = new Date(dataLancamento);
        if (!isNaN(data.getTime())) {
          dataFormatada = data.toLocaleDateString("pt-BR");
        }
      }

      return `
      <div class="favorito-item">
        <div>
          <h5 class="mb-1">${filme.title}</h5>
          <p class="mb-1"><strong>Diretor:</strong> ${filme.director}</p>
 ${dataFormatada || dataLancamento}</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-light" onclick="abrirDetalhesFilme(${
            filme.episode_id
          })">
            Ver Detalhes
          </button>
          <button class="btn btn-sm btn-remover-favorito" onclick="removerDosFavoritos(${
            filme.episode_id
          }); atualizarListaFavoritos();">
            Remover
          </button>
        </div>
      </div>
    `;
    })
    .join("");
}

// Função para abrir detalhes do filme a partir dos favoritos
function abrirDetalhesFilme(episodeId) {
  const favoritos = obterFavoritos();
  const filme = favoritos.find((f) => f.episode_id === episodeId);

  if (filme) {
    // Fechar modal de favoritos
    const favoritosModal = bootstrap.Modal.getInstance(
      document.getElementById("favoritosModal")
    );
    if (favoritosModal) {
      favoritosModal.hide();
    }

    // Abrir modal de detalhes
    abrirModalFilme(filme);
  }
}

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Carregar filmes
    filmes = await buscarDados("films");
    adicionaCards(filmes);

    // Configurar busca
    const inputBusca = document.getElementById("buscaFilme");
    const botao = document.getElementById("btnBuscar");

    botao.addEventListener("keypress", (e) => {
      if (e.key === "Enter") botao.click();
    });

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
    const btnFavoritos = document.querySelector(".btn-favoritos-flutuante");
    btnFavoritos.addEventListener("click", function () {
      atualizarListaFavoritos();
      const favoritosModal = new bootstrap.Modal(
        document.getElementById("favoritosModal")
      );
      favoritosModal.show();
    });
  } catch (error) {
    console.error("Erro ao inicializar aplicação:", error);
    alert("Erro ao carregar os filmes. Verifique sua conexão.");
  }
});

// Função para atualizar o botão do card quando favoritar pelo modal
function atualizarBotaoCard(episodeId) {
  const card = document.querySelector(
    `.card-filme[data-episode-id="${episodeId}"]`
  );

  if (card) {
    const btnFavoritar = card.querySelector(".btn-favoritar-card");
    const favoritos = JSON.parse(localStorage.getItem("filmesFavoritos")) || [];
    const isFavoritado = favoritos.some((fav) => fav.episode_id === episodeId);

    if (isFavoritado) {
      btnFavoritar.innerHTML = "💛";
      btnFavoritar.classList.add("favoritado");
    } else {
      btnFavoritar.innerHTML = "🤍";
      btnFavoritar.classList.remove("favoritado");
    }

    // Feedback visual
    btnFavoritar.style.transform = "scale(1.3)";
    setTimeout(() => {
      btnFavoritar.style.transform = "scale(1)";
    }, 300);
  }
}
