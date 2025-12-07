
// Funções de cache globais com expiração automática

const API_BASE_URL = "https://swapi.dev/api/";
const TEMPO_EXPIRACAO_CACHE = 24 * 60 * 60 * 1000; // 24 horas em milissegundos

// ============================================
// 1. FUNÇÃO PRINCIPAL DE BUSCA (SEM CACHE)
// ============================================
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

// ============================================
// 2. BUSCA COM CACHE E EXPIRAÇÃO
// ============================================
export async function buscarComCache(endpoint) {
  const chaveCache = "cache_" + endpoint;

  // 1. Tenta pegar do cache
  const cacheSalvo = localStorage.getItem(chaveCache);

  if (cacheSalvo) {
    try {
      const cacheObj = JSON.parse(cacheSalvo);

      // Verifica se é o formato antigo (sem timestamp)
      if (cacheObj && cacheObj.data && Array.isArray(cacheObj.data)) {
        // Formato antigo: converte para novo formato
        const novoCacheObj = {
          data: cacheObj.data,
          timestamp: Date.now(), // Atualiza timestamp
          endpoint: endpoint,
        };
        localStorage.setItem(chaveCache, JSON.stringify(novoCacheObj));
        return cacheObj.data;
      }

      // Formato novo com timestamp
      if (cacheObj && cacheObj.data && cacheObj.timestamp) {
        const tempoDecorrido = Date.now() - cacheObj.timestamp;

        // Verifica se o cache ainda é válido
        if (tempoDecorrido < TEMPO_EXPIRACAO_CACHE) {
          console.log(
            `✓ Cache válido para ${endpoint} (${Math.floor(
              tempoDecorrido / 1000 / 60
            )} minutos atrás)`
          );
          return cacheObj.data;
        } else {
          console.log(
            `✗ Cache expirado para ${endpoint} (${Math.floor(
              tempoDecorrido / 1000 / 60 / 60
            )} horas atrás)`
          );
          localStorage.removeItem(chaveCache); // Remove cache expirado
        }
      }
    } catch (erroParse) {
      console.error("Erro ao processar cache:", erroParse);
      localStorage.removeItem(chaveCache); // Remove cache corrompido
    }
  }

  // 2. Se não tiver cache válido → faz fetch
  console.log(`🔄 Buscando dados para: ${endpoint}`);
  const dadosFrescos = await buscarDados(endpoint);

  // 3. Salva no cache com timestamp
  const cacheObj = {
    data: dadosFrescos,
    timestamp: Date.now(),
    endpoint: endpoint,
    expiraEm: Date.now() + TEMPO_EXPIRACAO_CACHE,
  };

  localStorage.setItem(chaveCache, JSON.stringify(cacheObj));
  console.log(`💾 Cache salvo para: ${endpoint}`);

  return dadosFrescos;
}

// ============================================
// 3. BUSCA DE URLs COM CACHE E EXPIRAÇÃO
// ============================================
export async function buscarDadosDasURLsComCache(urls) {
  if (!urls || urls.length === 0) {
    return [];
  }

  try {
    const promessas = urls.map(async (url) => {
      if (!url || typeof url !== "string") return "N/A";

      // Cria chave única baseada na URL
      const chaveCache = "cache_url_" + btoa(url).replace(/[^a-zA-Z0-9]/g, "_");

      // Verifica cache
      const cacheSalvo = localStorage.getItem(chaveCache);

      if (cacheSalvo) {
        try {
          const cacheObj = JSON.parse(cacheSalvo);

          // Verifica formato e expiração
          if (cacheObj && cacheObj.data !== undefined && cacheObj.timestamp) {
            const tempoDecorrido = Date.now() - cacheObj.timestamp;

            if (tempoDecorrido < TEMPO_EXPIRACAO_CACHE) {
              return cacheObj.data; // Cache válido
            }
          }
        } catch (erro) {
          console.error("Erro ao ler cache:", erro);
        }
      }

      // Cache inválido ou não existe → busca
      try {
        const resposta = await fetch(url);
        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();
        const nomeOuTitulo = dados.name || dados.title || "Desconhecido";

        // Salva no cache
        const cacheObj = {
          data: nomeOuTitulo,
          timestamp: Date.now(),
          url: url,
          expiraEm: Date.now() + TEMPO_EXPIRACAO_CACHE,
        };

        localStorage.setItem(chaveCache, JSON.stringify(cacheObj));
        return nomeOuTitulo;
      } catch (erroFetch) {
        console.error(`Erro ao buscar ${url}:`, erroFetch);
        return "N/A";
      }
    });

    const resultados = await Promise.all(promessas);
    return resultados;
  } catch (erroGeral) {
    console.error("Erro geral ao buscar dados:", erroGeral);
    return Array(urls.length).fill("N/A");
  }
}

