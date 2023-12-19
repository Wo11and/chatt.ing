/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    return knex.schema.createTable("users", function (table) {
        table.increments("id").primary();
        table.string("password").notNullable();
        table.string("username").notNullable();
        table.timestamps(true, true); // Adds 'created-at' and 'updated-at'
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    return knex.schema.dropTable("users");
}
