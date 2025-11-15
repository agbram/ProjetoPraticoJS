// Função para buscar dados da SWAPI
async function buscarDados(endpoint) {
  const url = `https://swapi.dev/api/${endpoint}`;

  try {
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error(`Erro na requisição: ${resposta.status}`);
    }

    const dados = await resposta.json();
    return dados.results; // a SWAPI retorna um objeto com { count, next, results }
  } catch (erro) {
    console.error("Erro ao buscar dados:", erro);
    alert("Não foi possível carregar os dados. Verifique sua conexão.");
    return [];
  }
}

const filmes = await buscarDados("films");

function adicionaCards(listaFilmes) {
  const container = document.getElementById("listaFilmes");

  listaFilmes.forEach((filmes) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");
    cardDiv.style.width = "18rem";

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const titulo = document.createElement("p");
    titulo.textContent = `Título: ${filmes.title}`;
    const diretor = document.createElement("p");
    diretor.textContent = `Diretor: ${filmes.director}`;

    cardDiv.appendChild(cardBody);
    cardBody.appendChild(titulo);
    cardBody.appendChild(diretor);

    container.appendChild(cardDiv);
  });
}

adicionaCards(filmes);

// Selecionando o input pelo seu ID
let meuInput = document.getElementById("buscaFilme");
const botao = document.getElementById("btnBuscar");

botao.addEventListener("click", function () {
  // Pega o valor do input e o exibe no console
  const valorInput = meuInput.value;

  meuInput.value = "";

  console.log(valorInput);
});
