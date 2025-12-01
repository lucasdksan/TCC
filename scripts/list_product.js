const produtos = Object.values($input.first().json.produtos);

return produtos.map(p => ({ json: p }));