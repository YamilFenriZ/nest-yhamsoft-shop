import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiQuery, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from '../auth/decorators';
import { ValidRoles } from '../auth/interfaces';
import { User } from 'src/auth/entities/user.entity';
import { Product } from './entities';


@ApiTags('Products')
@Controller('products')
//@Auth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Auth() 
  @ApiResponse({ status:201, description: 'Product was created', type: Product })
  @ApiResponse({ status:400, description: 'Bad Request' })
  @ApiResponse({ status:403, description: 'Forbiden. Token related' })
  //@Auth(ValidRoles.admin) 
  create(
    @Body() createProductDto: CreateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.create(createProductDto, user );
  }

  @Get()
  findAll(@Query() paginationDto:PaginationDto ) {
    //console.log(paginationDto);
    return this.productsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productsService.findOnePlain( term );
  }

  @Patch(':id')
  @Auth(ValidRoles.admin) 
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User
  ) {
    return this.productsService.update(id, updateProductDto, user );
  }

  @Delete(':id')
  @Auth(ValidRoles.admin) 
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.productsService.remove( id );
  }

  @Get('supabase/all')
  @ApiResponse({ status: 200, description: 'Products from Supabase retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getSupabaseProducts() {
    return this.productsService.getSupabaseProducts();
  }

  @Get('supabase/featured')
  @ApiResponse({ status: 200, description: 'Featured products retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of products to return' })
  getSupabaseFeaturedProducts(@Query('limit') limit?: number) {
    return this.productsService.getSupabaseFeaturedProducts(limit);
  }

  @Get('supabase/category/:categoryId')
  @ApiResponse({ status: 200, description: 'Products by category retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiParam({ 
    name: 'categoryId', 
    required: true, 
    description: 'Category ID to filter products',
    type: String 
  })
  getSupabaseProductsByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.getSupabaseProductsByCategory(categoryId);
  }

  @Get('supabase/categories')
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  getSupabaseCategories() {
    return this.productsService.getSupabaseCategories();
  }
}
