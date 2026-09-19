import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    try {
      const category = await this.prisma.categories.create({
        data: dto,
      });

      return {
        success: true,
        data: category,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException("Bu nomdagi kategoriya allaqachon mavjud");
      }
      throw error;
    }
  }

  async findAll() {
    const categories = await this.prisma.categories.findMany({
      where: {
        status: {
          not: 'DELETED'
        }
      },
      include: {
        courses: true,
      },
    });

    return {
      success: true,
      data: categories,
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.categories.findFirst({
      where: { 
        id,
        status: {
          not: 'DELETED'
        }
      },
      include: {
        courses: true,
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return {
      success: true,
      data: category,
    };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const existing = await this.findOne(id);

    if (!existing) {
      throw new NotFoundException("User not found");
    }

    try {
      const updated = await this.prisma.categories.update({
        where: { id },
        data: dto,
      });

      return {
        success: true,
        data: updated,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException("Bu nomdagi kategoriya allaqachon mavjud");
      }
      throw error;
    }
  }

  async remove(id: number) {
    const existing = await this.prisma.categories.findUnique({
      where: { id },
      include: {
        courses: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        "Category not found  Category has courses Fir",
      );
    }

    if (existing.courses) {
      throw new ConflictException(
        "Category has courses. First you need to delete connected courses then you'll able to delete",
      );
    }

    await this.prisma.categories.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    return {
      success: true,
    };
  }
}
