import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto{


    @ApiProperty({
        default: 10,
        description: 'How many rows do you need'
    })
    @IsOptional()
    @IsPositive()
    // Transformar
    @Type(()=>Number)// enableImplicitConversions: true en pokedex
    limit?: number;

    @ApiProperty({
        default: 0,
        description: 'How many rows do want to skip'
    })
    @IsOptional()
    // @IsPositive()
    @Min(0)
    @Type(()=>Number)// enableImplicitConversions: true en pokedex
    offset?: number;


}