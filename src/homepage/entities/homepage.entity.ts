import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Homepage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  subtitle: string;

  @Column()
  heroImage: string;

  @Column()
  ctaText: string;

  @Column('text')
  description: string;

  @Column()
  footerText: string;

  @Column('jsonb')
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}
