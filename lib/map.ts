/** Links do OpenStreetMap para uma coordenada: página do mapa e iframe embutido. */
export function openStreetMapUrls(latitude: number, longitude: number) {
    const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
    const mapBounds = [
        longitude - 0.008,
        latitude - 0.005,
        longitude + 0.008,
        latitude + 0.005,
    ].join(",");
    const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds}&layer=mapnik&marker=${latitude}%2C${longitude}`;

    return { mapUrl, mapEmbedUrl };
}
