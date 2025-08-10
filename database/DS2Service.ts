import { DataSource, EntityManager, ObjectType } from "typeorm";
import createTypeORMConnection from "./DataSourceFactory";
import {  tenantStorage} from "../middleware/async-local-storage/async-local-storage";

export class DS2Service {
    private datasource: Promise<DataSource>;
    private transactionManager: EntityManager | null = null;
    private database: string;
    private schema: string;
  
   public constructor(database?: string, schema?: string) {
      this.setDatabase(database ?? '');
      this.setSchema(schema ?? '');
    }
  
    setDatabase(database?: string) {
      this.database = database ?? '';
    }
  
    getDatabase() {
      return this.database;
    }
  
    setSchema(schema?: string) {
      this.schema = schema ?? '';
    }
  
    getSchema() {
      return this.schema;
    }
  
    initDatabase() {
      const databaseName = this.getDatabase();
      let datasource: Promise<DataSource>;
  
      if (databaseName) {
        datasource = createTypeORMConnection(this.getDatabase(), this.getSchema());
      } else {
        const { database, schema } = tenantStorage.getStore()?.get('tenant') ?? {};
        this.setDatabase(database);
        this.setSchema(schema);
        datasource = createTypeORMConnection(database, schema);
      }
      this.setDataSource(datasource);
    }
  
    setDataSource(datasource: Promise<DataSource>) {
      this.datasource = datasource;
    }
  
    getDataSource() {
      return this.datasource;
    }
  
    public async getQueryRunner() {
      const datasource = await this.getDataSource();
      return datasource.createQueryRunner();
    }
  
    public async getRepository(entity: ObjectType<any>) {
      if (this.transactionManager) {
        return this.transactionManager.getRepository(entity);
      }
      this.initDatabase();
      const dataSource = await this.getDataSource();
      return dataSource.getRepository(entity);
    }
  
    public async startTransaction() {
      if (this.transactionManager) {
        throw new Error('Ya existe una transacción activa');
      }
  
      if (!this.datasource) {
        this.initDatabase();
      }
      const queryRunner = await this.getQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      this.transactionManager = queryRunner.manager;
      return this.transactionManager;
    }
  
    public async commitTransaction() {
      if (!this.transactionManager) {
        throw new Error('No hay una transacción activa para confirmar');
      }
  
      const queryRunner = this.transactionManager.queryRunner;
      if (!queryRunner) throw new Error('No hay QueryRunner activo');
  
      await queryRunner.commitTransaction();
      await queryRunner.release();
  
      this.transactionManager = null;
    }
  
    public async rollbackTransaction() {
      if (!this.transactionManager) {
        throw new Error('No hay una transacción activa para revertir');
      }
  
      const queryRunner = this.transactionManager.queryRunner;
      if (!queryRunner) throw new Error('No hay QueryRunner activo');
  
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
  
      this.transactionManager = null;
    }
  
    public async releaseTransaction() {
      if (!this.transactionManager) return;
  
      const queryRunner = this.transactionManager.queryRunner;
      if (queryRunner && !queryRunner.isReleased) {
        await queryRunner.release();
      }
      this.transactionManager = null;
    }
  }
  