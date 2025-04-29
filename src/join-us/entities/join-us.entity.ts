import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CategoryType } from 'src/common/enums/category-type.enum';

@Entity()
export class JoinUs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  location: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
  })
  type: CategoryType;

  @Column({ type: 'text' })
  shortBio: string;
}
