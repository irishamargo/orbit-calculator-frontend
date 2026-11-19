import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import axios from "axios";
import { generateApi } from "swagger-typescript-api";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const swaggerUrl = process.env.SWAGGER_URL || "http://localhost:3000/api-json";
const snapshotPath = path.join(projectRoot, "src/api/openapi.snapshot.json");
const outputPath = path.join(projectRoot, "src/api/generated");
const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
const generatorOptions = {
  output: outputPath,
  fileName: "Api.ts",
  httpClientType: "axios",
  extractRequestBody: true,
  extractRequestParams: true,
  extractResponseBody: true,
  typeOnlyImports: true,
};

await mkdir(outputPath, { recursive: true });

try {
  const response = await axios.get(swaggerUrl, { timeout: 2500 });
  const liveSpec = response.data;
  const paths = Object.fromEntries(
    Object.entries(snapshot.paths).map(([pathName, snapshotPathItem]) => {
      const livePathItem = liveSpec.paths?.[pathName] || {};
      const pathItem = { ...snapshotPathItem };
      for (const [method, snapshotOperation] of Object.entries(snapshotPathItem)) {
        if (livePathItem[method]) {
          pathItem[method] = {
            ...livePathItem[method],
            ...snapshotOperation,
          };
        }
      }
      return [pathName, pathItem];
    }),
  );
  await generateApi({ spec: { ...snapshot, info: liveSpec.info || snapshot.info, paths }, ...generatorOptions });
  console.log(`Клиент сгенерирован по ${swaggerUrl} с контрактами проекта`);
} catch (error) {
  console.warn(`Swagger API недоступен (${error.message}); использую локальный снимок.`);
  await generateApi({ input: snapshotPath, ...generatorOptions });
  console.log(`Клиент сгенерирован по ${path.relative(projectRoot, snapshotPath)}`);
}
