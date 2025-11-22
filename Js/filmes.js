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

// Função para criar e adicionar cards na tela
function adicionaCards(listaFilmes) {
  const container = document.getElementById("listaFilmes"); // Div onde os cards serão exibidos

  // Percorre a lista de filmes recebida
  listaFilmes.forEach((filmes) => {
    // Cria o card
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.style.width = "18rem";

    // Parte interna do card
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    // Título do filme
    const titulo = document.createElement("p");
    titulo.textContent = `Título: ${filmes.title}`;

    // Diretor do filme
    const diretor = document.createElement("p");
    diretor.textContent = `Diretor: ${filmes.director}`;

    // Monta o card: card → cardBody → textos
    cardDiv.appendChild(cardBody);
    cardBody.appendChild(titulo);
    cardBody.appendChild(diretor);

    // Adiciona o card dentro do container
    container.appendChild(cardDiv);
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
