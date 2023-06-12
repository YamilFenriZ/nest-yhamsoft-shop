import { Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Product } from "./product.entity";


@Entity({name: 'product_images'})
export class ProductImage{

    @PrimaryGeneratedColumn()
    id:number;

    @Column('text')
    url:string;

    @ManyToOne(
        () => Product,
        (product) => product.images,
        { onDelete: 'CASCADE'}
    )
    product: Product


}