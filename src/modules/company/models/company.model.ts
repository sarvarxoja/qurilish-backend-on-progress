import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { User } from '../../users/models/users.model';

@Table({
  tableName: 'companies',
  timestamps: true,
})
export class Company extends Model<
  InferAttributes<Company>,
  InferCreationAttributes<Company>
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: CreationOptional<string>;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare tin: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare document: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare company_created_date: Date;

  @HasMany(() => User, 'company_id')
  declare users: User[];
}
