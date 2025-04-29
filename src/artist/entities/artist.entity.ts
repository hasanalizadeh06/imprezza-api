import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { Availability } from 'src/availability/entities/availability.entity';
import { IsDecimal, IsInt, Max, Min } from 'class-validator';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('simple-array')
  tags: string[];

  @Column()
  @IsDecimal()
  @Min(1)
  @Max(5)
  stars: number;

  @Column()
  price: string;

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => Category, (category) => category.artists, { eager: true })
  category: Category;

  @Column()
  location: string;

  @OneToMany(() => Availability, (availability) => availability.artist)
  availability: Availability[];
}
