import { Model } from "objection";
import { database } from "../knexconfig";

Model.knex(database);

class BaseModel extends Model {
	id;
	created_at;
	updated_at;

	$afterInsert() {
		this.created_at = new Date().now();
	}

	$beforeUpdate() {
		this.updated_at = new Date().now();
	}
}
