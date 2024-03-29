import { Model } from "objection";
import { database } from "../knexfile";

Model.knex(database);

class BaseModel extends Model {
    id;
    created_at;
    updated_at;

    $beforeInsert() {
        this.created_at = new Date().now();
    }

    $beforeUpdate() {
        this.updated_at = new Date().now();
    }
}
