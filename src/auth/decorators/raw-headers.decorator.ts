
import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
    ( data: string, ctx: ExecutionContext )=>{
        
        // console.log({ data });

        const req = ctx.switchToHttp().getRequest();
        return req.rawHeaders;
        
    }
);