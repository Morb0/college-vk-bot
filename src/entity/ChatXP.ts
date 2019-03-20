import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ChatXP extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vkId: number;

  @Column()
  chatId: number;

  @Column({ default: 0 })
  xp: number;

  @Column({ default: 0 })
  stars: number;
}
