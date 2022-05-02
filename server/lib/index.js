"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Start the API with Express
const api_1 = require("./api");
const port = process.env.PORT || 3333;
api_1.app.listen(port, () => console.log(`API available on http://localhost:${port}`));
//# sourceMappingURL=index.js.map