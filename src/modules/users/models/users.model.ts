import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { Company } from '../../company/models/company.model';
import { Device } from './device.model';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
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
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare first_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare middle_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare last_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare phone_number: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_blocked?: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare token_version?: number;

  @ForeignKey(() => Company)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare company_id: string;

  @BelongsTo(() => Company, 'company_id')
  declare company?: Company;

  @Column({
    type: DataType.ENUM('USER', 'CAMPANY_ADMIN', 'ADMIN'),
    allowNull: false,
    defaultValue: 'USER',
  })
  declare role: string; 

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @HasMany(() => Device, { foreignKey: 'user_id' })
  declare devices?: Device[];
}
