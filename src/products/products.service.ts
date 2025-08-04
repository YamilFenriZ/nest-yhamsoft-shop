import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';
import { User } from 'src/auth/entities/user.entity';
import axios from 'axios';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  private readonly supabaseConfig = {
    baseUrl: process.env.SUPABASE_URL,
    apiKey: process.env.SUPABASE_API_KEY,
    tableName: process.env.SUPABASE_TABLE_NAME
  };

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ){
  }

  async create(createProductDto: CreateProductDto, user:User ) {
    
    try{

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create(
        {
          ...productDetails,
          images: images.map( image => this.productImageRepository.create({url: image})),
          user,
        }
      )
      await this.productRepository.save( product );

      return { ...product, images: images };

    }catch(error){
      //console.log(error)
      this.handleDBExceptions( error );

    }
  }

  async findAll(paginationDto:PaginationDto) {
    const { limit = 3, offset= 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations:{
        images: true,
      }
      
      // TODO: relaciones tablas
    });

    // return products.map(product =>({
    //   ...product,
    //   images: product.images.map( img => img.url )
    // }))
    return products.map(({images, ...rest}) =>({
      ...rest,
      images: images.map( img => img.url )
    }))
  }

  async findOne(term: string) {

    let product: Product;
    if( isUUID(term) ){
      product = await this.productRepository.findOneBy({id:term});
    }else{
      //product = await this.productRepository.findOneBy({slug:term});
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(' UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', "prodImages")
        .getOne();
    }
    
    if( !product ) 
      throw new NotFoundException(`Product with id ${ term } not found`);
    return product;

  }

  async findOnePlain(term: string){
    const { images=[], ...rest } = await this.findOne( term );
    return{
      ...rest,
      images: images.map(image => image.url )
    }
  }

  async update(idProduct: string, updateProductDto: UpdateProductDto, user:User) {

    const {images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id: idProduct,
      ...toUpdate
    });
    
    if(!product)
      throw new NotFoundException(`Product with id: ${ idProduct } not found`);

    // Create QUERY RUNNER
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //Borraremos las imagenes si se envian otras desde el request
      
      if( images ){
        await queryRunner.manager.delete( ProductImage, { product: {id: idProduct}})

        product.images = images.map( 
          image => this.productImageRepository.create({ url: image})
        )
      }
      // else{
      //   // Cargarlo 
      //   product.images = await this.productImageRepository.findBy({ product: {id: idProduct}})
      // }
      product.user = user;

      await queryRunner.manager.save( product );
      //await this.productRepository.save(product);

      // Se hace el commit para que se reflejen los cambios en la bse de datos
      await queryRunner.commitTransaction();
      // se libera el query runner, ya no puede ser utilizado
      await queryRunner.release();
      return this.findOnePlain( idProduct );
      //return product;

      
    } catch (error) {
      // Rollback y limpieza al Query Runner
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne( id );
    await this.productRepository.remove(product);    
  }

  private handleDBExceptions( error: any ){
    if( error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Error inesperado, revise logs del Servidor!');
  }

  async deleteAllProducts(){
    console.log("LLEGO")
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query
      .delete()
      .where({})
      .execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /**
   * Fetches products from Supabase database
   * @returns Promise<any> Array of products from Supabase
   * @throws InternalServerErrorException if there's an error fetching the products
   */
  async getSupabaseProducts() {
    try {
      const response = await axios.get(
        `${this.supabaseConfig.baseUrl}/${this.supabaseConfig.tableName}`,
        {
          headers: this.getSupabaseHeaders()
        }
      );
      return response.data;
    } catch (error) {
      this.handleSupabaseError(error);
    }
  }

  /**
   * Returns the required headers for Supabase API requests
   * @private
   * @returns Object with the necessary headers
   */
  private getSupabaseHeaders() {
    return {
      'apikey': this.supabaseConfig.apiKey,
      'Authorization': `Bearer ${this.supabaseConfig.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Handles errors from Supabase API requests
   * @private
   * @param error - The error object from the failed request
   * @throws InternalServerErrorException with a custom error message
   */
  private handleSupabaseError(error: any) {
    this.logger.error('Error fetching Supabase products', error?.response?.data || error.message);
    throw new InternalServerErrorException('Error fetching products from Supabase');
  }

  /**
   * Fetches featured products from Supabase that are visible and highlighted
   * @param limit Maximum number of products to return
   * @returns Promise<any> Array of featured products from Supabase
   * @throws InternalServerErrorException if there's an error fetching the products
   */
  async getSupabaseFeaturedProducts(limit: number = 3) {
    try {
      const queryParams = new URLSearchParams({
        'select': '*',
        'visible': 'eq.true',
        'destacado': 'eq.true',
        'limit': limit.toString()
      });

      const response = await axios.get(
        `${this.supabaseConfig.baseUrl}/${this.supabaseConfig.tableName}?${queryParams}`,
        {
          headers: this.getSupabaseHeaders()
        }
      );
      return response.data;
    } catch (error) {
      this.handleSupabaseError(error);
    }
  }

  /**
   * Fetches products from Supabase by category ID
   * @param categoryId The category ID to filter products
   * @returns Promise<any> Array of products from Supabase filtered by category
   * @throws InternalServerErrorException if there's an error fetching the products
   */
  async getSupabaseProductsByCategory(categoryId: string) {
    try {
      const queryParams = new URLSearchParams({
        'select': '*',
        'visible': 'eq.true',
        'categoria_id': `eq.${categoryId}`
      });

      const response = await axios.get(
        `${this.supabaseConfig.baseUrl}/${this.supabaseConfig.tableName}?${queryParams}`,
        {
          headers: this.getSupabaseHeaders()
        }
      );
      return response.data;
    } catch (error) {
      this.handleSupabaseError(error);
    }
  }

  /**
   * Fetches categories from Supabase ordered by name
   * @returns Promise<any> Array of categories from Supabase
   * @throws InternalServerErrorException if there's an error fetching the categories
   */
  async getSupabaseCategories() {
    try {
      const queryParams = new URLSearchParams({
        'select': '*',
        'order': 'nombre.asc'
      });

      const response = await axios.get(
        `${this.supabaseConfig.baseUrl}/categorias?${queryParams}`,
        {
          headers: this.getSupabaseHeaders()
        }
      );
      return response.data;
    } catch (error) {
      this.handleSupabaseError(error);
    }
  }
}
