// import {
//   createProxyMiddleware,
//   responseInterceptor,
// } from "http-proxy-middleware";
// import dotenv from "dotenv";

// dotenv.config();

// const toBool = (val, fallback = false) => {
//   if (val === undefined) return fallback;
//   return String(val).toLowerCase().trim() === "true";
// };

// function buildCommonOptions(target) {
//   return {
//     changeOrigin: toBool(process.env.FORWARD_HOST_HEADER, true),
//     secure: toBool(process.env.PROXY_SECURE, true),
//     ws: true,
//     proxyTimeout: Number(process.env.PROXY_TIMEOUT || 1500),
//     keepAlive: true,
//     keepAliveMsecs: Number(process.env.PROXY_KEEP_ALIVE_MS || 60000),
//     onError(err, req, res) {
//       const status = 502;
//       res.writeHead(status, { "Content-Type": "application/json" }),
//         res.end(
//           JSON.stringify({
//             error: "ProxyError",
//             message: err.message,
//             upstream: target,
//           })
//         );
//     },
//     onProxyReq(proxyReq, req) {
//       // Ensure original IP is visible to upstream
//       if (req.headers["x-forwarded-for"]) {
//         proxyReq.setHeader("x-forwarded-for", req.headers["x-forward-for"]);
//       }
//       proxyReq.setHeader("x-forward-proto", req.protocol || "http");
//     },
//     onProxyRes(proxyRes, req) {
//       return responseInterceptor(proxyRes, req, (body, encoding) => {
//         return body;
//       });
//     },
//   };
// }

// function createMediaProxy() {
//   const target = process.env.MEDIA_SERVER_URL;
//   if (!target) return null;

//   return createProxyMiddleware("/proxy/media", {
//     target,
//     ...buildCommonOptions(target),
//     pathRewrite: { "^/proxy/media": "" },
//     ws: true,
//   });
// }

// function createApiProxy() {
//   const target = process.env.TARGET_API_URL;
//   if (!target) {
//     console.log("TARGET_API_URL not set, skipping API proxy");
//     return null;
//   }

//   return createProxyMiddleware("/proxy/api", {
//     target,
//     ...buildCommonOptions(target),
//     pathRewrite: {
//       "^/proxy/api": "",
//     },
//   });
// }

// function createWsProxy() {
//   const target = process.env.WEBSOCKET_URL;
//   if (!target) return null;

//   return createProxyMiddleware("/proxy/ws", {
//     target,
//     ...buildCommonOptions(target),
//     pathRewrite: { "^/proxy/ws": "" },
//     ws: true,
//   });
// }

// export { createApiProxy, createMediaProxy, createWsProxy };
