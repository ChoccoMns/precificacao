import { calcularCusto } from './calculations.js';
import { carregarDados, salvarDados } from './storage.js';

// Estado inicial
let state = {
  produtos: [],
  historico: []
};

// Elementos do DOM
const elementos = {
  navBtns: document.querySelectorAll('.nav-btn'),
  pages: document.querySelectorAll('.page'),
  calcular: {
    select: document.getElementById('calculo-nome'),
    quantidade: document.getElementById('quantidade-usada'),
    margem: document.getElementById('margem'),
    resultado: document.getElementById('resultado')
  },
  adicionar: {
    nome: document.getElementById('nome'),
    quantidade: document.getElementById('quantidade'),
    preco: document.getElementById('preco')
  },
  lista: document.getElementById('lista-produtos'),
  historico: document.getElementById('historico-calculadora')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Carregar dados
  const dados = carregarDados();
  state = {
    produtos: dados.produtos.map(p => ({ ...p, id: p.id || Date.now() })),
    historico: dados.historico
  };

  // Configurar eventos
  configurarEventos();
  atualizarInterface();
});

// Configuração de eventos
function configurarEventos() {
  // Navegação
  elementos.navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      elementos.navBtns.forEach(b => b.classList.remove('active'));
      elementos.pages.forEach(p => p.classList.remove('active'));
      
      const pageId = btn.dataset.page;
      document.getElementById(pageId).classList.add('active');
      btn.classList.add('active');

      if (pageId === 'lista') atualizarListaProdutos();
      if (pageId === 'historico') atualizarHistorico();
    });
  });

  // Validação de inputs numéricos
  document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', (e) => {
      if (e.target.value < 0) e.target.value = Math.abs(e.target.value);
    });
  });

  // Adicionar produto
  document.getElementById('adicionar-btn').addEventListener('click', adicionarProduto);

  // Calcular custo
  document.getElementById('calcular-btn').addEventListener('click', calcularECadastrar);

  // Limpar histórico
  document.getElementById('limpar-historico').addEventListener('click', () => {
    state.historico = [];
    salvarDados(state.produtos, state.historico);
    atualizarHistorico();
    mostrarToast('Histórico limpo com sucesso!');
  });
}

// Lógica de negócio
function adicionarProduto() {
  const { nome, quantidade, preco } = elementos.adicionar;
  const novoProduto = {
    id: Date.now(),
    nome: nome.value.trim(),
    quantidade: parseFloat(quantidade.value),
    preco: parseFloat(preco.value)
  };

  if (!validarProduto(novoProduto)) {
    mostrarToast('Preencha todos os campos corretamente!', '#ff4444');
    return;
  }

  state.produtos.push(novoProduto);
  salvarDados(state.produtos, state.historico);
  atualizarInterface();
  limparFormularioAdicao();
  mostrarToast('Produto adicionado com sucesso!');
}

function calcularECadastrar() {
  const produtoIndex = elementos.calcular.select.selectedIndex - 1;
  const quantidadeUsada = parseFloat(elementos.calcular.quantidade.value);
  const margem = parseFloat(elementos.calcular.margem.value) || 0;

  if (!validarCalculo(produtoIndex, quantidadeUsada)) {
    mostrarToast('Selecione um produto e informe uma quantidade válida!', '#ff4444');
    return;
  }

  const produto = state.produtos[produtoIndex];
  const { custoTotal, precoVenda } = calcularCusto(produto, quantidadeUsada, margem);

  elementos.calcular.resultado.innerHTML = `
    <p>Custo Unitário: R$ ${(custoTotal / quantidadeUsada).toFixed(2)}</p>
    <p>Custo Total: R$ ${custoTotal.toFixed(2)}</p>
    <p>Preço de Venda: R$ ${precoVenda.toFixed(2)}</p>
  `;

  state.historico.push({
    data: new Date().toLocaleString(),
    produto: produto.nome,
    quantidadeUsada,
    custoTotal: custoTotal.toFixed(2),
    precoVenda: precoVenda.toFixed(2)
  });

  salvarDados(state.produtos, state.historico);
  atualizarHistorico();
}

// Atualização da interface
function atualizarInterface() {
  atualizarSelectProdutos();
  atualizarListaProdutos();
  atualizarHistorico();
}

function atualizarSelectProdutos() {
  elementos.calcular.select.innerHTML = `
    <option value="">Selecione um produto</option>
    ${state.produtos
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map(produto => `
        <option value="${produto.id}">${produto.nome}</option>
      `).join('')}
  `;
}

function atualizarListaProdutos() {
  const fragment = document.createDocumentFragment();
  
  state.produtos.forEach(produto => {
    const div = document.createElement('div');
    div.className = 'produto-item';
    div.innerHTML = `
      <span>${produto.nome}</span>
      <div>
        <span>${produto.quantidade} unid.</span>
        <span>R$ ${produto.preco.toFixed(2)}</span>
        <button class="btn-remove" data-id="${produto.id}">Remover</button>
      </div>
    `;
    fragment.appendChild(div);
  });

  elementos.lista.innerHTML = '';
  elementos.lista.appendChild(fragment);

  // Adicionar eventos de remoção
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      state.produtos = state.produtos.filter(p => p.id !== parseInt(btn.dataset.id));
      salvarDados(state.produtos, state.historico);
      atualizarInterface();
      mostrarToast('Produto removido com sucesso!', '#ff4444');
    });
  });
}

function atualizarHistorico() {
  elementos.historico.innerHTML = state.historico
    .map(entry => `
      <div class="historico-entry">
        <small>${entry.data}</small>
        <h4>${entry.produto}</h4>
        <p>Quantidade: ${entry.quantidadeUsada}</p>
        <p>Custo Total: R$ ${entry.custoTotal}</p>
        <p>Preço Venda: R$ ${entry.precoVenda}</p>
      </div>
    `).join('');
}

// Utilitários
function validarProduto(produto) {
  return (
    produto.nome.length > 0 &&
    !isNaN(produto.quantidade) &&
    produto.quantidade > 0 &&
    !isNaN(produto.preco) &&
    produto.preco > 0
  );
}

function validarCalculo(produtoIndex, quantidade) {
  return (
    produtoIndex >= 0 &&
    !isNaN(quantidade) &&
    quantidade > 0
  );
}

function limparFormularioAdicao() {
  elementos.adicionar.nome.value = '';
  elementos.adicionar.quantidade.value = '';
  elementos.adicionar.preco.value = '';
}

function mostrarToast(mensagem, cor = '#4CAF50') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensagem;
  toast.style.backgroundColor = cor;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}