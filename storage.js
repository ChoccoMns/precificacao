export function carregarDados() {
  try {
    return {
      produtos: JSON.parse(localStorage.getItem('produtos')) || [],
      historico: JSON.parse(localStorage.getItem('historico')) || []
    };
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return { produtos: [], historico: [] };
  }
}

export function salvarDados(produtos, historico) {
  try {
    localStorage.setItem('produtos', JSON.stringify(produtos));
    localStorage.setItem('historico', JSON.stringify(historico));
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
  }
}