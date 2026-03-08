// src/modules/users/models/device.model.ts
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
  BelongsTo,
} from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize';
import { User } from './users.model';

@Table({ tableName: 'devices', timestamps: true })
export class Device extends Model<
  InferAttributes<Device>,
  InferCreationAttributes<Device>
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: CreationOptional<string>;

  @Column({ type: DataType.STRING, allowNull: false })
  declare device_id: string; // Front-end dan keladigan unikal ID

  @Column({ type: DataType.STRING })
  declare deviceName?: string | null;

  @Column({ type: DataType.STRING })
  declare browser?: string | null;

  @Column({ type: DataType.STRING })
  declare os?: string | null;

  @Column({ type: DataType.STRING })
  declare ip?: string | null;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare lastLogin: CreationOptional<Date>;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare user_id: string;

  @BelongsTo(() => User, { foreignKey: 'user_id' })
  declare user?: NonAttribute<User>;
}
