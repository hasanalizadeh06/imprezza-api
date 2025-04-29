import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Artist } from 'src/artist/entities/artist.entity';

@Entity()
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Artist, (artist) => artist.availability, {
    onDelete: 'CASCADE',
  })
  artist: Artist;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;
}
