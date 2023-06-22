import { Product } from '../../products/entities';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';


@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column('text', {
        unique:true
    })
    email: string;

    @Column('text',{
        select: false
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool',{
        default: true
    })
    isActive: boolean;

    @Column('text',{
        array: true,
        default: ['user']
    })
    roles: string[];

    // Un usuario puede crear varios productos
    // Pero un unico producto va apuntar a un usuario
    @OneToMany(
        () => Product,
        ( product ) => product.user
    )
    product: Product;    

    @BeforeInsert()
    checkFieldsBeforeInsert(){
        this.email =  this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate(){
        this.checkFieldsBeforeInsert();
    }
    


}
