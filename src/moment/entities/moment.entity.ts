import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Artist } from '../../artist/entities/artist.entity';

@Entity()
export class Moment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Category, { eager: true })
  category: Category;

  @ManyToOne(() => Artist, { eager: true })
  artist: Artist;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time', default: '00:00' })
  startTime: string;

  @Column({ type: 'time', default: '00:00' })
  endTime: string;

  @Column()
  location: string;

  @Column({ type: 'text', nullable: true })
  message: string;
  startDate: Date;
  endDate: Date;
  endDateTime: Date;
  startPropertyName: string | number | Date;
  endPropertyName: string | number | Date;
}
