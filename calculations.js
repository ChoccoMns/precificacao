export function calcularCusto(produto, quantidadeUsada, margem = 0) {
  const custoPorUnidade = produto.preco / produto.quantidade;
  const custoTotal = custoPorUnidade * quantidadeUsada;
  const precoVenda = custoTotal * (1 + (margem / 100));
  return {
    custoTotal: Number(custoTotal.toFixed(2)),
    precoVenda: Number(precoVenda.toFixed(2))
  };
}