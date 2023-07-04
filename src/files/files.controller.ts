import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from './helpers';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,// Indica que manualmentes se emitira una respuesta
    @Param('imageName') imageName: string
  ){

    const path = this.filesService.getStaticProductImage( imageName );

    //return path;

    res.sendFile( path );

    // res.status(403).json({
    //   ok: false,
    //   path: path
    // });

  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file',{
    fileFilter: fileFilter,
    //limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }) )
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File
  ){

    // El file se enviaria al servicio Cloudinary
    if( !file ){
      throw new BadRequestException('Asegurate que el archivo es una imagen.')
    }

    console.log(file);
    //const secureUrl = `${ file.fieldname }`;
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${ file.filename }`;

    return {
      //fileName: file.originalname
      //fileName: file.originalname
      secureUrl
    };

  }
  
}
