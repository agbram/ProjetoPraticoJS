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
  
  // Cria o grid de detalhes
  const detailsGrid = document.createElement('div');
  detailsGrid.classList.add('veiculo-details-grid');
  
  // Grupo 1: Informações Básicas
  const basicInfoGroup = document.createElement('div');
  basicInfoGroup.classList.add('veiculo-detail-group');
  
  const basicTitle = document.createElement('div');
  basicTitle.classList.add('detail-group-title');
  basicTitle.textContent = 'Informações Básicas';
  basicInfoGroup.appendChild(basicTitle);
  
  const basicInfo = [
    { label: 'Modelo', value: veiculo.model },
    { label: 'Fabricante', value: veiculo.manufacturer },
    { label: 'Classe', value: veiculo.vehicle_class },
    { label: 'Custo', value: `${veiculo.cost_in_credits} créditos` }
  ];
  
  basicInfo.forEach(info => {
    const item = document.createElement('div');
    item.classList.add('veiculo-detail-item');
    
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
  
  // Grupo 2: Especificações Técnicas
  const specsGroup = document.createElement('div');
  specsGroup.classList.add('veiculo-detail-group');
  
  const specsTitle = document.createElement('div');
  specsTitle.classList.add('detail-group-title');
  specsTitle.textContent = 'Especificações Técnicas';
  specsGroup.appendChild(specsTitle);
  
  const specsInfo = [
    { label: 'Comprimento', value: `${veiculo.length} metros` },
    { label: 'Velocidade Máxima', value: `${veiculo.max_atmosphering_speed} km/h` },
    { label: 'Capacidade de Carga', value: `${veiculo.cargo_capacity} kg` },
    { label: 'Consumíveis', value: veiculo.consumables }
  ];
  
  specsInfo.forEach(info => {
    const item = document.createElement('div');
    item.classList.add('veiculo-detail-item');
    
    const label = document.createElement('span');
    label.classList.add('detail-label');
    label.textContent = info.label;
    
    const value = document.createElement('span');
    value.classList.add('detail-value');
    value.textContent = info.value;
    
    item.appendChild(label);
    item.appendChild(value);
    specsGroup.appendChild(item);
  });
  
  // Grupo 3: Tripulação e Passageiros
  const crewGroup = document.createElement('div');
  crewGroup.classList.add('veiculo-detail-group');
  
  const crewTitle = document.createElement('div');
  crewTitle.classList.add('detail-group-title');
  crewTitle.textContent = 'Capacidade';
  crewGroup.appendChild(crewTitle);
  
  const crewInfo = [
    { label: 'Tripulação', value: veiculo.crew },
    { label: 'Passageiros', value: veiculo.passengers }
  ];
  
  crewInfo.forEach(info => {
    const item = document.createElement('div');
    item.classList.add('veiculo-detail-item');
    
    const label = document.createElement('span');
    label.classList.add('detail-label');
    label.textContent = info.label;
    
    const value = document.createElement('span');
    value.classList.add('detail-value');
    value.textContent = info.value;
    
    item.appendChild(label);
    item.appendChild(value);
    crewGroup.appendChild(item);
  });
  
  // Adiciona os grupos ao grid
  detailsGrid.appendChild(basicInfoGroup);
  detailsGrid.appendChild(specsGroup);
  detailsGrid.appendChild(crewGroup);
  
  // Adiciona destaque para especificações
  const specsHighlight = document.createElement('div');
  specsHighlight.classList.add('veiculo-specs-highlight');
  
  const highlights = [
    { icon: '⚡', text: `Velocidade máxima de ${veiculo.max_atmosphering_speed} km/h` },
    { icon: '👥', text: `Transporta ${veiculo.passengers} passageiros` },
    { icon: '📦', text: `Capacidade de carga de ${veiculo.cargo_capacity} kg` }
  ];
  
  highlights.forEach(highlight => {
    const spec = document.createElement('div');
    spec.classList.add('spec-highlight');
    
    const icon = document.createElement('span');
    icon.classList.add('spec-icon');
    icon.textContent = highlight.icon;
    
    const text = document.createElement('span');
    text.classList.add('spec-text');
    text.textContent = highlight.text;
    
    spec.appendChild(icon);
    spec.appendChild(text);
    specsHighlight.appendChild(spec);
  });
  
  // Monta o modal
  modalBody.appendChild(detailsGrid);
  modalBody.appendChild(specsHighlight);
  
  // Exibe o modal
  const modal = new bootstrap.Modal(document.getElementById('modalVeiculo'));
  modal.show();
}

// Função para criar e adicionar cards na tela
function adicionaCards(listaVeiculos) {
  const container = document.getElementById('listaVeiculos');
  container.innerHTML = ''; // Limpa o container antes de adicionar novos cards

  if (listaVeiculos.length === 0) {
    // Exibe estado vazio
    const emptyState = document.createElement('div');
    emptyState.classList.add('empty-state');
    
    const emptyIcon = document.createElement('div');
    emptyIcon.classList.add('empty-state-icon');
    emptyIcon.textContent = '🚗';
    
    const emptyText = document.createElement('div');
    emptyText.textContent = 'Nenhum veículo encontrado';
    
    emptyState.appendChild(emptyIcon);
    emptyState.appendChild(emptyText);
    container.appendChild(emptyState);
    return;
  }

  listaVeiculos.forEach((veiculo, index) => {
    // Criar card para o veículo
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('veiculo-card');
    

    // Cabeçalho do card
    const cardHeader = document.createElement('div');
    cardHeader.classList.add('veiculo-card-header');
    
    const title = document.createElement('h5');
    title.classList.add('veiculo-card-title');
    title.textContent = veiculo.name;
    
    const subtitle = document.createElement('div');
    subtitle.classList.add('veiculo-card-subtitle');
    subtitle.textContent = veiculo.model;
    
    const badge = document.createElement('span');
    badge.classList.add('veiculo-badge');
    badge.textContent = veiculo.vehicle_class;
    
    cardHeader.appendChild(title);
    cardHeader.appendChild(subtitle);
    cardHeader.appendChild(badge);
    
    // Corpo do card
    const cardBody = document.createElement('div');
    cardBody.classList.add('veiculo-card-body');
    
    const features = document.createElement('div');
    features.classList.add('veiculo-card-features');
    
    const featureList = [
      { label: 'Fabricante', value: veiculo.manufacturer },
      { label: 'Custo', value: `${veiculo.cost_in_credits} créditos` },
      { label: 'Velocidade', value: `${veiculo.max_atmosphering_speed} km/h` },
      { label: 'Tripulação', value: veiculo.crew }
    ];
    
    featureList.forEach(feature => {
      const featureDiv = document.createElement('div');
      featureDiv.classList.add('veiculo-feature');
      
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
    cardFooter.classList.add('veiculo-card-footer');
    
    const btnVerDetalhes = document.createElement('button');
    btnVerDetalhes.classList.add('btn-veiculo-detalhes');
    btnVerDetalhes.textContent = 'Ver Detalhes Completos';
    btnVerDetalhes.addEventListener('click', () => {
      exibirModalVeiculo(veiculo);
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