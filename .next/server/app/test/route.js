const CHUNK_PUBLIC_PATH = "server/app/test/route.js";
const runtime = require("../../chunks/[turbopack]_runtime.js");
runtime.loadChunk("server/chunks/node_modules_next_dist_674979._.js");
runtime.loadChunk("server/chunks/[root of the server]__88c0e3._.js");
runtime.loadChunk("server/chunks/_9f6bdb._.js");
runtime.getOrInstantiateRuntimeModule("[project]/.next-internal/server/app/test/route/actions.js [app-rsc] (ecmascript)", CHUNK_PUBLIC_PATH);
module.exports = runtime.getOrInstantiateRuntimeModule("[project]/node_modules/next/dist/esm/build/templates/app-route.js { INNER_APP_ROUTE => \"[project]/src/app/test/route.ts [app-route] (ecmascript)\" } [app-route] (ecmascript)", CHUNK_PUBLIC_PATH).exports;
