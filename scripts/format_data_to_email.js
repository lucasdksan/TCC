const item = $input.first();
const text = `
Prezado(a) Lojista,

Após uma análise minuciosa dos seus dados, chegamos aos seguintes resultados:

${item.json.output.diagnostico.resumo_executivo}

Produto com melhores resultados: ${item.json.output.diagnostico.produto_campeao}.

Produto com mais gargalo: ${item.json.output.diagnostico.produto_gargalo}.
`;

return { text: text };