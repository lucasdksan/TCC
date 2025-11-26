
const centsToReal = (val) => (val || 0) / 100;
const buildStatsHtml = (stats) => {
    const esc = (s) => String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const produtos = stats.top_produtos || [];
    let html = '<table border="1" cellpadding="4" cellspacing="0">';
    html += '<tr><th colspan="2">Período</th></tr>';
    html += `<tr><td>Início</td><td>${esc(stats.periodo.inicio)}</td></tr>`;
    html += `<tr><td>Fim</td><td>${esc(stats.periodo.fim)}</td></tr>`;
    html += `<tr><td>Total dias</td><td>${esc(stats.periodo.total_dias)}</td></tr>`;

    html += '<tr><th colspan="2">KPIs</th></tr>';
    for (const k of ['total_pedidos','total_cancelados','total_aprovados','taxa_cancelamento_percentual','receita_bruta_total','ticket_medio']) {
        html += `<tr><td>${esc(k)}</td><td>${esc(stats.kpis[k])}</td></tr>`;
    }

    html += '<tr><th colspan="2">Pagamentos</th></tr>';
    html += '<tr><td colspan="2">';
    html += '<table border="1" cellpadding="3" cellspacing="0">';
    html += '<tr><th>Método</th><th>Qtd</th><th>Cancelados</th><th>Taxa Erro</th></tr>';
    for (const p in stats.pagamentos) {
        const pag = stats.pagamentos[p];
        html += `<tr><td>${esc(p)}</td><td>${esc(pag.qtd)}</td><td>${esc(pag.cancelados)}</td><td>${esc(pag.taxa_erro)}</td></tr>`;
    }
    html += '</table>';
    html += '</td></tr>';

    html += '<tr><th colspan="2">Produtos (Top)</th></tr>';
    html += '<tr><td colspan="2">';
    html += '<table border="1" cellpadding="3" cellspacing="0">';
    html += '<tr><th>Nome</th><th>Qtd Vendida</th><th>Receita Gerada</th><th>Pedidos Envolvidos</th></tr>';
    for (const prod of produtos) {
        const receita = (typeof prod.receita_gerada === 'number') ? prod.receita_gerada.toFixed(2) : esc(prod.receita_gerada);
        html += `<tr><td>${esc(prod.nome)}</td><td>${esc(prod.qtd_vendida)}</td><td>${esc(receita)}</td><td>${esc(prod.pedidos_envolvidos)}</td></tr>`;
    }
    html += '</table>';
    html += '</td></tr>';

    html += '</table>';
    return html;
};

let result = [];

for (const item of $input.all()) {
    let { list } = item.json;
    let stats = {
        periodo: {
            inicio: null,
            fim: null,
            total_dias: 0
        },
        kpis: {
            total_pedidos: 0,
            total_cancelados: 0,
            total_aprovados: 0,
            taxa_cancelamento_percentual: 0,
            receita_bruta_total: 0, 
            ticket_medio: 0
        },
        pagamentos: {}, 
        produtos: {},   
        alertas: [],
        html_table: "",
        data_atual: new Date().toISOString().split('T')[0],
    };

    for (const order of list) {
        stats.kpis.total_pedidos++;
        
        const dataPedido = new Date(order.creationDate);
        if (!stats.periodo.inicio || dataPedido < stats.periodo.inicio) stats.periodo.inicio = dataPedido;
        if (!stats.periodo.fim || dataPedido > stats.periodo.fim) stats.periodo.fim = dataPedido;
        
        const isCanceled = order.status === 'canceled' || order.statusDescription === 'Cancelado';

        if (isCanceled) {
            stats.kpis.total_cancelados++;
        } else {
            stats.kpis.total_aprovados++;
            
            stats.kpis.receita_bruta_total += centsToReal(order.totalValue);
        }

        
        const metodoPagamento = order.paymentNames || "Desconhecido";
        if (!stats.pagamentos[metodoPagamento]) {
            stats.pagamentos[metodoPagamento] = { qtd: 0, cancelados: 0, taxa_erro: 0 };
        }
        stats.pagamentos[metodoPagamento].qtd++;
        if (isCanceled) stats.pagamentos[metodoPagamento].cancelados++;

        
        if (order.items && Array.isArray(order.items)) {
            for (const item of order.items) {
                const nomeProd = item.description; 

                if (!stats.produtos[nomeProd]) {
                    stats.produtos[nomeProd] = {
                        nome: nomeProd,
                        productID: item.productId,
                        qtd_vendida: 0,
                        receita_gerada: 0,
                        pedidos_envolvidos: 0,
                        data_da_venda: order.creationDate
                    };
                }

                stats.produtos[nomeProd].qtd_vendida += item.quantity;
                stats.produtos[nomeProd].receita_gerada += centsToReal(item.sellingPrice * item.quantity);
                stats.produtos[nomeProd].pedidos_envolvidos++;
            }
        }
    }

    if (stats.periodo.inicio && stats.periodo.fim) {
        const diffTime = Math.abs(stats.periodo.fim - stats.periodo.inicio);
        stats.periodo.total_dias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        stats.periodo.inicio = stats.periodo.inicio.toISOString().split('T')[0];
        stats.periodo.fim = stats.periodo.fim.toISOString().split('T')[0];
    }

    stats.kpis.taxa_cancelamento_percentual = ((stats.kpis.total_cancelados / stats.kpis.total_pedidos) * 100).toFixed(2) + '%';

    if (stats.kpis.total_aprovados > 0) {
        stats.kpis.ticket_medio = (stats.kpis.receita_bruta_total / stats.kpis.total_aprovados).toFixed(2);
    }
    
    for (const p in stats.pagamentos) {
        const pag = stats.pagamentos[p];
        pag.taxa_erro = ((pag.cancelados / pag.qtd) * 100).toFixed(1) + '%';
    }
    
    const listaProdutos = Object.values(stats.produtos);
    
    listaProdutos.sort((a, b) => b.receita_gerada - a.receita_gerada);
    stats.top_produtos = listaProdutos.slice(0, 5); 
    delete stats.produtos; 
    
    stats.kpis.receita_bruta_total = stats.kpis.receita_bruta_total.toFixed(2);

    try {
        stats.html_table = buildStatsHtml(stats);
    } catch (e) {
        stats.html_table = '';
    }

    result.push({ json: stats });
}

return result[0];