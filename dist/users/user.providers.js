"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_constants_1 = require("../constants/user.constants");
const user_entity_1 = require("./user.entity");
const database_constants_1 = require("../constants/database.constants");
exports.userProviders = [
    {
        provide: user_constants_1.UserConstants.USER_REPOSITORY,
        useFactory: (connection) => connection.getRepository(user_entity_1.User),
        inject: [database_constants_1.DatabaseConstants.DATABASE_CONNECTION],
    },
];
//# sourceMappingURL=user.providers.js.map