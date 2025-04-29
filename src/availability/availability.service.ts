import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { Artist } from 'src/artist/entities/artist.entity';
import { Moment } from 'src/moment/entities/moment.entity';

@Injectable()
export class AvailabilityService {
  artistRepository: any;
  constructor(
    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,

    @InjectRepository(Artist)
    private artistRepo: Repository<Artist>,

    @InjectRepository(Moment)
    private momentRepository: Repository<Moment>,
  ) {}

  async create(dto: CreateAvailabilityDto): Promise<Availability> {
    const artist = await this.artistRepo.findOneBy({ id: dto.artistId });
    if (!artist) throw new NotFoundException('Artist not found');

    const overlaps = await this.availabilityRepo.findOne({
      where: {
        artist: { id: dto.artistId },
        startTime: LessThan(new Date(dto.endTime)),
        endTime: MoreThan(new Date(dto.startTime)),
      },
    });

    if (overlaps) {
      throw new BadRequestException(
        'Time slot overlaps with existing availability',
      );
    }

    const availability = this.availabilityRepo.create({
      artist,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    });

    return this.availabilityRepo.save(availability);
  }

  async findAll(
    pageNumber: number,
    limitNumber: number,
  ): Promise<{
    data: Availability[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (pageNumber - 1) * limitNumber;

    const [data, total] = await this.availabilityRepo.findAndCount({
      relations: ['artist'],
      skip,
      take: limitNumber,
      order: { startTime: 'ASC' },
    });

    const totalPages = Math.ceil(total / limitNumber);

    return {
      data,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    };
  }

  // ---------------------------
  async findByArtistId(
    artistId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Availability[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // First, check if the artist exists
    const artist = await this.artistRepo.findOneBy({ id: artistId });
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    // Get all moments for this artist to check against
    const moments = await this.momentRepository.find({
      where: { artist: { id: artistId } },
    });

    // Find availabilities for the artist
    const [allAvailabilities, total] = await this.availabilityRepo.findAndCount(
      {
        where: { artist: { id: artistId } },
        skip,
        take: limit,
        relations: ['artist'],
        order: { startTime: 'ASC' },
      },
    );

    // Filter out time slots that overlap with existing moments
    const availableSlots = allAvailabilities.filter((availability) => {
      // Check if this availability overlaps with any moment
      const isOverlapping = moments.some((moment) => {
        const momentStart = new Date(moment.startDate);
        const momentEnd = new Date(moment.endDate);

        // Check for overlap
        return (
          availability.startTime < momentEnd &&
          availability.endTime > momentStart
        );
      });

      // Only include this availability if it doesn't overlap with any moment
      return !isOverlapping;
    });

    const filteredTotal = availableSlots.length;
    const totalPages = Math.ceil(filteredTotal / limit);

    return {
      data: availableSlots,
      total: filteredTotal,
      page,
      limit,
      totalPages,
    };
  }

  async getArtistAvailableTimes(artistId: string) {
    const artist = await this.artistRepository.findOne({
      where: { id: artistId },
      relations: ['moments'],
    });

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    const now = new Date();

    // Get booked times
    const bookedTimes = artist.moments.map((moment) => {
      const [startHour, startMinute] = moment.startTime.split(':').map(Number);
      const [endHour, endMinute] = moment.endTime.split(':').map(Number);

      const startDateTime = new Date(moment.date);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(moment.date);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      return { start: startDateTime, end: endDateTime };
    });

    // Build available slots (you can customize this more later)
    const availableTimes = bookedTimes.filter(({ start, end }) => {
      return end < now; // show only moments that are already over
    });

    return availableTimes;
  }

  // ---------------------------

  async getArtistBookedTimes(artistId: string): Promise<any[]> {
    // Check if the artist exists
    const artist = await this.artistRepo.findOneBy({ id: artistId });
    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    // Get all booked moments for this artist
    const bookedMoments = await this.momentRepository.find({
      where: { artist: { id: artistId } },
    });

    // Log the first moment to see its structure
    if (bookedMoments.length > 0) {
      console.log('Moment object structure:', JSON.stringify(bookedMoments[0]));
    } else {
      console.log('No moments found for this artist');
    }

    // Return the raw moments first so we can inspect the actual property names
    return bookedMoments;
  }

  async findOne(id: string): Promise<Availability> {
    const availability = await this.availabilityRepo.findOne({
      where: { id },
      relations: ['artist'],
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    return availability;
  }

  async update(id: string, dto: UpdateAvailabilityDto): Promise<Availability> {
    const availability = await this.findOne(id);
    if (!availability) throw new NotFoundException('Availability not found');

    Object.assign(availability, dto);
    return this.availabilityRepo.save(availability);
  }

  async remove(id: string): Promise<void> {
    const result = await this.availabilityRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException('Availability not found');
  }
}
