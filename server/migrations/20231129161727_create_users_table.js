/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable(tableName, function (table) {
        table.increments("id").primary();
        table.string("password").notNullable();
        table.string("username").notNullable();
        table.timestamps(true, true); // Adds 'created-at' and 'updated-at'
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable(tableName);
};
