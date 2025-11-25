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
function exibirModalVeiculo(veiculo) {
  // Atualiza o título do modal
  document.getElementById('modalVeiculoLabel').textContent = veiculo.name;
  
  const modalBody = document.getElementById('modalVeiculoBody');
  modalBody.innerHTML = ''; // Limpa o conteúdo anterior
  
  // Cria a lista de informações
  const informacoes = [
    `Modelo: ${veiculo.model}`,
    `Fabricante: ${veiculo.manufacturer}`,
    `Custo: ${veiculo.cost_in_credits} créditos`,
    `Comprimento: ${veiculo.length} m`,
    `Velocidade Máxima: ${veiculo.max_atmosphering_speed} km/h`,
    `Tripulação: ${veiculo.crew}`,
    `Passageiros: ${veiculo.passengers}`,
    `Capacidade de Carga: ${veiculo.cargo_capacity} kg`,
    `Consumíveis: ${veiculo.consumables}`,
    `Classe: ${veiculo.vehicle_class}`
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
  
  // Adiciona a lista ao modal
  modalBody.appendChild(lista);
  
  // Exibe o modal
  const modal = new bootstrap.Modal(document.getElementById('modalVeiculo'));
  modal.show();
}

// Função para criar e adicionar cards na tela (agora simplificada)
function adicionaCards(listaVeiculos) {
  const container = document.getElementById('listaVeiculos');
  container.innerHTML = ''; // Limpa o container antes de adicionar novos cards

  listaVeiculos.forEach((veiculo) => {
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
    name.textContent = veiculo.name;

    const btnVerDetalhes = document.createElement('button');
    btnVerDetalhes.classList.add('btn', 'btn-primary', 'mt-auto');
    btnVerDetalhes.textContent = 'Ver Detalhes';
    btnVerDetalhes.addEventListener('click', () => {
      exibirModalVeiculo(veiculo);
    });

    // Montar a estrutura
    cardBody.appendChild(name);
    cardBody.appendChild(btnVerDetalhes);
    cardDiv.appendChild(cardBody);
    colDiv.appendChild(cardDiv);
    container.appendChild(colDiv);
  });
}

// Função para filtrar veículos
function filtrarPorNome(lista, textoUsuario) {
  const textoEmMinusculo = textoUsuario.toLowerCase();

  const listaFiltrada = lista.filter((veiculo) => {
    return veiculo.name.toLowerCase().includes(textoEmMinusculo);
  });

  return listaFiltrada;
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', async function () {
  try {
    // Carrega todos os veículos
    const veiculos = await buscarDados('vehicles');

    // Exibe os veículos na tela
    adicionaCards(veiculos);

    // Selecionando input e botão
    const inputBusca = document.getElementById('buscaVeiculos');
    const botao = document.getElementById('btnBuscar');

    // Evento de clique no botão de buscar
    botao.addEventListener('click', function () {
      const valorInput = inputBusca.value.trim();

      if (valorInput === '') {
        // Se estiver vazio, mostra todos os veículos
        adicionaCards(veiculos);
      } else {
        // Filtra os veículos contendo o texto digitado
        const veiculosFiltrados = filtrarPorNome(veiculos, valorInput);
        adicionaCards(veiculosFiltrados);
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