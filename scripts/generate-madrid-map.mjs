import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(
  root,
  "Json",
  "Majadahonda",
  "SHP_ETRS89",
  "recintos_municipales_inspire_peninbal_etrs89"
);
const shpPath = path.join(sourceDir, "recintos_municipales_inspire_peninbal_etrs89.shp");
const dbfPath = path.join(sourceDir, "recintos_municipales_inspire_peninbal_etrs89.dbf");
const outputPath = path.join(root, "config", "geo", "madrid-map.json");

function readDbf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const recordCount = buffer.readUInt32LE(4);
  const headerLength = buffer.readUInt16LE(8);
  const recordLength = buffer.readUInt16LE(10);
  const fields = [];

  for (let offset = 32; offset < headerLength - 1; offset += 32) {
    const name = buffer
      .slice(offset, offset + 11)
      .toString("utf8")
      .replace(/\u0000.*$/, "")
      .trim();

    fields.push({
      name,
      length: buffer[offset + 16]
    });
  }

  const rows = [];

  for (let index = 0; index < recordCount; index += 1) {
    let offset = headerLength + index * recordLength;
    const deleted = String.fromCharCode(buffer[offset]) === "*";
    offset += 1;

    const row = { __deleted: deleted };
    for (const field of fields) {
      row[field.name] = buffer
        .slice(offset, offset + field.length)
        .toString("utf8")
        .trim();
      offset += field.length;
    }
    rows.push(row);
  }

  return rows;
}

function readShp(filePath) {
  const buffer = fs.readFileSync(filePath);
  const shapes = [];
  let offset = 100;

  while (offset < buffer.length) {
    const recordNumber = buffer.readInt32BE(offset);
    const contentLengthBytes = buffer.readInt32BE(offset + 4) * 2;
    offset += 8;

    const shapeType = buffer.readInt32LE(offset);
    if (shapeType !== 5) {
      shapes.push({ recordNumber, rings: [] });
      offset += contentLengthBytes;
      continue;
    }

    const numParts = buffer.readInt32LE(offset + 36);
    const numPoints = buffer.readInt32LE(offset + 40);
    const partsOffset = offset + 44;
    const pointsOffset = partsOffset + numParts * 4;

    const parts = [];
    for (let part = 0; part < numParts; part += 1) {
      parts.push(buffer.readInt32LE(partsOffset + part * 4));
    }

    const points = [];
    for (let point = 0; point < numPoints; point += 1) {
      points.push([
        buffer.readDoubleLE(pointsOffset + point * 16),
        buffer.readDoubleLE(pointsOffset + point * 16 + 8)
      ]);
    }

    const rings = parts.map((start, index) => {
      const end = parts[index + 1] ?? points.length;
      return points.slice(start, end);
    });

    shapes.push({ recordNumber, rings });
    offset += contentLengthBytes;
  }

  return shapes;
}

function simplifyRing(ring, maxPoints = 90) {
  if (ring.length <= maxPoints) {
    return ring;
  }

  const step = Math.ceil(ring.length / maxPoints);
  const simplified = ring.filter((_, index) => index % step === 0);
  const first = ring[0];
  const last = simplified[simplified.length - 1];

  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    simplified.push(first);
  }

  return simplified;
}

function boundsOf(features) {
  const bounds = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY
  };

  for (const feature of features) {
    for (const ring of feature.rings) {
      for (const [x, y] of ring) {
        bounds.minX = Math.min(bounds.minX, x);
        bounds.maxX = Math.max(bounds.maxX, x);
        bounds.minY = Math.min(bounds.minY, y);
        bounds.maxY = Math.max(bounds.maxY, y);
      }
    }
  }

  return bounds;
}

function projectPoint([x, y], bounds, width, height, padding) {
  const scale = Math.min(
    (width - padding * 2) / (bounds.maxX - bounds.minX),
    (height - padding * 2) / (bounds.maxY - bounds.minY)
  );
  const projectedWidth = (bounds.maxX - bounds.minX) * scale;
  const projectedHeight = (bounds.maxY - bounds.minY) * scale;
  const offsetX = (width - projectedWidth) / 2;
  const offsetY = (height - projectedHeight) / 2;

  return [
    offsetX + (x - bounds.minX) * scale,
    height - (offsetY + (y - bounds.minY) * scale)
  ];
}

function ringToPath(ring, bounds, width, height, padding) {
  return ring
    .map((point, index) => {
      const [x, y] = projectPoint(point, bounds, width, height, padding);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ")
    .concat(" Z");
}

const rows = readDbf(dbfPath);
const shapes = readShp(shpPath);
const madridFeatures = rows
  .map((row, index) => ({
    index,
    name: row.NAMEUNIT,
    natCode: row.NATCODE,
    nuts3: row.CODNUT3,
    rings: shapes[index]?.rings ?? []
  }))
  .filter((feature) => !rows[feature.index].__deleted && feature.nuts3 === "ES300");

const bounds = boundsOf(madridFeatures);
const width = 900;
const height = 620;
const padding = 28;

const municipalities = madridFeatures.map((feature) => ({
  name: feature.name,
  natCode: feature.natCode,
  isSelected: feature.name === "Majadahonda",
  path: feature.rings
    .map((ring) => ringToPath(simplifyRing(ring), bounds, width, height, padding))
    .join(" ")
}));

const selected = municipalities.find((feature) => feature.isSelected);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `${JSON.stringify(
    {
      source:
        "IGN/CNIG BDDAE recintos_municipales_inspire_peninbal_etrs89.shp, ETRS89 EPSG:4258",
      viewBox: `0 0 ${width} ${height}`,
      selectedMunicipality: selected?.name ?? "Majadahonda",
      bounds,
      municipalities
    },
    null,
    2
  )}\n`
);

console.log(`Generated ${outputPath}`);
console.log(`Municipalities: ${municipalities.length}`);
console.log(`Selected: ${selected?.name ?? "not found"}`);
