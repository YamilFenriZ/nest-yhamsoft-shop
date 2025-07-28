import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';
import { verify } from 'crypto';

@WebSocketGateway({ cors:true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;
  
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    const token = client.handshake.headers.authentication as string;
    console.log("llego")
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient( client, payload.id );
      
    } catch (error) {
      client.disconnect();
      return;
    }
    //console.log({payload});
    //console.log( 'Cliente conectado: ', client.id )
    

    // client.join('ventas');
    // client.join(client.id);
    // client.join(user.email);
    // this.wss.to('ventas').emit('');

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedCliente() );
    
    //console.log({ Conectados: this.messagesWsService.getConnectedCliente() });
  }

  handleDisconnect(client: Socket) {
    //console.log( "Cliente desconectado: ", client.id );
    this.messagesWsService.removeClient( client.id );
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedCliente() );
    //console.log({ Conectados: this.messagesWsService.getConnectedCliente() });
  }

  // message-from-client

  @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto ){

    // messages-from-server
    //TODO ! Emite unicamente al cliente
    // client.emit('messages-from-server', {
    //   fullName: 'Yhamil el mejor',
    //   message: payload.message || ' no message'
    // });

    //console.log(client.id, payload);

    //TODO ! Emitir a todos MENOS, al cliente inicial
    // client.broadcast.emit('message-from-server',{
    //   fullName: 'Yhamil el mejor',
    //   message: payload.message || ' no message'
    // });

    this.wss.emit('message-from-server',{
      fullName: this.messagesWsService.getUserFullName( client.id ),
      message: payload.message || ' no message'
    });


  }

}
