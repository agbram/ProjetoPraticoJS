// Js/apiCache.js
// Funções de cache globais para serem importadas em todos os arquivos

const API_BASE_URL = "https://swapi.dev/api/";

// Função assíncrona para buscar dados da SWAPI
export async function buscarDados(endpoint) {
  const url = API_BASE_URL + endpoint;

  try {
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error("Erro na requisição: " + resposta.status);
    }

    const dados = await resposta.json();
    return dados.results; // ← Retorna apenas o array results
  } catch (erro) {
    console.error("Erro ao buscar dados:", erro);
    alert("Não foi possível carregar os dados. Verifique sua conexão.");
    return [];
  }
}

export async function buscarComCache(endpoint) {
  const chave = "cache_" + endpoint;

  // 1. Tenta pegar do cache
  const cache = localStorage.getItem(chave);

  if (cache) {
    const dadosCache = JSON.parse(cache);
    // Se o cache for um objeto com propriedade data (formato antigo)
    if (dadosCache && dadosCache.data && Array.isArray(dadosCache.data)) {
      return dadosCache.data; // Retorna apenas o array data
    }
    // Se já for um array, retorna diretamente
    if (Array.isArray(dadosCache)) {
      return dadosCache;
    }
    // Caso contrário, retorna array vazio
    console.warn("Formato de cache inesperado para", endpoint, dadosCache);
    return [];
  }

  // 2. Se não tiver cache → faz fetch normalmente
  const dados = await buscarDados(endpoint);

  // 3. Salva no cache (apenas o array, sem objeto wrapper)
  localStorage.setItem(chave, JSON.stringify(dados));

  return dados;
}

// Função para buscar dados de URLs com cache
export async function buscarDadosDasURLsComCache(urls) {
  if (!urls || urls.length === 0) {
    return [];
  }

  try {
    const promessas = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const chaveCache = "cache_url_" + url.split("/").filter(Boolean).pop();
      const cacheSalvo = localStorage.getItem(chaveCache);

      if (cacheSalvo) {
        const resultadoCache = JSON.parse(cacheSalvo);
        promessas.push(Promise.resolve(resultadoCache));
      } else {
        const promessa = fetch(url)
          .then(function (resposta) {
            if (!resposta.ok) {
              throw new Error("Erro na requisição");
            }
            return resposta.json();
          })
          .then(function (dados) {
            const nomeOuTitulo = dados.name || dados.title;
            localStorage.setItem(chaveCache, JSON.stringify(nomeOuTitulo));
            return nomeOuTitulo;
          })
          .catch(function (erro) {
            console.error("Erro ao buscar " + url + ":", erro);
            return "N/A";
          });

        promessas.push(promessa);
      }
    }

    const resultados = await Promise.all(promessas);
    return resultados;
  } catch (erro) {
    console.error("Erro geral ao buscar dados:", erro);
    return [];
  }
}
