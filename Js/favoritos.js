const container = document.getElementById("listaFavoritos");

// pega do localStorage
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

// caso não tenha nada salvo
if (favoritos.length === 0) {
  container.innerHTML = "<p>Nenhum favorito salvo.</p>";
}

// função para montar cards
function adicionaCardsFavoritos(lista) {
  container.innerHTML = "";

  lista.forEach((filme, indice) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.style.width = "18rem";

    const body = document.createElement("div");
    body.classList.add("card-body");

    const titulo = document.createElement("h5");
    titulo.textContent = filme.title;

    const diretor = document.createElement("p");
    diretor.textContent = `Diretor: ${filme.director}`;

    // botão remover
    const botaoRemover = document.createElement("button");
    botaoRemover.textContent = "Remover";
    botaoRemover.classList.add("btn", "btn-danger", "mt-2");

    botaoRemover.addEventListener("click", () => {
      removerFavorito(indice);
    });

    body.appendChild(titulo);
    body.appendChild(diretor);
    body.appendChild(botaoRemover);

    card.appendChild(body);
    container.appendChild(card);
  });
}

adicionaCardsFavoritos(favoritos);

// função que remove e atualiza a tela
function removerFavorito(indice) {
  favoritos.splice(indice, 1);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  adicionaCardsFavoritos(favoritos);
}
