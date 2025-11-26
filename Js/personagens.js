// personagens.js - JavaScript específico para a página de personagens

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
  
  // Cria o grid de detalhes
  const detailsGrid = document.createElement('div');
  detailsGrid.classList.add('personagem-details-grid');
  
  // Grupo 1: Informações Básicas
  const basicInfoGroup = document.createElement('div');
  basicInfoGroup.classList.add('personagem-detail-group');
  
  const basicTitle = document.createElement('div');
  basicTitle.classList.add('detail-group-title');
  basicTitle.textContent = 'Informações Básicas';
  basicInfoGroup.appendChild(basicTitle);
  
  const basicInfo = [
    { label: 'Altura', value: `${personagem.height} cm` },
    { label: 'Peso', value: `${personagem.mass} kg` },
    { label: 'Cor do Cabelo', value: personagem.hair_color },
    { label: 'Cor da Pele', value: personagem.skin_color },
    { label: 'Cor dos Olhos', value: personagem.eye_color },
    { label: 'Data de Nascimento', value: personagem.birth_year },
    { label: 'Gênero', value: personagem.gender }
  ];
  
  basicInfo.forEach(info => {
    const item = document.createElement('div');
    item.classList.add('personagem-detail-item');
    
    const label = document.createElement('span');
    label.classList.add('detail-label');
    label.textContent = info.label;
    
    const value = document.createElement('span');
    value.classList.add('detail-value');
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
  planetaLink.href = `../../Paginas/Planetas/planeta.html?id=${planetaId}`;
  planetaLink.textContent = 'Ver Planeta Natal';
  planetaLink.classList.add('btn', 'btn-sm', 'btn-outline-primary');
  
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
  const container = document.getElementById('listaPersonagens');
  container.innerHTML = ''; // Limpa o container antes de adicionar novos cards

  if (listaPersonagens.length === 0) {
    // Exibe estado vazio
    const emptyState = document.createElement('div');
    emptyState.classList.add('empty-state');
    
    const emptyIcon = document.createElement('div');
    emptyIcon.classList.add('empty-state-icon');
    emptyIcon.textContent = '👤';
    
    const emptyText = document.createElement('div');
    emptyText.textContent = 'Nenhum personagem encontrado';
    
    emptyState.appendChild(emptyIcon);
    emptyState.appendChild(emptyText);
    container.appendChild(emptyState);
    return;
  }

  listaPersonagens.forEach((personagem, index) => {
    // Criar card para o personagem
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('personagem-card');
    

    // Cabeçalho do card
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('personagem-card-header');
    
    const title = document.createElement('h5');
    title.classList.add('personagem-card-title');
    title.textContent = personagem.name;
    
    const subtitle = document.createElement('div');
    subtitle.classList.add('personagem-card-subtitle');
    subtitle.textContent = `Nascimento: ${personagem.birth_year}`;
    
    cardHeader.appendChild(title);
    cardHeader.appendChild(subtitle);
    
    // Corpo do card
    const cardBody = document.createElement('div');
    cardBody.classList.add('personagem-card-body');
    
    const features = document.createElement('div');
    features.classList.add('personagem-card-features');
    
    const featureList = [
      { label: 'Altura', value: `${personagem.height} cm` },
      { label: 'Peso', value: `${personagem.mass} kg` },
      { label: 'Gênero', value: personagem.gender },
      { label: 'Cor dos Olhos', value: personagem.eye_color }
    ];
    
    featureList.forEach(feature => {
      const featureDiv = document.createElement('div');
      featureDiv.classList.add('personagem-feature');
      
      const label = document.createElement('span');
      label.classList.add('feature-label');
      label.textContent = feature.label;
      
      const value = document.createElement('span');
      value.classList.add('feature-value');
      value.textContent = feature.value;
      
      featureDiv.appendChild(label);
      featureDiv.appendChild(value);
      features.appendChild(featureDiv);
    });
    
    // Rodapé do card
    const cardFooter = document.createElement('div');
    cardFooter.classList.add('personagem-card-footer');
    
    const btnVerDetalhes = document.createElement('button');
    btnVerDetalhes.classList.add('btn-personagem-detalhes');
    btnVerDetalhes.textContent = 'Ver Detalhes Completos';
    btnVerDetalhes.addEventListener('click', () => {
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