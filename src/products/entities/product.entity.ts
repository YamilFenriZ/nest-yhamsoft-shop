import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity({name: 'products'})
export class Product {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique: true
    })
    title: string;

    @Column('float',{
        default: 0// Valor por defecto
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true// propiedad para que se acepten nulos
    })
    description: string;

    @Column('text',{
        unique: true
    })
    slug: string;

    @Column('int',{
        default: 0
    })
    stock: number;

    @Column('text',{
        array: true
    })
    sizes: string[]

    @Column('text')
    gender:string;
    
    @Column('text',{
        array: true,
        default: []
    })
    tags: string[];

    // images
    @OneToMany(
        ()=> ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true}        
    )
    images?: ProductImage[];

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


