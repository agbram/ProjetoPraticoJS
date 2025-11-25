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

// Função para preencher e exibir o modal
function exibirModalPersonagem(personagem) {
  // Atualiza o título do modal
  document.getElementById('modalPersonagemLabel').textContent = personagem.name;
  
  const modalBody = document.getElementById('modalPersonagemBody');
  modalBody.innerHTML = ''; // Limpa o conteúdo anterior
  
  // Cria a lista de informações
  const informacoes = [
    `Altura: ${personagem.height} cm`,
    `Peso: ${personagem.mass} kg`,
    `Cor do cabelo: ${personagem.hair_color}`,
    `Cor da pele: ${personagem.skin_color}`,
    `Cor dos olhos: ${personagem.eye_color}`,
    `Data de nascimento: ${personagem.birth_year}`,
    `Gênero: ${personagem.gender}`
  ];
  
  // Cria elementos para exibir as informações
  const lista = document.createElement('ul');
  lista.classList.add('list-group');
  
  informacoes.forEach(info => {
    const item = document.createElement('li');
    item.classList.add('list-group-item');
    item.textContent = info;
    lista.appendChild(item);
  });
  
  // Adiciona o link para o planeta natal
  const planetaItem = document.createElement('li');
  planetaItem.classList.add('list-group-item');
  
  const planetaId = personagem.homeworld.split('/').filter(Boolean).pop();
  const planetaLink = document.createElement('a');
  planetaLink.href = `../../Paginas/Planetas/planeta.html?id=${planetaId}`;
  planetaLink.textContent = 'Ver Planeta Natal';
  planetaLink.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'ms-2');
  
  planetaItem.appendChild(document.createTextNode('Planeta Natal: '));
  planetaItem.appendChild(planetaLink);
  lista.appendChild(planetaItem);
  
  // Adiciona a lista ao modal
  modalBody.appendChild(lista);
  
  // Exibe o modal
  const modal = new bootstrap.Modal(document.getElementById('modalPersonagem'));
  modal.show();
}

// Função para criar e adicionar cards na tela (agora simplificada)
function adicionaCards(listaPersonagens) {
  const container = document.getElementById('listaPersonagens');
  container.innerHTML = ''; // Limpa o container antes de adicionar novos cards

  listaPersonagens.forEach((personagem) => {
    // Criar coluna para o card
    const colDiv = document.createElement('div');
    colDiv.classList.add('col-md-4', 'mb-4');

    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card', 'h-100');
    cardDiv.style.width = '100%';

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body', 'd-flex', 'flex-column');

    const name = document.createElement('h5');
    name.classList.add('card-title');
    name.textContent = personagem.name;

    const btnVerDetalhes = document.createElement('button');
    btnVerDetalhes.classList.add('btn', 'btn-primary', 'mt-auto');
    btnVerDetalhes.textContent = 'Ver Detalhes';
    btnVerDetalhes.addEventListener('click', () => {
      exibirModalPersonagem(personagem);
    });

    // Montar a estrutura
    cardBody.appendChild(name);
    cardBody.appendChild(btnVerDetalhes);
    cardDiv.appendChild(cardBody);
    colDiv.appendChild(cardDiv);
    container.appendChild(colDiv);
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
document.addEventListener('DOMContentLoaded', async function () {
  try {
    // Carrega todos os personagens
    const personagens = await buscarDados('people');

    // Exibe os personagens na tela
    adicionaCards(personagens);

    // Selecionando input e botão
    const inputBusca = document.getElementById('buscaPersonagem');
    const botao = document.getElementById('btnBuscar');

    // Evento de clique no botão de buscar
    botao.addEventListener('click', function () {
      const valorInput = inputBusca.value.trim();

      if (valorInput === '') {
        // Se estiver vazio, mostra todos os personagens
        adicionaCards(personagens);
      } else {
        // Filtra os personagens contendo o texto digitado
        const personagensFiltrados = filtrarPorNome(personagens, valorInput);
        adicionaCards(personagensFiltrados);
      }
    });

    // Evento para buscar ao pressionar Enter
    inputBusca.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        botao.click();
      }
    });
  } catch (error) {
    console.error('Erro ao inicializar a página:', error);
  }
});