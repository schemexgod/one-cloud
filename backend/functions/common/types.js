/**
 *  @typedef AlterTablePayload
 *  @property {'column' | 'constraint' | 'table'} target
 *  @property {'alter' | 'add' | 'drop'} action
 *  @property {AddColumnPayload | DropColumnPayload |AlterColumnPayload} value
 */

/**
 *  @typedef AddColumnPayload
 *  @property {string} name
 *  @property {ColumnType} type
 *  @property {boolean} not_null
 *  @property {any} default
 */

/**
 *  @typedef DropColumnPayload
 *  @property {string} name
 */

/**
 *  @typedef AlterColumnPayload
 *  @property {string} name
 *  @property {ColumnType} type
 *  @property {boolean} not_null
 *  @property {any} default
 */

/** @typedef {'int', 'date', 'timestamp', 'varchar', 'text', 'bool'} ColumnType */