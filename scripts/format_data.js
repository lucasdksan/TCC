const item = $input.first();
let text = item.json.output;

// Extrai qualquer JSON entre { ... }
const match = text.match(/\{[\s\S]*\}/);

if (!match) {
    return [{ error: "Nenhum JSON encontrado", raw: text }];
}

try {
    const parsed = JSON.parse(match[0]);
    return [{ output: parsed }];
} catch (e) {
    return [{ error: "Falha ao fazer parse do JSON", details: e.message, rawJSON: match[0] }];
}
