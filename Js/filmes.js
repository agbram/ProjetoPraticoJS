// Função assíncrona para buscar dados da SWAPI
async function buscarDados(endpoint) {
  const url = `https://swapi.dev/api/${endpoint}`; // Monta a URL com o endpoint desejado

  try {
    const resposta = await fetch(url); // Faz a requisição HTTP

    if (!resposta.ok) {
      // Se a resposta tiver erro (404, 500 etc)
      throw new Error(`Erro na requisição: ${resposta.status}`);
    }

    const dados = await resposta.json(); // Converte a resposta em JSON
    return dados.results; // A API retorna { count, next, results } → usamos só o "results"
  } catch (erro) {
    console.error("Erro ao buscar dados:", erro);
    alert("Não foi possível carregar os dados. Verifique sua conexão.");
    return []; // Retorna lista vazia caso dê erro
  }
}

// Carrega todos os filmes assim que o código inicia
const filmes = await buscarDados("films");

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
        .then((data) => data.name || data.title) // Pega 'name' ou 'title'
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

// Função para criar e adicionar cards na tela
function adicionaCards(listaFilmes) {
  const container = document.getElementById("listaFilmes");

  listaFilmes.forEach((filme, indice) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.style.width = "18rem";
    cardDiv.style.cursor = "pointer"; // Adiciona cursor pointer para indicar que é clicável

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
    cardDiv.appendChild(cardBody);
    container.appendChild(cardDiv);

    // Evento de abrir modal
    cardDiv.addEventListener("click", async () => {
      // Preencher informações básicas do modal
      document.getElementById("modalTitulo").textContent = filme.title;
      document.getElementById("modalDiretor").textContent = filme.director;
      document.getElementById("modalProdutor").textContent = filme.producer;
      document.getElementById("modalAbertura").textContent =
        filme.opening_crawl;

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
        dataFormatada;

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

      // Abrir modal (Bootstrap)
      const modal = new bootstrap.Modal(document.getElementById("filmeModal"));

      filmsFavorites = filme;

      buttonFavorites.addEventListener("click", () => {
        document.activeElement.blur(); // remove o foco antes do modal fechar
        modal.hide();
      });

      modal.show();
    });
  });
}

console.log(filmsFavorites);

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

// Exibe todos os filmes ao carregar a página
adicionaCards(filmes);

// Selecionando input e botão
let inputBusca = document.getElementById("buscaFilme");
const botao = document.getElementById("btnBuscar");

// Função para filtrar filmes pelo texto digitado
function filtrarPorNome(lista, textoUsuario) {
  const textoEmMinusculo = textoUsuario.toLowerCase(); // Torna tudo minúsculo para busca flexível

  // Retorna todos os filmes cujo título inclui o texto digitado
  const listaFiltrada = lista.filter((filme) => {
    return filme.title.toLowerCase().includes(textoEmMinusculo);
  });

  return listaFiltrada; // Devolve a lista filtrada
}

// Evento de clique no botão de buscar
botao.addEventListener("click", function () {
  const valorInput = inputBusca.value; // Pega o texto digitado

  const container = document.getElementById("listaFilmes");

  inputBusca.value = ""; // Limpa o campo de busca

  // Filtra os filmes contendo o texto digitado
  const filmeFiltrado = filtrarPorNome(filmes, valorInput);

  container.innerHTML = ""; // Limpa os cards da tela

  adicionaCards(filmeFiltrado); // Adiciona somente os resultados filtrados
});

const buttonFavorites = document.getElementById("btn-favorite");

buttonFavorites.addEventListener("click", () => {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  // verifica se já existe
  const jaExiste = favoritos.some(f => f.title === filmsFavorites.title);

  if (jaExiste) {
    alert("Esse filme já está nos favoritos!");
    return;
  }

  // adiciona se não existir
  favoritos.push(filmsFavorites);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));

  alert("Filme salvo com sucesso!");
});