// ============================================
// 4. FUNÇÕES AUXILIARES DE GERENCIAMENTO
// ============================================

// Limpa caches expirados
export function limparCacheExpirado() {
  const prefixosCache = ["cache_", "cache_url_"];
  let removidos = 0;
  let validos = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);

    // Verifica se é um cache nosso
    if (prefixosCache.some((prefixo) => chave.startsWith(prefixo))) {
      try {
        const item = JSON.parse(localStorage.getItem(chave));

        // Se tiver timestamp e estiver expirado, remove
        if (item && item.timestamp) {
          if (Date.now() - item.timestamp > TEMPO_EXPIRACAO_CACHE) {
            localStorage.removeItem(chave);
            removidos++;
          } else {
            validos++;
          }
        }
      } catch (erro) {
        console.warn(`Removendo cache corrompido: ${chave}`);
        localStorage.removeItem(chave);
        removidos++;
      }
    }
  }

  if (removidos > 0) {
    console.log(
      `🧹 Cache limpo: ${removidos} expirados removidos, ${validos} válidos mantidos`
    );
  }

  return { removidos, validos };
}

// Força atualização de um endpoint específico
export async function forcarAtualizacao(endpoint) {
  const chaveCache = "cache_" + endpoint;
  localStorage.removeItem(chaveCache);
  console.log(`🔄 Forçando atualização para: ${endpoint}`);
  return await buscarComCache(endpoint);
}

// Obtém status do cache
export function obterStatusCache() {
  const status = {
    total: 0,
    validos: 0,
    expirados: 0,
    tamanhoTotal: 0,
    endpoints: [],
  };

  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);

    if (chave.startsWith("cache_") || chave.startsWith("cache_url_")) {
      status.total++;

      try {
        const item = JSON.parse(localStorage.getItem(chave));
        if (item && item.timestamp) {
          const tempoDecorrido = Date.now() - item.timestamp;
          const expirado = tempoDecorrido > TEMPO_EXPIRACAO_CACHE;

          if (expirado) {
            status.expirados++;
          } else {
            status.validos++;

            if (item.endpoint) {
              status.endpoints.push({
                endpoint: item.endpoint,
                idadeMinutos: Math.floor(tempoDecorrido / 60000),
                expiraEm: new Date(item.timestamp + TEMPO_EXPIRACAO_CACHE),
              });
            }
          }
        }

        // Calcula tamanho aproximado
        const itemString = localStorage.getItem(chave);
        status.tamanhoTotal += itemString ? itemString.length * 2 : 0;
      } catch (erro) {
        status.expirados++; // Considera corrompido como expirado
      }
    }
  }

  status.tamanhoTotalKB = (status.tamanhoTotal / 1024).toFixed(2);
  return status;
}

// Limpa todo o cache da aplicação
export function limparTodoCache() {
  let removidos = 0;

  for (let i = localStorage.length - 1; i >= 0; i--) {
    const chave = localStorage.key(i);

    if (chave.startsWith("cache_") || chave.startsWith("cache_url_")) {
      localStorage.removeItem(chave);
      removidos++;
    }
  }

  console.log(`🗑️ Cache completamente limpo: ${removidos} itens removidos`);
  return removidos;
}

// ============================================
// 5. INICIALIZAÇÃO AUTOMÁTICA
// ============================================

// Executa limpeza de cache expirado ao carregar
(function () {
  // Aguarda a página carregar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(limparCacheExpirado, 1000);
    });
  } else {
    setTimeout(limparCacheExpirado, 1000);
  }
})();
