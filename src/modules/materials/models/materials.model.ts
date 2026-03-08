import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'materials',
  timestamps: true,
})
export class Material extends Model<
  InferAttributes<Material>,
  InferCreationAttributes<Material>
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
  declare unit: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare quantity: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare active_quantity: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare date: Date;
}
