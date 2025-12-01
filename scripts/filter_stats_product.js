const infoProduct = [];

for (const item of $input.all()) {
    infoProduct.push({
        id: item.json.Id,
        productId: item.json.ProductId,
        name: item.json.Name,
        height: item.json.Height,
        realHeight: item.json.RealHeight,
        width: item.json.Width,
        realWidth: item.json.RealWidth,
        length: item.json.Length,
        realLength: item.json.RealLength,
        weightKg: item.json.WeightKg,
        realWeightKg: item.json.RealWeightKg,
    });
}

const result = {
    productID: infoProduct[0].productId,
    data: infoProduct.map((p) => ({
        id: p.id,
        name: p.name,
        height: p.height,
        realHeight: p.realHeight,
        width: p.width,
        realWidth: p.realWidth,
        length: p.length,
        realLength: p.realLength,
        weightKg: p.weightKg,
        realWeightKg: p.realWeightKg,
    })),
}

return result;