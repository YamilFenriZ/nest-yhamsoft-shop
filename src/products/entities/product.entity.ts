import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { ProductImage } from "./product-image.entity";
import { User } from "../../auth/entities/user.entity";

@Entity({name: 'products'})
export class Product {
    
    @ApiProperty({
        example: 'f3ce2c82-b9a9-4849-9fa5-c2d9559d0f36',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Golden Watch YhamShop',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    title: string;
    
    @ApiProperty({
        example: 0,
        description: 'Product price',
        minimum: 0        
    })
    @Column('float',{
        default: 0// Valor por defecto
    })
    price: number;

    @ApiProperty({
        example: 'lorem sadfasf asdfasdfasd hrtyhrtyrt rtyrty rtyrt rtyrty',
        description: 'Product description',
        default: 'Descripcion producto'        
    })
    @Column({
        type: 'text',
        nullable: true// propiedad para que se acepten nulos
    })
    description: string;

    @ApiProperty({
        example: 'golden_watch_yhamShop',
        description: 'Product SLUG - for SEO routes',        
        uniqueItems: true
    })
    @Column('text',{
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 12,
        description: 'Product Stock',        
        default: 0        
    })
    @Column('int',{
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['M', 'XL', 'S'],
        description: 'Product Sizes',                
    })
    @Column('text',{
        array: true
    })
    sizes: string[]

    @ApiProperty({
        example: 'man',
        description: 'Product gender',                
    })
    @Column('text')
    gender:string;
    
    @ApiProperty()
    @Column('text',{
        array: true,
        default: []
    })
    tags: string[];

    // images
    @ApiProperty()
    @OneToMany(
        ()=> ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true}        
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true }
    )
    user: User

    @BeforeInsert()
    checkSlugInsert(){
        
        if( !this.slug ){
            this.slug = this.title;            
        }
        this.slug = this.slug.toLowerCase()
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'');
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        
        this.slug = this.slug.toLowerCase()
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'');
    }


}


